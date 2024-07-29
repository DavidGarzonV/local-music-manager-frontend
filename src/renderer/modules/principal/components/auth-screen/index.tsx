import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

import fetchRequest from '../../../../utils/fetch';
import Loading from '../../../../components/loading';

import { setIsConfigured, setLoggedIn } from '../../../../redux/slices/login';
import { removeItem, setValue } from '../../../../utils/ls';
import { SessionResponse } from '../../../../common/types';
import { setLoadingApp } from '../../../../redux/slices/loading';
import getLabel from '../../../../utils/lang';
import logo from '../../../../../../assets/icon.png';

import './styles.scss';

type GetAuthorizationResponse = {
  Success: boolean;
  Response: {
    url: string;
  };
};

export default function AuthScreen() {
  const authUrl = useRef('');
  const errorCode = useRef('');
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);
  const [showReconfigure, setShowReconfigure] = useState<boolean>(false);

  const [waitingConfirmation, setWaitingConfirmation] =
    useState<boolean>(false);
  const eventDefined = useRef(false);
  const dispatch = useDispatch();

  const loginGoogle = () => {
    window.electron.ipcRenderer.sendMessage('open-web', authUrl.current);
    setWaitingConfirmation(true);
    setTimeout(() => {
      setShowReconfigure(true);
    }, 3000);
  };

  const saveAccessToken = useCallback(
    (data?: SessionResponse) => {
      if (!data?.Success) {
        if (data?.Error === 'ConnectionError') {
          errorCode.current = 'ConnectionError';
        }
        setError(true);
        dispatch(setLoggedIn(false));
        removeItem('accessToken');
      } else {
        dispatch(setLoggedIn(true));
        setValue('accessToken', data!.Response.access_token);
      }
      setLoadingLogin(false);
    },
    [dispatch],
  );

  const createSession = useCallback(
    async (code: string, state: string) => {
      setWaitingConfirmation(false);
      dispatch(setLoadingApp(true));
      errorCode.current = '';
      const data = await fetchRequest<SessionResponse>('auth/session', {
        method: 'POST',
        body: {
          code,
          state,
        },
      });
      saveAccessToken(data);
    },
    [dispatch, saveAccessToken],
  );

  const configureAgain = () => {
    setWaitingConfirmation(false);
    dispatch(setLoggedIn(false));
    dispatch(setIsConfigured(false));
  };

  useEffect(() => {
    if (!eventDefined.current) {
      window.electron.ipcRenderer.on('auth-response', (deepLinkUrl) => {
        setLoadingLogin(true);

        const splitUrl = (deepLinkUrl as string).split(
          'local-music-manager://open/?',
        );
        const urlParams = new URLSearchParams(splitUrl[1]);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state) {
          createSession(code, state);
        }
      });
      eventDefined.current = true;
    }
  }, [createSession]);

  useEffect(() => {
    const getAuthorizationUrl = async () => {
      setLoading(true);
      const data = await fetchRequest<GetAuthorizationResponse>('auth/login', {
        method: 'POST',
      });

      if (!data?.Response.url || !data.Success) {
        setError(true);
      } else {
        authUrl.current = data.Response.url;
      }

      setLoading(false);
    };

    getAuthorizationUrl();
  }, []);

  return (
    <div className="login">
      <div className="flex flex-column align-content-center justify-content-center text-center p-8">
        <h1>Local Music Manager</h1>
        <div className="flex justify-content-center align-content-center">
          <img src={logo} alt="Logo" width={150} height={150} />
        </div>

        <h2>{getLabel('login.loginFirst')}</h2>
        {loading && (
          <div className="mt-3 flex flex-row align-items-center justify-content-center">
            <Loading />
            <span>{getLabel('login.loading')}</span>
          </div>
        )}

        {loadingLogin && (
          <div className="mt-3 flex flex-row align-items-center justify-content-center">
            <Loading />
            <span>{getLabel('login.loadingSignIn')}</span>
          </div>
        )}

        {error && (
          <Message
            severity="error"
            text={
              errorCode.current === 'ConnectionError'
                ? getLabel('login.errorAccount')
                : getLabel('login.error')
            }
          />
        )}

        {!error && !loadingLogin && !loading && (
          <div>
            <Button
              icon="pi pi-google"
              label={getLabel('login.login')}
              onClick={loginGoogle}
            />
          </div>
        )}

        {waitingConfirmation && (
          <div className="mt-3 flex flex-row align-items-center justify-content-center">
            <Loading />
            <span>{getLabel('login.waitingConfirmation')}</span>
          </div>
        )}

        {showReconfigure && (
          <div>
            <Button
              icon="pi pi-cog"
              label={getLabel('configure.configure')}
              onClick={configureAgain}
              severity="secondary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
