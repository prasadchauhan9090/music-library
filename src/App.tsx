import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PersistentPlayer } from './components/player/PersistentPlayer';
import { FolderUploader } from './components/upload/FolderUploader';

import { DashboardView } from './components/views/DashboardView';
import { LibraryView } from './components/views/LibraryView';
import { AlbumsView } from './components/views/AlbumsView';
import { AlbumDetailView } from './components/views/AlbumDetailView';
import { ArtistsView } from './components/views/ArtistsView';

import type { Song, Album, Artist, ViewMode } from './types/music';
import { getSongsForUser, deleteSong as deleteSongFromDB, clearUserLibrary, getRecentlyPlayedSongs } from './services/db';
import { loadSampleSongsForUser } from './services/sampleData';

const MainAppContent: React.FC = () => {
  const { user, updateStorageUsed } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedAlbumName, setSelectedAlbumName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshLibrary = useCallback(async () => {
    if (!user) return;
    try {
      const userSongs = await getSongsForUser(user.id);
      setSongs(userSongs);

      const recent = await getRecentlyPlayedSongs(user.id, 8);
      setRecentlyPlayed(recent);

      const totalBytes = userSongs.reduce((acc, s) => acc + s.fileSize, 0);
      updateStorageUsed(totalBytes);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateStorageUsed]);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const albums = useMemo<Album[]>(() => {
    const albumMap = new Map<string, { artist: string; artworkUrl?: string; songs: Song[] }>();

    songs.forEach((song) => {
      const albumName = song.album || 'Unknown Album';
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, {
          artist: song.albumArtist || song.artist,
          artworkUrl: song.artworkUrl,
          songs: [],
        });
      }
      const entry = albumMap.get(albumName)!;
      entry.songs.push(song);
      if (!entry.artworkUrl && song.artworkUrl) {
        entry.artworkUrl = song.artworkUrl;
      }
    });

    const list: Album[] = [];
    albumMap.forEach((val, name) => {
      list.push({
        id: `album_${name.replace(/\s+/g, '_')}`,
        name,
        artist: val.artist,
        artworkUrl: val.artworkUrl,
        songCount: val.songs.length,
      });
    });

    return list;
  }, [songs]);

  const artists = useMemo<Artist[]>(() => {
    const artistMap = new Map<string, { songs: Song[]; albums: Set<string>; artworkUrl?: string }>();

    songs.forEach((song) => {
      const artistName = song.artist || 'Unknown Artist';
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {
          songs: [],
          albums: new Set(),
          artworkUrl: song.artworkUrl,
        });
      }
      const entry = artistMap.get(artistName)!;
      entry.songs.push(song);
      entry.albums.add(song.album);
      if (!entry.artworkUrl && song.artworkUrl) {
        entry.artworkUrl = song.artworkUrl;
      }
    });

    const list: Artist[] = [];
    artistMap.forEach((val, name) => {
      list.push({
        name,
        songCount: val.songs.length,
        albumCount: val.albums.size,
        artworkUrl: val.artworkUrl,
      });
    });

    return list;
  }, [songs]);

  const handleDeleteSong = async (songId: string) => {
    await deleteSongFromDB(songId);
    await refreshLibrary();
  };

  const handleClearLibrary = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to clear your entire song library?')) {
      await clearUserLibrary(user.id);
      await refreshLibrary();
    }
  };

  const handleLoadSamples = async () => {
    if (!user) return;
    setIsLoading(true);
    await loadSampleSongsForUser(user.id);
    await refreshLibrary();
  };

  const handleSelectAlbum = (albumName: string) => {
    setSelectedAlbumName(albumName);
    setCurrentView('album-detail');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => setIsUploadOpen(true)}
        totalSongCount={songs.length}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenUpload={() => setIsUploadOpen(true)}
          onLoadSamples={handleLoadSamples}
          onClearLibrary={handleClearLibrary}
          songCount={songs.length}
          albumCount={albums.length}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-zinc-500 text-sm animate-pulse">
              Loading library...
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  songs={songs}
                  albums={albums}
                  recentlyPlayed={recentlyPlayed}
                  onNavigate={setCurrentView}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onLoadSamples={handleLoadSamples}
                  onSelectAlbum={handleSelectAlbum}
                />
              )}

              {currentView === 'library' && (
                <LibraryView
                  songs={songs}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onDeleteSong={handleDeleteSong}
                  onSelectAlbum={handleSelectAlbum}
                />
              )}

              {currentView === 'albums' && (
                <AlbumsView albums={albums} songs={songs} onSelectAlbum={handleSelectAlbum} />
              )}

              {currentView === 'album-detail' && (
                <AlbumDetailView
                  albumName={selectedAlbumName}
                  songs={songs}
                  albums={albums}
                  onBack={() => setCurrentView('albums')}
                />
              )}

              {currentView === 'artists' && <ArtistsView artists={artists} songs={songs} />}
            </>
          )}
        </main>
      </div>

      <PersistentPlayer />

      <FolderUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={refreshLibrary}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <MainAppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
