import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { Divider } from 'primereact/divider';

import { YtSong } from '../../../../../common/types';
import {
  getArtistsName,
  getDetailImage,
  getThumbnailImage,
} from '../../../../../utils';

import './styles.scss';
import PlayOnYTMusic from '../../../../../components/play-on-ytmusic';
import getLabel from '../../../../../utils/lang';

const tooltipTemplate = (props: YtSong) => {
  const { artists, title, thumbnails, album, duration, videoId } = props;
  const image = getDetailImage(thumbnails);

  return (
    <div>
      <div className="selected-song-details flex gap-2 flex-row align-items-center">
        <div className="cover">
          {image && <Avatar size="xlarge" image={image} />}
        </div>
        <div className="song-details text-left">
          <div>
            <strong>{getLabel('song.name')}:</strong> {title}
          </div>
          <div>
            <strong>{getLabel('song.artists')}:</strong>{' '}
            {getArtistsName(artists ?? [])}
          </div>
          <div>
            <strong>{getLabel('song.album')}:</strong> {album}
          </div>
          <div>
            <strong>{getLabel('song.duration')}:</strong> {duration}
          </div>
        </div>
      </div>
      <Divider />
      <PlayOnYTMusic videoId={videoId} />
    </div>
  );
};

export default function SelectedSong(props: YtSong) {
  const { artists, title, thumbnails, videoId } = props;
  const [visible, setVisible] = useState(false);

  const image = getThumbnailImage(thumbnails);

  return (
    <>
      <Dialog
        visible={visible}
        style={{ width: '35vw' }}
        onHide={() => setVisible(false)}
        header={getLabel('song.songDetails')}
        closeOnEscape
        dismissableMask
      >
        {tooltipTemplate(props)}
      </Dialog>

      <div
        className={`selected-song flex align-items-center gap-2 video-${videoId}`}
        onClick={() => setVisible(true)}
        onKeyDown={() => setVisible(true)}
        role="button"
        tabIndex={0}
        title={getLabel('songResults.seeMore')}
      >
        {image && <Avatar size="large" image={image} />}
        <div>
          <span className="block mb-1">{title}</span>
          <span className="block">{getArtistsName(artists ?? [])}</span>
        </div>
      </div>
    </>
  );
}
