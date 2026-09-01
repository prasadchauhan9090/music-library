import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Disc3,
  Music,
  Trash2,
  X,
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export const PersistentPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    queue,
    queueIndex,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playSong,
    removeFromQueue,
    clearQueue,
  } = useAudio();

  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {showQueueDrawer && (
        <div className="fixed bottom-[88px] right-4 z-40 w-96 glass-panel rounded-3xl p-5 shadow-2xl border border-white/15 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Up Next Queue ({queue.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <button
                onClick={() => setShowQueueDrawer(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {queue.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Queue is currently empty</p>
            ) : (
              queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.id}_${idx}`}
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? 'bg-purple-600/30 text-white font-semibold border border-purple-500/40'
                        : 'hover:bg-white/5 text-zinc-300'
                    }`}
                  >
                    <div
                      onClick={() => playSong(song)}
                      className="flex items-center gap-3 truncate flex-1 cursor-pointer"
                    >
                      {song.artworkUrl ? (
                        <img src={song.artworkUrl} alt={song.title} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <Music className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="truncate font-medium">{song.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/15 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5 min-w-0 w-1/4">
          <div className="relative group shrink-0">
            {currentSong.artworkUrl ? (
              <img
                src={currentSong.artworkUrl}
                alt={currentSong.title}
                className="w-13 h-13 rounded-xl object-cover border border-white/10 shadow-md"
              />
            ) : (
              <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-500/30 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-purple-300 animate-spin-slow" />
              </div>
            )}

            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-0.5">
                <span className="w-1 bg-purple-400 rounded-full animate-eq-1" />
                <span className="w-1 bg-pink-400 rounded-full animate-eq-2" />
                <span className="w-1 bg-cyan-400 rounded-full animate-eq-3" />
                <span className="w-1 bg-purple-400 rounded-full animate-eq-4" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate leading-snug">{currentSong.title}</h4>
            <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
            <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {currentSong.album}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors ${
                isShuffle ? 'text-purple-400 bg-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 group py-1 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 min-w-0 w-1/4">
          <button
            onClick={() => setShowQueueDrawer(!showQueueDrawer)}
            className={`p-2 rounded-xl border transition-all ${
              showQueueDrawer
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 hidden sm:flex">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </>
  );
};
