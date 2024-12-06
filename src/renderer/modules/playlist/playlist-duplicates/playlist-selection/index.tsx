import { useCallback, useEffect, useRef, useState } from 'react';
import { Playlist } from '../../../../common/types';
import Loading from '../../../../components/loading';
import SelectableItem from '../../../../components/selectable-item';
import { getPlaylistImage } from '../../../../utils';
import fetchRequest from '../../../../utils/fetch';
import getLabel from '../../../../utils/lang';
import PlaylistItem from '../../playlist-Item';

type PlaylistSelectionProps = {
  setEnableSongs: (enable: boolean) => void;
  onSelectPlaylist: (playlistId: string, playListName: string) => void;
  visible: boolean;
};

export default function PlaylistSelection({
  setEnableSongs,
  onSelectPlaylist,
  visible,
}: PlaylistSelectionProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const playlistsLoaded = useRef<Playlist[]>([]);

  const getPlaylists = useCallback(async () => {
    const data = await fetchRequest<{
      Success: boolean;
      Playlists: Playlist[];
    }>('playlists');

    if (data?.Success) {
      setPlaylists(data.Playlists);
      playlistsLoaded.current = data.Playlists;
      setEnableSongs(true);
    }
  }, [setEnableSongs]);

  useEffect(() => {
    const startComponent = async () => {
      setLoading(true);
      await getPlaylists();
      setLoading(false);
    };

    if (visible) {
      if (playlistsLoaded.current.length === 0) {
        startComponent();
      } else {
        setPlaylists(playlistsLoaded.current);
        setEnableSongs(true);
      }
    }
  }, [visible, getPlaylists, setEnableSongs]);

  return (
    <div className="flex justify-content-center">
      {loading ? (
        <div className="flex align-items-center">
          <Loading />
          <span>{getLabel('playlistDuplicates.searching')}</span>
        </div>
      ) : (
        <div className="flex flex-wrap justify-content-center playlists">
          {playlists.map((item) => (
            <SelectableItem
              key={item.playlistId}
              identifier={item.playlistId}
              parentClass="playlists"
              onSelectItem={() => onSelectPlaylist(item.playlistId, item.title)}
              title={getLabel('playlist.select')}
            >
              <PlaylistItem name={item.title} image={getPlaylistImage(item)} />
            </SelectableItem>
          ))}
        </div>
      )}
    </div>
  );
}
