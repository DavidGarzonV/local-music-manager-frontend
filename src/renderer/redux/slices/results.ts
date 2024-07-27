import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';

export type VideoData = {
  identifier: number;
  videoId: string;
};

type ResultsState = {
  selectedBySong: VideoData[];
  selectedVideos: VideoData[];
  finishedSearch: boolean;
  finishLoad: boolean;
};

const initialState: ResultsState = {
  selectedBySong: [],
  selectedVideos: [],
  finishedSearch: false,
  finishLoad: false,
};

const selectResultForSongReducer: CaseReducer<
  ResultsState,
  PayloadAction<VideoData>
> = (state, action) => {
  const { identifier } = action.payload;

  const selectedSongs = state.selectedBySong.filter(
    (song) => song.identifier !== identifier,
  );

  selectedSongs.push({
    identifier,
    videoId: action.payload.videoId,
  });

  state.selectedBySong = selectedSongs;
};

const selectVideosReducer: CaseReducer<
  ResultsState,
  PayloadAction<VideoData[]>
> = (state, action) => {
  state.selectedVideos = action.payload;
};

const setFinishedSearchReducer: CaseReducer<
  ResultsState,
  PayloadAction<boolean>
> = (state, action) => {
  state.finishedSearch = action.payload;
};

const resetVideosSelectionReducer: CaseReducer<
  ResultsState,
  PayloadAction<void>
> = (state) => {
  state.selectedVideos = [];
  state.selectedBySong = [];
};

const setFinishLoadReducer: CaseReducer<
  ResultsState,
  PayloadAction<boolean>
> = (state, action) => {
  state.finishLoad = action.payload;
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    selectResultForSong: selectResultForSongReducer,
    selectVideos: selectVideosReducer,
    setFinishedSearch: setFinishedSearchReducer,
    resetVideosSelection: resetVideosSelectionReducer,
    setFinishLoad: setFinishLoadReducer,
  },
});

export const {
  selectResultForSong,
  selectVideos,
  setFinishedSearch,
  resetVideosSelection,
  setFinishLoad,
} = resultsSlice.actions;

export default resultsSlice.reducer;
