import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { RootState } from '../../../../../redux/store';
import { SongResult, YtSong } from '../../../../../common/types';
import SelectedSong from '../selected-song';

export default function SelectedResult(props: SongResult) {
  const { SongIdentifier, SearchResults, SongOriginalName } = props;

  const renderedSong = useRef('');
  const elementSelected = useRef<HTMLDivElement>(null);
  const [currentSong, setCurrentSong] = useState<YtSong>();

  const selectedSong = useSelector((state: RootState) =>
    state.results.selectedBySong.find(
      (item) => item.identifier === SongIdentifier,
    ),
  );

  useEffect(() => {
    let selected = SearchResults.BestMatch;
    const hasSelectedValue = renderedSong.current !== '';

    if (selectedSong) {
      const foundElement = SearchResults.AdditionalResults.find(
        (item) => item.videoId === selectedSong.videoId,
      );
      if (foundElement) {
        selected = foundElement;
      }
    }

    if (hasSelectedValue && renderedSong.current !== selected?.videoId) {
      elementSelected.current?.classList.add('fadein');
      setTimeout(() => {
        elementSelected.current?.classList.remove('fadein');
      }, 1000);
    }

    renderedSong.current = selected?.videoId ?? '';
    setCurrentSong(selected);
  }, [selectedSong, SearchResults, SongIdentifier]);

  if (!currentSong) {
    return <div>No hay coincidencias</div>;
  }

  return (
    <div
      className="flex gap-2 align-items-center animation-duration-500"
      ref={elementSelected}
    >
      <i
        className="pi pi-check-circle"
        style={{
          color: 'var(--green-600)',
        }}
      />
      <SelectedSong {...currentSong} fileName={SongOriginalName} />
    </div>
  );
}
