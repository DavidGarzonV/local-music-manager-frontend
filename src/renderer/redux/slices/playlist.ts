import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Playlist } from '../../common/types';

type PlaylistsState = {
  playlist: Playlist | null;
};

const initialState: PlaylistsState = {
  playlist: null,
};

const setPlaylistIdReducer: CaseReducer<
  PlaylistsState,
  PayloadAction<Playlist | null>
> = (state, action) => {
  state.playlist = action.payload;
};

export const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setPlaylistId: setPlaylistIdReducer,
  },
});

export const { setPlaylistId } = playlistSlice.actions;

export default playlistSlice.reducer;
