import React from 'react';
import { Music, Disc3, HardDrive, Play, FolderUp, Clock, Sparkles } from 'lucide-react';
import type { Song, Album, ViewMode } from '../../types/music';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  songs: Song[];
  albums: Album[];
  recentlyPlayed: Song[];
  onNavigate: (view: ViewMode) => void;
  onOpenUpload: () => void;
  onLoadSamples: () => void;
  onSelectAlbum: (albumName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  songs,
  albums,
  recentlyPlayed,
  onNavigate,
  onOpenUpload,
  onLoadSamples,
  onSelectAlbum,
}) => {
  const { playSong, currentSong } = useAudio();
  const { storageUsedBytes, user } = useAuth();

  const totalSongs = songs.length;
  const totalAlbums = albums.length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const recentlyAdded = songs.slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 bg-gradient-to-r from-purple-900/40 via-zinc-900/60 to-pink-900/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              MAARAMUSIC ENGINE
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-zinc-300 mt-1 max-w-xl">
              Owner upload controls • Universal stream access for all listeners to play, search, and enjoy your music collection.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenUpload}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <FolderUp className="w-4 h-4" />
              <span>+ Upload Songs Folder</span>
            </button>
            {totalSongs === 0 && (
              <button
                onClick={onLoadSamples}
                className="px-5 py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-sm border border-cyan-500/30 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Try Demo Songs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('library')}
          className="glass-card rounded-2xl p-5 border border-white/10 cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Music className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Total Library Songs</p>
            <p className="text-2xl font-black text-white">{totalSongs}</p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('albums')}
          className="glass-card rounded-2xl p-5 border border-white/10 cursor-pointer flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <Disc3 className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Organized Albums</p>
            <p className="text-2xl font-black text-white">{totalAlbums}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <HardDrive className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Offline Storage Used</p>
            <p className="text-2xl font-black text-white">{formatSize(storageUsedBytes)}</p>
          </div>
        </div>
      </div>

      {totalSongs === 0 && (
        <div
          onClick={onOpenUpload}
          className="glass-panel border-2 border-dashed border-purple-500/40 rounded-3xl p-10 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FolderUp className="w-8 h-8 text-purple-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Your music library is currently empty</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
            Click here to select your laptop's <code className="text-purple-300">songs/</code> folder or click "Try Demo Songs" above.
          </p>
        </div>
      )}

      {recentlyPlayed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" /> Recently Played
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyPlayed.map((song) => (
              <div
                key={`rec_${song.id}`}
                onClick={() => playSong(song, recentlyPlayed)}
                className="glass-card rounded-2xl p-3 cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-900">
                  {song.artworkUrl ? (
                    <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-zinc-900 flex items-center justify-center">
                      <Music className="w-8 h-8 text-purple-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold text-white truncate">{song.title}</p>
                <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentlyAdded.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recently Uploaded Tracks</h2>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              View All ({totalSongs}) →
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentlyAdded.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, songs)}
                    className={`flex items-center justify-between p-3.5 px-5 hover:bg-white/5 cursor-pointer transition-colors ${
                      isCurrent ? 'bg-purple-600/15' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs text-zinc-500 font-mono w-5">{idx + 1}</span>
                      {song.artworkUrl ? (
                        <img src={song.artworkUrl} alt={song.title} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                          <Music className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlbum(song.album);
                        }}
                        className="text-xs text-zinc-400 hover:text-purple-300 hidden md:inline truncate max-w-xs cursor-pointer"
                      >
                        {song.album}
                      </span>
                      <span className="text-xs font-mono text-zinc-500">
                        {Math.floor(song.duration / 60)}:
                        {(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
