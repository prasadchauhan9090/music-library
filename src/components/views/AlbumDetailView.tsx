import React from 'react';
import { ArrowLeft, Play, Shuffle, Disc3, Music, Clock } from 'lucide-react';
import type { Song, Album } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface AlbumDetailViewProps {
  albumName: string;
  songs: Song[];
  albums: Album[];
  onBack: () => void;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({ albumName, songs, albums, onBack }) => {
  const { playSong, currentSong } = useAudio();

  const albumSongs = songs.filter((s) => s.album.toLowerCase() === albumName.toLowerCase());
  const albumInfo = albums.find((a) => a.name.toLowerCase() === albumName.toLowerCase());

  const artistName = albumSongs[0]?.artist || albumInfo?.artist || 'Unknown Artist';
  const artworkUrl = albumSongs.find((s) => s.artworkUrl)?.artworkUrl || albumInfo?.artworkUrl;

  const totalDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

  const formatTotalTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs} hr ${remMins} min`;
    return `${mins} min`;
  };

  const handlePlayAll = () => {
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  };

  const handleShufflePlay = () => {
    if (albumSongs.length > 0) {
      const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Albums
      </button>

      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-white/10 flex flex-col md:flex-row items-center md:items-end gap-6 bg-gradient-to-tr from-purple-950/40 via-zinc-900 to-pink-950/20">
        <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-zinc-900 border border-white/10">
          {artworkUrl ? (
            <img src={artworkUrl} alt={albumName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center">
              <Disc3 className="w-16 h-16 text-purple-400" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">ALBUM</span>
          <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">{albumName}</h1>
          <p className="text-sm font-semibold text-zinc-300">{artistName}</p>

          <p className="text-xs text-zinc-400 flex items-center justify-center md:justify-start gap-2 pt-1">
            <span>{albumSongs.length} Songs</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> {formatTotalTime(totalDuration)}
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>
            <button
              onClick={handleShufflePlay}
              className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-white/10 transition-all flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4 text-purple-400" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {albumSongs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <tr
                  key={song.id}
                  onClick={() => playSong(song, albumSongs)}
                  className={`hover:bg-purple-600/10 cursor-pointer transition-colors ${
                    isCurrent ? 'bg-purple-600/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-mono text-zinc-400">{song.trackNumber || idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {song.artworkUrl ? (
                        <img src={song.artworkUrl} alt={song.title} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Music className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      <div>
                        <p className={`font-semibold ${isCurrent ? 'text-purple-300' : 'text-white'}`}>{song.title}</p>
                        <p className="text-[11px] text-zinc-400">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
