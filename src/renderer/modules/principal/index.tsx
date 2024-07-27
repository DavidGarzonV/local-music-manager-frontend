import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmDialog } from 'primereact/confirmdialog';

import { RootState } from '../../redux/store';
import { setLoggedIn } from '../../redux/slices/login';
import Header from '../layout/header';
import Main from '../layout/main';
import Footer from '../layout/footer';
import AuthScreen from './components/auth-screen';
import NetworkStatus from '../../components/network-status';
import { getValue, removeItem, setValue } from '../../utils/ls';
import { setLoadingApp } from '../../redux/slices/loading';
import fetchRequest from '../../utils/fetch';
import { SessionResponse } from '../../common/types';
import Loading from '../../components/loading';
import logo from '../../../../assets/icon.png';
import getLabel from '../../utils/lang';

type CheckResponse = {
  Success: boolean;
};

export default function Principal() {
  // eslint-disable-next-line no-undef
  const refreshInterval = useRef<NodeJS.Timeout>();
  const loadingApp = useSelector(
    (state: RootState) => state.loading.loadingApp,
  );
  const loggedIn = useSelector((state: RootState) => state.login.loggedIn);
  const dispatch = useDispatch();

  const refreshToken = useCallback(async () => {
    const data = await fetchRequest<SessionResponse>('auth/refresh', {
      method: 'POST',
    });

    if (data?.Success) {
      setValue('accessToken', data!.Response.access_token);
    } else {
      removeItem('accessToken');
      dispatch(setLoggedIn(false));
    }
  }, [dispatch]);

  const createIntervalForRefresh = useCallback(() => {
    const intervalTime = Number(process.env.REFRESH_INTERVAL ?? 5) * 60 * 1000;
    refreshInterval.current = setInterval(() => {
      refreshToken();
    }, intervalTime);
  }, [refreshToken]);

  useEffect(() => {
    const validateLogindAndRefresh = async () => {
      if (loggedIn) {
        dispatch(setLoadingApp(true));
        createIntervalForRefresh();
      } else if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      dispatch(setLoadingApp(false));
    };

    validateLogindAndRefresh();
  }, [loggedIn, createIntervalForRefresh, refreshToken, dispatch]);

  useEffect(() => {
    const checkConnection = async () => {
      const currentToken = getValue<string>('accessToken');

      let hasLoggedIn = false;
      if (currentToken) {
        dispatch(setLoadingApp(true));
        const response = await fetchRequest<CheckResponse>('auth/check', {
          method: 'POST',
          body: {
            accessToken: currentToken,
          },
        });
        hasLoggedIn = !!response?.Success;
        if (!hasLoggedIn) {
          removeItem('accessToken');
        }
        dispatch(setLoadingApp(false));
      }

      dispatch(setLoggedIn(hasLoggedIn));
    };
    checkConnection();
  }, [dispatch]);

  return (
    <div className="principal-container">
      <ConfirmDialog />
      <NetworkStatus />
      {!loadingApp ? (
        <>
          {!loggedIn && <AuthScreen />}
          {loggedIn && (
            <div className="App">
              <Header />
              <Main />
              <Footer />
            </div>
          )}
        </>
      ) : (
        <div className="mt-3 flex align-items-center justify-content-center flex-column">
          <img src={logo} alt="Logo" width={200} height={200} />
          <div className="flex flex-row align-items-center justify-content-center">
            <Loading />
            <span>{getLabel('loading')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
