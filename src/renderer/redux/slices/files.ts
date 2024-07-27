import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { LocalFile } from '../../common/types';

type FilesState = {
  localFiles: LocalFile[];
  selectedLocalFiles: LocalFile[];
};

const initialState: FilesState = {
  localFiles: [],
  selectedLocalFiles: [],
};

const setLocalFilesReducer: CaseReducer<
  FilesState,
  PayloadAction<LocalFile[]>
> = (state, action) => {
  state.localFiles = action.payload;
};

const setSelectedLocalFilesReducer: CaseReducer<
  FilesState,
  PayloadAction<LocalFile[]>
> = (state, action) => {
  state.selectedLocalFiles = action.payload;
};

const resetFilesSelectionReducer: CaseReducer<
  FilesState,
  PayloadAction<void>
> = (state) => {
  state.selectedLocalFiles = [];
  state.localFiles = [];
};

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setLocalFiles: setLocalFilesReducer,
    setSelectedLocalFiles: setSelectedLocalFilesReducer,
    resetFilesSelection: resetFilesSelectionReducer,
  },
});

export const { setLocalFiles, setSelectedLocalFiles, resetFilesSelection } =
  filesSlice.actions;

export default filesSlice.reducer;
