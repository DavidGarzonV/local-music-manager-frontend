import { Button } from 'primereact/button';
import getLabel from '../../utils/lang';

type PlayOnYTMusicProps = {
  videoId: string;
};

export default function PlayOnYTMusic(props: PlayOnYTMusicProps) {
  const { videoId } = props;

  const searchParams = new URLSearchParams({
    v: videoId,
  });

  const playOnYt = () => {
    const finalUrl = `https://music.youtube.com/watch?${searchParams}`;
    window.electron.ipcRenderer.sendMessage('open-web', finalUrl);
  };

  return (
    <Button
      icon="pi pi-external-link"
      label={getLabel('songResults.playOnYt')}
      onClick={playOnYt}
    />
  );
}
