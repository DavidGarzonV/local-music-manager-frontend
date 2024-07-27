import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

export type StepsWithHelp =
  | 'localfiles-help'
  | 'directory-help'
  | 'search-files-help'
  | 'playlists-help';

export type ClosedHelps = Partial<Record<StepsWithHelp, boolean | undefined>>;

type StepsState = {
  activeIndex: number;
  closedHelps: ClosedHelps;
  isLastSearch: boolean;
};

const initialState: StepsState = {
  activeIndex: 0,
  closedHelps: {
    'localfiles-help': false,
    'directory-help': false,
    'search-files-help': false,
    'playlists-help': false,
  },
  isLastSearch: false,
};

const setActiveIndexReducer: CaseReducer<StepsState, PayloadAction<number>> = (
  state,
  action,
) => {
  state.activeIndex = action.payload;
};

const setIsLastSearchReducer: CaseReducer<
  StepsState,
  PayloadAction<boolean>
> = (state, action) => {
  state.isLastSearch = action.payload;
};

const setClosedHelpsReducer: CaseReducer<
  StepsState,
  PayloadAction<ClosedHelps>
> = (state, action) => {
  state.closedHelps = {
    ...state.closedHelps,
    ...action.payload,
  };
};

export const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    setActiveIndex: setActiveIndexReducer,
    setClosedHelps: setClosedHelpsReducer,
    setIsLastSearch: setIsLastSearchReducer,
  },
});

export const { setActiveIndex, setClosedHelps, setIsLastSearch } =
  stepsSlice.actions;

export default stepsSlice.reducer;
