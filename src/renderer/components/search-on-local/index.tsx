import { Button } from 'primereact/button';
import getLabel from '../../utils/lang';

type SearchOnLocalProps = {
  completePath: string;
};

export default function SearchOnLocal({ completePath }: SearchOnLocalProps) {
  const searchOnLocal = () => {
    window.electron.ipcRenderer.sendMessage('search-local', completePath);
  };

  return (
    <Button
      icon="pi pi-external-link"
      label={getLabel('songResults.searchOnLocal')}
      link
      onClick={searchOnLocal}
    />
  );
}
