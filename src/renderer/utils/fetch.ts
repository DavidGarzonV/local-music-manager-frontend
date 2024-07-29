import { confirmDialog } from 'primereact/confirmdialog';
import { sendLogToApp } from '.';
import { setIsConfigured, setLoggedIn } from '../redux/slices/login';
import store from '../redux/store';
import { getValue, removeItem, setValue } from './ls';
import { SessionResponse } from '../common/types';

type EnabledFetchValues = string | object | boolean | number;

type FetchOptions = {
  queryParams?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, EnabledFetchValues | Array<EnabledFetchValues>>;
  abortController?: AbortController;
};

const getApiPath = (path: string): string => {
  const baseURL = process.env.BACKEND_URL;
  const finalUrl = `${baseURL}/${path}`;

  return finalUrl;
};

// eslint-disable-next-line no-undef
const simpleRefreshToken = async () => {
  const savedToken = getValue('accessToken');
  if (!savedToken) {
    return;
  }

  const refreshToken: SessionResponse = await fetch(
    getApiPath('auth/refresh'),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${savedToken}`,
      },
      method: 'POST',
    },
  ).then((fetchResponse) => fetchResponse.json());

  if (refreshToken?.Success) {
    setValue('accessToken', refreshToken.Response.access_token);
  }
};

let attempts = 0;

const fetchRequest = async <T>(
  path: string,
  options?: FetchOptions,
): Promise<T | undefined> => {
  // eslint-disable-next-line no-undef
  const fetchOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: options?.method || 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
  };

  const savedToken = getValue('accessToken');
  if (savedToken && savedToken !== '') {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${savedToken}`,
    };
  }

  if (options?.abortController) {
    fetchOptions.signal = options.abortController.signal;
  }

  let finalPath = getApiPath(path);

  if (options?.queryParams) {
    const queryParams = new URLSearchParams(options.queryParams);
    finalPath = `${finalPath}?${queryParams}`;
  }

  const promiseResult = await fetch(finalPath, fetchOptions)
    .then(async (res) => {
      if (res.status === 400 && res.url.includes('auth/login')) {
        store.dispatch(setLoggedIn(false));
        store.dispatch(setIsConfigured(false));
        return undefined;
      }

      if (res.status === 401 || res.statusText === 'UNAUTHORIZED') {
        if (attempts === 0) {
          attempts += 1;

          await simpleRefreshToken();
          return fetchRequest(path, options);
        }

        attempts = 0;
        confirmDialog({
          message: 'Debe iniciar sesión para continuar',
          defaultFocus: 'accept',
          header: 'Debe iniciar sesión',
          icon: 'pi pi-info-circle',
          blockScroll: true,
          closable: false,
          closeOnEscape: false,
          closeIcon: null,
          rejectClassName: 'hidden',
          acceptLabel: 'Aceptar',
          accept: () => {
            removeItem('accessToken');
            store.dispatch(setLoggedIn(false));
          },
        });
      }
      attempts = 0;

      if (!res.ok) {
        sendLogToApp(`Error request, status: ${res.statusText}`);
        throw new Error(res.statusText);
      }

      return res.json() as T;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.info('Error request ->');
      // eslint-disable-next-line no-console
      console.error(error);
      return undefined;
    });

  return promiseResult as T;
};

export default fetchRequest;
