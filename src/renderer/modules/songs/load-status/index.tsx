import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { DataView } from 'primereact/dataview';

import { RootState } from '../../../redux/store';
import SearchOnYTMusic from '../../../components/search-on-ytmusic';
import { getArtistsName } from '../../../utils/index';
import SelectedSong from '../search-songs-results/components/selected-song';
import { YtSong } from '../../../common/types';
import MessageTemplate from '../../../components/message-template';
import getLabel from '../../../utils/lang';

type ResultLoadSong = YtSong & { artist: string };

export default function LoadStatus() {
  const totalSongs = useSelector((state: RootState) => state.songs.totalSongs);
  const notAddedAlreadyInList = useSelector(
    (state: RootState) => state.songs.notAddedAlreadyInList,
  );
  const notAddedSongs = useSelector(
    (state: RootState) => state.songs.notAddedSongs,
  );
  const searchResults = useSelector(
    (state: RootState) => state.songs.searchResults,
  );
  const playlist = useSelector((state: RootState) => state.playlist.playlist);

  const openPlaylist = useCallback(() => {
    if (playlist) {
      const searchParams = new URLSearchParams({
        list: playlist.playlistId,
      });

      window.electron.ipcRenderer.sendMessage(
        'open-web',
        `https://music.youtube.com/playlist?${searchParams}`,
      );
    }
  }, [playlist]);

  const getSongsByVideos = useCallback(
    (videoIds: string[]): ResultLoadSong[] => {
      if (searchResults.length === 0) {
        return [];
      }

      const results: ResultLoadSong[] = [];
      for (let index = 0; index < videoIds.length; index++) {
        const videoId = videoIds[index];
        const result = searchResults.find((item) => item.videoId === videoId)!;

        if (result) {
          const { artists, ...rest } = result;
          results.push({
            ...rest,
            artist: artists ? getArtistsName(artists) : '',
          });
        }
      }

      const resultsSorted = [...results].sort((a, b) => {
        if (a.artist === b.artist) {
          return a.title.localeCompare(b.title);
        }
        return a.artist.localeCompare(b.artist);
      });

      return resultsSorted;
    },
    [searchResults],
  );

  return (
    <div className="loading-songs">
      <h4 className="text-color-secondary">
        {getLabel('loadStatus.processResults')}:
      </h4>

      <div className="mt-3 flex flex-column justify-content-center align-items-center">
        <Message
          style={{
            border: 'solid #696cff',
            borderWidth: '0 0 0 6px',
            color: '#696cff',
          }}
          className="border-primary w-full justify-content-start"
          severity="success"
          content={() => (
            <MessageTemplate icon="pi-check-circle" severity="success">
              <>
                <strong className="mb-2">
                  {totalSongs === 1
                    ? getLabel('loadStatus.oneAddedSong')
                    : `${totalSongs} ${getLabel('loadStatus.totalAddedSongs')}`}
                </strong>
                <strong className="mb-2">
                  {notAddedAlreadyInList.length === 1
                    ? getLabel('loadStatus.oneDuplicatedSong')
                    : `${notAddedAlreadyInList.length} ${getLabel(
                        'loadStatus.totalDuplicatedSongs',
                      )}`}
                </strong>
                <strong className="mb-2">
                  {notAddedSongs.length === 1
                    ? getLabel('loadStatus.oneNotAddedSong')
                    : `${notAddedSongs.length} ${getLabel(
                        'loadStatus.totalNotAddedSongs',
                      )}`}
                </strong>
                <Button
                  icon="pi pi-external-link"
                  label={getLabel('loadStatus.openPlaylist')}
                  onClick={openPlaylist}
                  size="small"
                  severity="secondary"
                />
              </>
            </MessageTemplate>
          )}
        />
      </div>

      <Divider />

      <div>
        <Accordion>
          <AccordionTab
            header={`${getLabel('loadStatus.duplicatedOnList')}: ${
              notAddedAlreadyInList.length
            }`}
          >
            <div>
              <DataView
                value={getSongsByVideos(notAddedAlreadyInList)}
                emptyMessage={getLabel('loadStatus.noSongs')}
                itemTemplate={(item) => (
                  <div className="col-6 p-2">
                    <SelectedSong {...item} />
                  </div>
                )}
                paginator
                rows={6}
              />
            </div>
          </AccordionTab>
          <AccordionTab
            header={`${getLabel('loadStatus.notAddedSongs')}: ${
              notAddedSongs.length
            }`}
          >
            <div>
              <DataTable
                value={getSongsByVideos(notAddedSongs)}
                paginator
                emptyMessage={getLabel('loadStatus.noSongs')}
                rows={6}
              >
                <Column field="artist" header={getLabel('localFiles.artist')} />
                <Column field="title" header={getLabel('form.name')} />
                <Column
                  field="fileName"
                  header={getLabel('localFiles.fileName')}
                />
                <Column
                  header={getLabel('search')}
                  body={(item) => (
                    <SearchOnYTMusic artist={item.artists} title={item.title} />
                  )}
                />
              </DataTable>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </div>
  );
}
