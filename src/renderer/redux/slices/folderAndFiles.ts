import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

export type DirectorySelected = {
  directory: string | null;
  filesInFolder: number;
};

type DirectoryState = {
  folderSelected: DirectorySelected;
};

const initialState: DirectoryState = {
  folderSelected: {
    directory: null,
    filesInFolder: 0,
  },
};

const setFolderSelectedReducer: CaseReducer<
  DirectoryState,
  PayloadAction<DirectorySelected>
> = (state, action) => {
  state.folderSelected = action.payload;
};

export const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    setFolderSelected: setFolderSelectedReducer,
  },
});

export const { setFolderSelected } = directorySlice.actions;

export default directorySlice.reducer;
