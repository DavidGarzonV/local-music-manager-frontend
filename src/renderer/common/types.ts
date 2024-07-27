export interface LocalFile {
  id: number;
  title: string;
  artist: string;
  album: string;
  file_name: string;
  complete_path: string;
  processed?: boolean;
}

export interface LocalSimpleFile {
  id: number;
  file_name: string;
  complete_path: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Playlist {
  title: string;
  playlistId: string;
  thumbnails: Thumbnail[];
}

export interface Artist {
  name: string;
  id: string;
}

export interface YtSong {
  resultType: string;
  videoId: string;
  title: string;
  artists: Artist[];
  album: string;
  thumbnails: Thumbnail[];
  isBestMatch: boolean;
  duration: string;
  fileName: string;
}

export interface SongResult {
  SongIdentifier: number;
  SongTitle: string;
  SongArtist: string;
  SongOriginalName: string;
  SongCompletePath: string;
  SearchResults: {
    BestMatch?: YtSong;
    AdditionalResults: YtSong[];
  };
}

export type SearchParams = {
  limit: number;
  offset: number;
};

export type SessionResponse = {
  Success: boolean;
  Response: {
    access_token: string;
  };
  Error?: string;
};

export type SaveResponse = {
  Success: boolean;
  AddedVideosIds: string[];
  NotAddedVideos: string[];
};

export type FinishLoadDataType = {
  success: boolean;
  totalSongs: number;
  notAddedSongs: string[];
};
