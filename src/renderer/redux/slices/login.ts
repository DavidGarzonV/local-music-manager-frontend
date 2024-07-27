import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

type LoginState = {
  loggedIn: boolean;
};

const initialState: LoginState = {
  loggedIn: false,
};

const setLoginReducer: CaseReducer<LoginState, PayloadAction<boolean>> = (
  state,
  action,
) => {
  state.loggedIn = action.payload;
};

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoggedIn: setLoginReducer,
  },
});

export const { setLoggedIn } = loginSlice.actions;

export default loginSlice.reducer;
