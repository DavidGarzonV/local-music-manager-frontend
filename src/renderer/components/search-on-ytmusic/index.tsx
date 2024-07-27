import { Button } from 'primereact/button';
import { searchOnYt } from '../../utils';
import getLabel from '../../utils/lang';

type SearchOnYTMusicProps = {
  title: string;
  artist: string;
};

export default function SearchOnYTMusic(props: SearchOnYTMusicProps) {
  const { artist, title } = props;

  return (
    <Button
      icon="pi pi-external-link"
      label={getLabel('songResults.searchOnYt')}
      title={getLabel('songResults.searchOnYt')}
      link
      onClick={() => searchOnYt(artist, title)}
    />
  );
}
