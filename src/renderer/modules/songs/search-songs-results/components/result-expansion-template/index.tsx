import { Avatar } from 'primereact/avatar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import { useState, useEffect } from 'react';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { SongResult, YtSong } from '../../../../../common/types';
import {
  getArtistsName,
  getThumbnailImage,
  searchOnYt,
} from '../../../../../utils';
import getLabel from '../../../../../utils/lang';

type ResultExpansionTemplateProps = {
  onSelectMatch: (identifier: number, videoId: string) => void;
  selected?: string;
} & SongResult;

const artistsTemplate = (data: YtSong) => {
  return <div>{getArtistsName(data.artists ?? [])}</div>;
};

const resultTypeTemplate = (data: YtSong) => {
  return <div>{data.resultType === 'song' ? 'Canción' : 'Video'}</div>;
};

const thumbnailTemplate = (data: YtSong) => {
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

const titleTemplate = (data: YtSong) => {
  return (
    <div>
      <span>{data.title}</span>
      <br />
      {data.isBestMatch && (
        <Chip
          className="mt-2"
          label="Mejor coincidencia"
          icon="pi pi-check-circle"
          style={{
            color: 'var(--green-700)',
          }}
        />
      )}
    </div>
  );
};

export default function ResultExpansionTemplate(
  props: ResultExpansionTemplateProps,
) {
  const {
    SearchResults,
    SongIdentifier,
    SongOriginalName,
    onSelectMatch,
    selected,
  } = props;
  const [selectedResult, setSelectedResult] = useState<YtSong | null>(null);

  useEffect(() => {
    const results = SearchResults.AdditionalResults;
    if (results.length) {
      if (selected) {
        const selectedValue = results.find((item) => item.videoId === selected);
        if (selectedValue) {
          setSelectedResult(selectedValue);
        }
      } else {
        const bestMatch = results.find((item) => item.isBestMatch);
        if (bestMatch) {
          setSelectedResult(bestMatch);
        }
      }
    }
  }, [SearchResults, selected]);

  return (
    <div className="p-2">
      <p className="m-0 mb-2">
        <strong>
          {getLabel('songResults.additionalResultsFor')} {SongOriginalName}
        </strong>
      </p>
      <p className="m-0 mb-3">
        <Button
          icon="pi pi-external-link"
          label={getLabel('songResults.searchOnYt')}
          link
          title={getLabel('songResults.searchWithOriginalName')}
          onClick={() =>
            searchOnYt('', SongOriginalName.split('.').shift() ?? '')
          }
        />
      </p>
      <DataTable
        value={SearchResults.AdditionalResults}
        selectionMode="single"
        emptyMessage={getLabel('songResults.noSongs')}
        onRowSelect={(e) => {
          onSelectMatch(SongIdentifier, e.data.videoId);
        }}
        selection={selectedResult}
        onSelectionChange={(e) => {
          if (e.value) {
            setSelectedResult(e.value as YtSong);
          }
        }}
      >
        <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
        <Column header={getLabel('song.cover')} body={thumbnailTemplate} />
        <Column header={getLabel('song.type')} body={resultTypeTemplate} />
        <Column header={getLabel('song.title')} body={titleTemplate} />
        <Column header={getLabel('song.artists')} body={artistsTemplate} />
        <Column header={getLabel('song.album')} field="album" />
        <Column header={getLabel('song.duration')} field="duration" />
      </DataTable>
    </div>
  );
}
