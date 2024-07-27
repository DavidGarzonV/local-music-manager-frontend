import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { YtSong } from '../../common/types';

type SongsState = {
  totalSongs: number;
  totalManagedSongs: number;
  alreadyInList: string[];
  notAddedAlreadyInList: string[];
  notAddedSongs: string[];
  searchResults: YtSong[];
};

type LoadResultsData = {
  totalSongs: number;
  notAddedSongs: string[];
};

const initialState: SongsState = {
  totalSongs: 0,
  alreadyInList: [],
  notAddedAlreadyInList: [],
  notAddedSongs: [],
  searchResults: [],
  totalManagedSongs: 0,
};

const addToLoadResultsReducer: CaseReducer<
  SongsState,
  PayloadAction<LoadResultsData>
> = (state, action) => {
  const { totalSongs, notAddedSongs } = action.payload;

  state.notAddedSongs = [
    ...new Set([...state.notAddedSongs, ...notAddedSongs]),
  ];

  state.totalSongs += totalSongs;
  state.totalManagedSongs += totalSongs + notAddedSongs.length;
};

const resetSongResultsReducer: CaseReducer<SongsState, PayloadAction<void>> = (
  state,
) => {
  state.totalSongs = 0;
  state.totalManagedSongs = 0;
  state.alreadyInList = [];
  state.notAddedSongs = [];
  state.searchResults = [];
  state.notAddedAlreadyInList = [];
};

const setSearchResultsReducer: CaseReducer<
  SongsState,
  PayloadAction<YtSong[]>
> = (state, action) => {
  state.searchResults = [...state.searchResults, ...action.payload];
};

const setAlreadyInListReducer: CaseReducer<
  SongsState,
  PayloadAction<string[]>
> = (state, action) => {
  state.alreadyInList = [
    ...new Set([...state.alreadyInList, ...action.payload]),
  ];
};

const setNotAddedAlreadyInListReducer: CaseReducer<
  SongsState,
  PayloadAction<string[]>
> = (state, action) => {
  state.notAddedAlreadyInList = [
    ...new Set([...state.notAddedAlreadyInList, ...action.payload]),
  ];
};

export const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    addToLoadResults: addToLoadResultsReducer,
    resetSongResults: resetSongResultsReducer,
    setAlreadyInList: setAlreadyInListReducer,
    setSearchResults: setSearchResultsReducer,
    setNotAddedAlreadyInList: setNotAddedAlreadyInListReducer,
  },
});

export const {
  addToLoadResults,
  resetSongResults,
  setSearchResults,
  setAlreadyInList,
  setNotAddedAlreadyInList,
} = songsSlice.actions;

export default songsSlice.reducer;
