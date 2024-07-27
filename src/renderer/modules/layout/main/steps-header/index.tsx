import { Chip } from 'primereact/chip';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { RootState } from '../../../../redux/store';
import getLabel from '../../../../utils/lang';

export default function StepsHeader() {
  const selectedPlaylist = useSelector(
    (state: RootState) => state.playlist.playlist,
  );
  const folderSelected = useSelector(
    (state: RootState) => state.folderAndFiles.folderSelected,
  );

  const goToYt = () => {
    window.electron.ipcRenderer.sendMessage(
      'open-web',
      'https://music.youtube.com/library/playlists',
    );
  };

  return (
    <div className="flex justify-content-between align-items-center mb-3 ">
      <div className="steps-header flex flex-row gap-2 flex-wrap">
        <div className="details-item">
          <strong>{getLabel('folder')}: </strong>
          <Chip
            label={folderSelected.directory ? folderSelected.directory : 'None'}
          />
        </div>
        <div className="details-item">
          <strong>{getLabel('menuItems.playlist')}: </strong>
          <Chip label={selectedPlaylist ? selectedPlaylist.title : 'None'} />
        </div>
      </div>
      <div>
        <Button
          icon="pi pi-external-link"
          label={getLabel('goToYt')}
          link
          onClick={goToYt}
        />
      </div>
    </div>
  );
}
