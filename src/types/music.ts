export interface Song {
  id: string;
  userId: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  trackNumber?: number;
  genre?: string;
  year?: number;
  duration: number; // in seconds
  fileSize: number; // bytes
  mimeType: string;
  artworkUrl?: string; // Data URL or Object URL
  audioBlob: Blob;
  createdAt: number;
  filePath?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artworkUrl?: string;
  songCount: number;
  year?: number;
}

export interface Artist {
  name: string;
  songCount: number;
  albumCount: number;
  artworkUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  storageLimitBytes: number;
}

export interface UploadProgressItem {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'parsing' | 'saving' | 'completed' | 'error' | 'duplicate';
  errorMessage?: string;
}

export type ViewMode = 'dashboard' | 'library' | 'albums' | 'album-detail' | 'artists' | 'upload';

export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'createdAt';
export type SortDirection = 'asc' | 'desc';
