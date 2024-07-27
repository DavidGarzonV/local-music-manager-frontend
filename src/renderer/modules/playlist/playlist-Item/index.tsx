import { Avatar } from 'primereact/avatar';
import './styles.scss';
import React from 'react';

type PlayListItemProps = {
  name: string;
  image?: string;
};

export default function PlaylistItem(
  props: PlayListItemProps,
): React.JSX.Element {
  const { name, image } = props;

  if (!name) {
    return <div />;
  }

  return (
    <div className="playlist-item">
      {image && <Avatar image={image} size="xlarge" />}
      {!image && <Avatar label={name[0]} size="xlarge" />}

      <div className="details">
        <span title={name}>{name}</span>
      </div>
    </div>
  );
}
