import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

type LoginState = {
  loggedIn: boolean;
  lang: string;
};

const initialState: LoginState = {
  loggedIn: false,
  lang: 'en',
};

const setLoginReducer: CaseReducer<LoginState, PayloadAction<boolean>> = (
  state,
  action,
) => {
  state.loggedIn = action.payload;
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
  },
});

export const { setLoggedIn, setLang } = loginSlice.actions;

export default loginSlice.reducer;
