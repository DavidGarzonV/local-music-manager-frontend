import { Column } from 'primereact/column';
import {
  DataTable,
  DataTableExpandedRows,
  DataTableSelectionMultipleChangeEvent,
} from 'primereact/datatable';
import { Message } from 'primereact/message';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button } from 'primereact/button';
import { SongResult } from '../../../common/types';
import {
  selectResultForSong,
  selectVideos,
} from '../../../redux/slices/results';
import ResultExpansionTemplate from './components/result-expansion-template';
import SelectedSong from './components/selected-song';
import SelectedResult from './components/selected-result';

import SearchOnYTMusic from '../../../components/search-on-ytmusic';

import './styles.scss';
import SearchOnLocal from '../../../components/search-on-local';
import getLabel from '../../../utils/lang';

type SearchResultsProps = {
  songs: SongResult[];
  rowsToShow: number;
};

const bestMatchTemplate = (data: SongResult) => {
  const bestMach = data.SearchResults.BestMatch;
  if (!bestMach) {
    return <div>{getLabel('songResults.noResults')}</div>;
  }

  return <SelectedSong {...bestMach} />;
};

export default function SearchSongsResults(props: SearchResultsProps) {
  const { songs, rowsToShow } = props;
  const selectedVideoIds = useRef<Record<string, string>>({});
  const dispatch = useDispatch();

  const [selectedSongs, setSelectedSongs] = useState<SongResult[]>([]);
  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

  const setVideosFromSongs = useCallback(
    (songsSelected: SongResult[]) => {
      const videos = songsSelected
        .filter((item) => !!item.SearchResults.BestMatch)
        .map((item) => ({
          identifier: item.SongIdentifier,
          videoId: item.SearchResults.BestMatch!.videoId,
        }));
      dispatch(selectVideos(videos));
    },
    [dispatch],
  );

  const selectSongs = (
    e: DataTableSelectionMultipleChangeEvent<SongResult[]>,
  ) => {
    const selected = e.value;

    setVideosFromSongs(selected);
    setSelectedSongs(selected);
  };

  const setExpandableRows = (data: DataTableExpandedRows) => {
    setExpandedRows(data as DataTableExpandedRows);
  };

  const expandItem = (item: SongResult) => {
    const newExpanded = { ...expandedRows };
    const expanded = !newExpanded[item.SongIdentifier];
    if (expanded) {
      newExpanded[item.SongIdentifier] = true;
    } else if (newExpanded[item.SongIdentifier] !== undefined) {
      delete newExpanded[item.SongIdentifier];
    }

    setExpandableRows(newExpanded);
  };

  const onSelectMatch = (identifier: number, videoId: string) => {
    selectedVideoIds.current[identifier] = videoId;

    const newExpanded = { ...expandedRows };
    delete newExpanded[identifier];

    setExpandableRows(newExpanded);
    dispatch(
      selectResultForSong({
        identifier,
        videoId,
      }),
    );
  };

  useEffect(() => {
    setSelectedSongs(songs);
    setVideosFromSongs(songs);
  }, [songs, setVideosFromSongs, dispatch]);

  if (songs.length === 0) {
    return (
      <Message
        className="border-primary w-full justify-content-start"
        severity="warn"
        content={<span>No hay resultados</span>}
      />
    );
  }

  return (
    <div className="search-results">
      <DataTable
        value={songs}
        dataKey="SongIdentifier"
        sortField="SongTitle"
        tableStyle={{ minWidth: '50rem' }}
        selectionMode="checkbox"
        selection={selectedSongs}
        onSelectionChange={selectSongs}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandableRows(e.data as DataTableExpandedRows)}
        rowExpansionTemplate={(item) => (
          <ResultExpansionTemplate
            onSelectMatch={onSelectMatch}
            {...item}
            selected={
              selectedVideoIds.current[item.SongIdentifier] ?? undefined
            }
          />
        )}
        rows={rowsToShow}
        emptyMessage={getLabel('songResults.noSongs')}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column expander style={{ width: '5rem' }} />
        <Column
          header={getLabel('song.nameSong')}
          style={{ width: '40%' }}
          body={(item: SongResult) => (
            <Button
              link
              onClick={() => expandItem(item)}
              title={`${getLabel('songResults.additionalResultsFor')}: ${
                item.SongTitle
              } - ${item.SongArtist}`}
            >
              {item.SongTitle} - {item.SongArtist}
            </Button>
          )}
        />
        <Column
          header={getLabel('songResults.selectedResult')}
          body={SelectedResult}
          style={{ width: '20%' }}
        />
        <Column
          header={getLabel('songResults.bestMatch')}
          body={bestMatchTemplate}
          style={{ width: '20%' }}
        />
        <Column
          header={getLabel('search')}
          body={(item: SongResult) => (
            <div>
              <div className="mb-2">
                <SearchOnYTMusic
                  artist={item.SongArtist}
                  title={item.SongTitle}
                />
              </div>
              <div>
                <SearchOnLocal completePath={item.SongCompletePath} />
              </div>
            </div>
          )}
          style={{ width: '20%' }}
        />
      </DataTable>
    </div>
  );
}
