import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../../redux/store';
import fetchRequest from '../../../utils/fetch';
import { FinishLoadDataType, SaveResponse } from '../../../common/types';
import { encodeBase64, saveLocalJSONFile } from '../../../utils';
import {
  setAlreadyInList,
  setNotAddedAlreadyInList,
} from '../../../redux/slices/songs';

type AddSongsProps = {
  finishLoadSongs: (data: FinishLoadDataType) => void;
};

export default function AddSongs({ finishLoadSongs }: AddSongsProps) {
  const selectedCustomSongs = useSelector(
    (state: RootState) => state.results.selectedBySong,
  );
  const selectedVideos = useSelector(
    (state: RootState) => state.results.selectedVideos,
  );
  const alreadyInList = useSelector(
    (state: RootState) => state.songs.alreadyInList,
  );

  const playlist = useSelector((state: RootState) => state.playlist.playlist);
  const localFiles = useSelector((state: RootState) => state.files.localFiles);
  const dispatch = useDispatch();

  const getSongsList = useCallback(() => {
    const songsList: string[] = [];
    const customIdentifiers = selectedCustomSongs.map(
      (item) => item.identifier,
    );

    const songsSearched: number[] = [];
    const notAddedBecauseAlreadyInList: string[] = [];

    for (let index = 0; index < selectedVideos.length; index++) {
      const selectedVideo = selectedVideos[index];
      let videoId: null | string = null;
      let identifier: null | number = null;

      if (customIdentifiers.includes(selectedVideo.identifier)) {
        const customSong = selectedCustomSongs.find(
          (item) => item.identifier === selectedVideo.identifier,
        );
        if (customSong?.videoId) {
          videoId = customSong.videoId;
          identifier = customSong.identifier;
        }
      } else {
        videoId = selectedVideo.videoId;
        identifier = selectedVideo.identifier;
      }

      if (videoId && identifier) {
        if (alreadyInList.includes(videoId)) {
          notAddedBecauseAlreadyInList.push(videoId);
        } else {
          songsList.push(videoId);
        }
        songsSearched.push(identifier);
      }
    }

    return {
      songsList,
      notAddedBecauseAlreadyInList,
      songsSearched,
    };
  }, [selectedVideos, selectedCustomSongs, alreadyInList]);

  const saveProcessedSongs = useCallback(
    (songsList: number[]) => {
      const filesProcessed = localFiles
        .filter((localFile) => songsList.includes(localFile.id))
        .map((item) => encodeBase64(encodeURIComponent(item.complete_path)));

      saveLocalJSONFile('processed', filesProcessed, true);
    },
    [localFiles],
  );

  useEffect(() => {
    const addSongsToPlaylist = async () => {
      const { songsList, songsSearched, notAddedBecauseAlreadyInList } =
        getSongsList();

      if (songsList.length === 0) {
        saveProcessedSongs(songsSearched);

        finishLoadSongs({
          totalSongs: 0,
          notAddedSongs: [],
          success: true,
        });
        return;
      }
      dispatch(setNotAddedAlreadyInList(notAddedBecauseAlreadyInList));

      const data = await fetchRequest<SaveResponse>('songs/save-songs', {
        method: 'POST',
        body: {
          playlist_id: playlist!.playlistId,
          songs: songsList,
        },
      });

      if (data && data.Success) {
        saveProcessedSongs(songsSearched);
        dispatch(setAlreadyInList(data.AddedVideosIds));

        finishLoadSongs({
          totalSongs: data.AddedVideosIds.length,
          notAddedSongs: data.NotAddedVideos,
          success: data.Success,
        });
      }
    };

    if ((selectedCustomSongs.length > 0, playlist?.playlistId)) {
      addSongsToPlaylist();
    }
  }, [
    finishLoadSongs,
    selectedCustomSongs,
    playlist,
    getSongsList,
    saveProcessedSongs,
    dispatch,
  ]);

  return <div style={{ display: 'none' }} />;
}
