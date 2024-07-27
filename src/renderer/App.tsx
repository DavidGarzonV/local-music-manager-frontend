import { Provider } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';

import store from './redux/store';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primeflex/themes/primeone-light.css';

import './App.scss';
import Principal from './modules/principal';

export default function App() {
  return (
    <PrimeReactProvider>
      <Provider store={store}>
        <Principal />
      </Provider>
    </PrimeReactProvider>
  );
}
