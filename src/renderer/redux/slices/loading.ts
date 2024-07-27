import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

type LoadingState = {
  loadingSearch: boolean;
  loadingApp: boolean;
};

const initialState: LoadingState = {
  loadingSearch: false,
  loadingApp: true,
};

const setLoadingSearchReducer: CaseReducer<
  LoadingState,
  PayloadAction<boolean>
> = (state, action) => {
  state.loadingSearch = action.payload;
};

const setLoadingAppReducer: CaseReducer<
  LoadingState,
  PayloadAction<boolean>
> = (state, action) => {
  state.loadingApp = action.payload;
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoadingSearch: setLoadingSearchReducer,
    setLoadingApp: setLoadingAppReducer,
  },
});

export const { setLoadingSearch, setLoadingApp } = loadingSlice.actions;

export default loadingSlice.reducer;
