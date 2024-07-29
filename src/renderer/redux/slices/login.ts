import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

type LoginState = {
  loggedIn: boolean;
  lang: string;
  isConfigured: boolean
};

const initialState: LoginState = {
  loggedIn: false,
  lang: 'en',
  isConfigured: true
};

const setLoginReducer: CaseReducer<LoginState, PayloadAction<boolean>> = (
  state,
  action,
) => {
  state.loggedIn = action.payload;
};

const setIsConfiguredReducer: CaseReducer<LoginState, PayloadAction<boolean>> = (
  state,
  action,
) => {
  state.isConfigured = action.payload;
};

const setLangReducer: CaseReducer<LoginState, PayloadAction<string>> = (
  state,
  action,
) => {
  state.lang = action.payload;
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoggedIn: setLoginReducer,
    setLang: setLangReducer,
    setIsConfigured: setIsConfiguredReducer
  },
});

export const { setLoggedIn, setLang, setIsConfigured } = loginSlice.actions;

export default loginSlice.reducer;
