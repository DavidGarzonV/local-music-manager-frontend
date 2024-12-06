import { Avatar } from 'primereact/avatar';
import { Column } from 'primereact/column';
import {
  DataTable,
  DataTableFilterMeta,
  DataTableFilterMetaData,
} from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import {
  ChangeEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { PlaylistSong } from '../../../../common/types';
import HelpTemplate from '../../../../components/help-template';
import Loading from '../../../../components/loading';
import PlayOnYTMusic from '../../../../components/play-on-ytmusic';
import { getArtistsName, getThumbnailImage } from '../../../../utils';
import fetchRequest from '../../../../utils/fetch';
import getLabel from '../../../../utils/lang';

type PlayListSongsProps = {
  visible: boolean;
  playlistId: string;
  playlistName: string;
  loadedPlaylist: MutableRefObject<string>;
  onSelectSongs: (songs: PlaylistSong[]) => void;
};

export default function PlayListSongs({
  visible,
  playlistId,
  playlistName,
  onSelectSongs,
  loadedPlaylist,
}: PlayListSongsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSongs, setSelectedSongs] = useState<PlaylistSong[]>([]);
  const savedSongs = useRef<PlaylistSong[]>([]);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const thumbnailTemplate = (data: PlaylistSong) => {
    const image = getThumbnailImage(data.thumbnails);
    return (
      <div>
        {image ? (
          <Avatar size="large" image={image} />
        ) : (
          <Avatar size="large" label={data.title[0]} />
        )}
      </div>
    );
  };

  const selectSongs = (e: PlaylistSong[]) => {
    setSelectedSongs(e);
    onSelectSongs(e);
  };

  const getSongs = useCallback(async () => {
    if (savedSongs.current?.length === 0) {
      setLoading(true);
      const data = await fetchRequest<{
        Success: boolean;
        Songs: PlaylistSong[];
      }>(`playlists/songs/${playlistId}`);

      if (data?.Success) {
        savedSongs.current = data.Songs;
        setLoading(false);
      }
    }
    loadedPlaylist.current = playlistId;
  }, [playlistId, loadedPlaylist]);

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const _filters = { ...filters };

    (_filters.global as DataTableFilterMetaData).value = value;
    setFilters(_filters);
  };

  useEffect(() => {
    if (visible) {
      if (loadedPlaylist.current !== playlistId) {
        savedSongs.current = [];
        getSongs();
      }
    }
  }, [visible, getSongs, playlistId, loadedPlaylist]);

  return (
    <div className="playlist-songs">
      {loading ? (
        <div className="flex justify-content-center">
          <div className="flex align-items-center">
            <Loading />
            <span>{getLabel('playlistDuplicates.searchingSongs')}</span>
          </div>
        </div>
      ) : (
        <div>
          <HelpTemplate identifier="playlistDuplicates">
            <p>{getLabel('helps.playlistDuplicates')}</p>
          </HelpTemplate>
          <Divider />
          <Message
            content={
              <>
                <strong>{getLabel('menuItems.playlist')}:&nbsp;</strong>
                <span>{playlistName}</span>
              </>
            }
            severity="secondary"
          />
          <Divider />
          <div className="flex align-content-center justify-content-center">
            <div className="datatable-playlist-songs">
              <DataTable
                value={savedSongs.current}
                selectionMode={null}
                selection={selectedSongs}
                onSelectionChange={(e) => selectSongs(e.value)}
                dataKey="videoId"
                paginator
                rows={15}
                rowsPerPageOptions={[15, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                scrollable
                scrollHeight="500px"
                filters={filters}
                filterDisplay="row"
                header={() => (
                  <div className="p-inputgroup p-inputgroup w-20rem">
                    <span className="p-inputgroup-addon">
                      <i className="pi pi-search" />
                    </span>
                    <InputText
                      value={
                        (filters.global as DataTableFilterMetaData)?.value || ''
                      }
                      onChange={onGlobalFilterChange}
                      placeholder={getLabel('playlistDuplicates.searchSongs')}
                    />
                  </div>
                )}
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: '3rem' }}
                />
                <Column
                  field="thumbnail"
                  header={getLabel('song.cover')}
                  body={thumbnailTemplate}
                />
                <Column field="title" header={getLabel('song.nameSong')} />
                <Column
                  field="artists"
                  body={(song: PlaylistSong) => getArtistsName(song.artists)}
                  header={getLabel('localFiles.artist')}
                />
                <Column
                  header={getLabel('songResults.playOnYt')}
                  body={(song: PlaylistSong) => (
                    <PlayOnYTMusic videoId={song.videoId} />
                  )}
                />
              </DataTable>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
