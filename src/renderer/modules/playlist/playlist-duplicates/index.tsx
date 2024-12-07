import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Steps } from 'primereact/steps';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PlaylistSong } from '../../../common/types';
import fetchRequest from '../../../utils/fetch';
import getLabel from '../../../utils/lang';
import PlaylistSelection from './playlist-selection';
import PlayListSongs from './playlist-songs';
import './styles.scss';
import Loading from '../../../components/loading';

type PlaylistDuplicatesProps = {
  visibleChange: boolean;
  changeVisible: (visible: boolean) => void;
};

const items = [
  {
    label: 'Playlists',
  },
  {
    label: 'Songs',
  },
];

export default function PlaylistDuplicates({
  visibleChange,
  changeVisible,
}: PlaylistDuplicatesProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [enableSongs, setEnableSongs] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [playlistSelected, setPlaylistSelected] = useState<string>('');
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

  const songsSelected = useRef<PlaylistSong[]>([]);
  const playlistName = useRef<string>('');
  const loadedPlaylist = useRef<string>('');

  const deleteSongsFromPlaylist = useCallback(async () => {
    setLoadingDelete(true);
    const data = await fetchRequest<{ Success: boolean }>(
      `playlists/songs/${playlistSelected}`,
      {
        method: 'DELETE',
        body: {
          songs: songsSelected.current.map((song) => ({
            videoId: song.videoId,
            setVideoId: song.setVideoId,
          })),
        },
      },
    );

    if (data?.Success) {
      songsSelected.current = [];
      loadedPlaylist.current = '';
      setActiveIndex(0);
    }
    setLoadingDelete(false);
  }, [playlistSelected]);

  const deleteSongs = () => {
    confirmDialog({
      message: getLabel('playlistDuplicates.deleteMessage'),
      defaultFocus: 'accept',
      header: getLabel('playlistDuplicates.deleteHeader'),
      icon: 'pi pi-info-circle',
      blockScroll: true,
      closable: true,
      closeOnEscape: true,
      closeIcon: null,
      rejectLabel: getLabel('cancel'),
      acceptLabel: getLabel('accept'),
      accept: () => {
        deleteSongsFromPlaylist();
      },
    });
  };

  const onSelectSongs = (songs: PlaylistSong[]) => {
    songsSelected.current = songs;
  };

  useEffect(() => {
    setVisible(visibleChange);
  }, [visibleChange]);

  useEffect(() => {
    if (!playlistSelected) {
      document
        .querySelectorAll('.playlists .selectable-item')
        .forEach((item) => item.classList.remove('selected'));
    }
  }, [playlistSelected]);

  return (
    <Dialog
      header={getLabel('playlistDuplicates.title')}
      visible={visible}
      onHide={() => {
        setVisible(false);
        changeVisible(false);
        setPlaylistSelected('');
      }}
      closable
      closeOnEscape={false}
      dismissableMask
      maximized
      className="playlist-duplicates"
    >
      <div className="playlists-dialog-content">
        <div className="steps-header-body">
          <Steps model={items} activeIndex={activeIndex} readOnly />
        </div>

        <div className="steps-content-body">
          <div hidden={activeIndex !== 0}>
            <PlaylistSelection
              setEnableSongs={setEnableSongs}
              onSelectPlaylist={(pl, pn) => {
                playlistName.current = pn;
                setPlaylistSelected(pl);
              }}
              visible={activeIndex === 0}
            />
          </div>
          <div hidden={activeIndex !== 1 || loadingDelete}>
            <PlayListSongs
              visible={activeIndex === 1}
              playlistId={playlistSelected}
              playlistName={playlistName.current}
              onSelectSongs={onSelectSongs}
              loadedPlaylist={loadedPlaylist}
            />
          </div>
          <div
            className="flex justify-content-center align-content-center"
            hidden={!loadingDelete}
          >
            <div className="flex align-items-center">
              <Loading />
              <span>{getLabel('playlistDuplicates.deletingSongs')}</span>
            </div>
          </div>
        </div>

        <div className="flex playlists-footer justify-content-end">
          {activeIndex === 1 && (
            <Button
              icon="pi pi-angle-left"
              label={getLabel('steps.previous')}
              onClick={() => setActiveIndex(0)}
              style={{ marginRight: '1rem' }}
              severity="secondary"
            />
          )}
          {activeIndex === 0 && (
            <Button
              icon="pi pi-angle-right"
              label={getLabel('playlistDuplicates.check')}
              disabled={!enableSongs || !playlistSelected}
              onClick={() => setActiveIndex(1)}
            />
          )}
          {activeIndex === 1 && (
            <Button
              icon="pi pi-trash"
              severity="danger"
              label={getLabel('delete')}
              onClick={deleteSongs}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
