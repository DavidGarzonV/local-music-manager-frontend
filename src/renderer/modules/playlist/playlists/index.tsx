import { useDispatch, useSelector } from 'react-redux';
import { Message } from 'primereact/message';

import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import PlaylistItem from '../playlist-Item';
import SelectableItem from '../../../components/selectable-item';
import { Playlist } from '../../../common/types';

import Loading from '../../../components/loading';
import { setPlaylistId } from '../../../redux/slices/playlist';

import './styles.scss';
import {
  setFinishLoad,
  setFinishedSearch,
} from '../../../redux/slices/results';
import { RootState } from '../../../redux/store';
import fetchRequest from '../../../utils/fetch';
import NewPlayListForm, { PlaylistData } from './new-playlist-form';
import HelpTemplate from '../../../components/help-template';
import { setIsLastSearch } from '../../../redux/slices/steps';
import getLabel from '../../../utils/lang';
import { getPlaylistImage } from '../../../utils';

export default function Playlists() {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingSave, setLoadingSave] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const playlistSelected = useSelector(
    (state: RootState) => state.playlist.playlist,
  );

  const onSelectPlaylist = (playlistId: string) => {
    if (!playlists) return;

    const playlist = playlists.find((item) => item.playlistId === playlistId);
    if (playlist) {
      dispatch(setPlaylistId(playlist));
      dispatch(setFinishedSearch(false));
      dispatch(setIsLastSearch(false));
      dispatch(setFinishLoad(false));
    }
  };

  const getPlaylists = async () => {
    setLoading(true);

    const data = await fetchRequest<{
      Success: boolean;
      Playlists: Playlist[];
    }>('playlists');

    if (!data?.Success) {
      setError(true);
    }

    setPlaylists(data?.Playlists ?? []);
    setLoading(false);
  };

  const savePlaylist = async (dataForm: PlaylistData) => {
    setLoadingSave(true);

    const data = await fetchRequest<{ Success: boolean }>('playlists', {
      method: 'POST',
      body: dataForm,
    });
    setLoadingSave(false);

    if (data?.Success) {
      setVisibleForm(false);
      getPlaylists();
    }
  };

  useEffect(() => {
    getPlaylists();
  }, []);

  useEffect(() => {
    if (!playlistSelected) {
      document
        .querySelectorAll('.playlists .selectable-item')
        .forEach((item) => item.classList.remove('selected'));
    }
  }, [playlistSelected]);

  if (error) {
    return (
      <Message
        className="border-primary w-full justify-content-start"
        severity="error"
        content={<span>{getLabel('error')}</span>}
      />
    );
  }

  return (
    <section>
      <HelpTemplate identifier="playlists">
        <p>{getLabel('helps.playlist')}</p>
      </HelpTemplate>

      {isLoading && (
        <div className="mt-3 flex flex-row align-items-center justify-content-center">
          <Loading />
          <span>{getLabel('playlist.searching')}</span>
        </div>
      )}

      <div className="playlists">
        {!isLoading &&
          playlists &&
          playlists.map((item) => (
            <SelectableItem
              key={item.playlistId}
              identifier={item.playlistId}
              parentClass="playlists"
              onSelectItem={onSelectPlaylist}
              title={getLabel('playlist.select')}
            >
              <PlaylistItem name={item.title} image={getPlaylistImage(item)} />
            </SelectableItem>
          ))}
      </div>

      <Dialog
        header={getLabel('playlist.create')}
        visible={visibleForm}
        style={{ width: '50vw' }}
        onHide={() => setVisibleForm(false)}
      >
        {isLoadingSave && (
          <div className="flex align-items-center justify-content-center">
            <Loading />
          </div>
        )}
        {visibleForm && !isLoadingSave && (
          <NewPlayListForm onSave={savePlaylist} />
        )}
      </Dialog>

      <div
        className="flex justify-content-center align-content-center mt-2 gap-1"
        hidden={isLoading}
      >
        <Button
          label={getLabel('playlist.create')}
          severity="secondary"
          icon="pi pi-plus"
          onClick={() => setVisibleForm(true)}
        />

        <Button
          label={getLabel('reload')}
          severity="secondary"
          icon="pi pi-refresh"
          onClick={getPlaylists}
        />
      </div>
    </section>
  );
}
