import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './slices/playlist';
import filesReducer from './slices/files';
import folderAndFilesReducer from './slices/folderAndFiles';
import resultsReducer from './slices/results';
import loadingReducer from './slices/loading';
import loginReducer from './slices/login';
import songsReducer from './slices/songs';
import stepsReducer from './slices/steps';

const store = configureStore({
  reducer: {
    playlist: playlistReducer,
    files: filesReducer,
    folderAndFiles: folderAndFilesReducer,
    results: resultsReducer,
    loading: loadingReducer,
    login: loginReducer,
    songs: songsReducer,
    steps: stepsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
