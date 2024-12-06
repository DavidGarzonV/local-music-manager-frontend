import { Artist, Playlist, Thumbnail } from '../common/types';

export const getArtistsName = (artists: Artist[]): string => {
  return artists.map((item) => item.name)?.join(', ');
};

export const getThumbnailImage = (thumbnails: Thumbnail[]): string | null => {
  const newThumbs = [...thumbnails];
  newThumbs.sort((a, b) => {
    if (a.width && b.width) {
      return b.width - a.width;
    }
    return 0;
  });

  return thumbnails.length > 0 ? thumbnails[0].url : null;
};

export const getDetailImage = (thumbnails: Thumbnail[]): string | null => {
  const newThumbs = [...thumbnails];
  newThumbs.sort((a, b) => {
    if (a.width && b.width) {
      return b.width + b.height - (a.width + a.height);
    }
    return 0;
  });

  return newThumbs.length > 0 ? newThumbs[0].url : null;
};

export const sendLogToApp = (params: string) => {
  window.electron.ipcRenderer.sendMessage('send-log', `[Renderer] ${params}`);
};

const removeExtensionFromFilename = (fileName: string): string => {
  const splitted = fileName.split('.');
  return splitted.shift() ?? '';
};

export const getTitleAndArtistFromFileName = (fileName: string) => {
  let artist = '';
  let title = '';
  const fileNameClear = removeExtensionFromFilename(fileName);

  let splitted: string[] = [];

  if (fileNameClear.includes('-')) {
    splitted = fileNameClear.split('-');
  } else {
    splitted = fileNameClear.split(' ');
  }

  artist = splitted.shift() ?? '';
  title = splitted.join(' ').trim();

  return {
    title,
    artist: artist.trim(),
  };
};

export const saveLocalJSONFile = (
  fileName: string,
  jsonData: Record<string, string | number>[] | string[],
  appendData: boolean = false,
) => {
  window.electron.ipcRenderer.sendMessage('save-file', {
    name: fileName,
    data: JSON.stringify(jsonData),
    append: appendData,
  });
};

export const sendEventToGetLocalJSONFile = (fileName: string) => {
  window.electron.ipcRenderer.sendMessage('get-file', fileName);
};

export const searchOnYt = (artist: string, title: string) => {
  const searchParams = new URLSearchParams({
    q: `${artist} ${title}`,
  });

  const finalUrl = `https://music.youtube.com/search?${searchParams}`;
  window.electron.ipcRenderer.sendMessage('open-web', finalUrl);
};

export const encodeBase64 = (data: string) => {
  return btoa(data);
};

export const decodeBase64 = (data: string) => {
  return atob(data);
};

export const getPlaylistImage = (playlist: Playlist): string | undefined => {
  if (playlist.thumbnails.length > 0) {
    return playlist.thumbnails[0].url;
  }

  return undefined;
};
