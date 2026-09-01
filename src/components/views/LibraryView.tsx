import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  Pause,
  Trash2,
  List,
  Grid,
  ArrowUpDown,
  Filter,
  Music,
  Download,
} from 'lucide-react';
import type { Song, SortField, SortDirection } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface LibraryViewProps {
  songs: Song[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onDeleteSong: (songId: string) => void;
  onSelectAlbum: (albumName: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  searchQuery,
  onSearchChange,
  onDeleteSong,
  onSelectAlbum,
}) => {
  const { playSong, currentSong, isPlaying, togglePlayPause } = useAudio();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => {
      if (s.genre) set.add(s.genre);
    });
    return Array.from(set);
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs
      .filter((s) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          s.title.toLowerCase().includes(query) ||
          s.artist.toLowerCase().includes(query) ||
          s.album.toLowerCase().includes(query) ||
          (s.genre && s.genre.toLowerCase().includes(query));

        const matchesGenre = selectedGenre === 'all' || s.genre === selectedGenre;

        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] || '';
        let valB: any = b[sortField] || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [songs, searchQuery, selectedGenre, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDownloadSong = (song: Song) => {
    const url = URL.createObjectURL(song.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.artist} - ${song.title}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Music Library</h1>
          <p className="text-xs text-zinc-400">
            {filteredSongs.length} songs {selectedGenre !== 'all' ? `in ${selectedGenre}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter library..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-zinc-300">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => handleSortChange(sortField)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-white/10 text-xs text-zinc-300 hover:text-white"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="capitalize">{sortField} ({sortDirection})</span>
          </button>

          <div className="flex items-center bg-zinc-900/60 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-purple-600/30 text-purple-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600/30 text-purple-300' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No songs found</h3>
          <p className="text-xs text-zinc-400 mt-1">Try tweaking your search filter or uploading new songs.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSortChange('title')}>
                  Title
                </th>
                <th className="py-3 px-4 cursor-pointer hidden md:table-cell" onClick={() => handleSortChange('artist')}>
                  Artist
                </th>
                <th className="py-3 px-4 cursor-pointer hidden lg:table-cell" onClick={() => handleSortChange('album')}>
                  Album
                </th>
                <th className="py-3 px-4 cursor-pointer text-right" onClick={() => handleSortChange('duration')}>
                  Duration
                </th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isThisPlaying = isCurrent && isPlaying;

                return (
                  <tr
                    key={song.id}
                    className={`group hover:bg-purple-600/10 transition-colors ${
                      isCurrent ? 'bg-purple-600/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => (isCurrent ? togglePlayPause() : playSong(song, filteredSongs))}
                        className="w-7 h-7 rounded-lg hover:bg-purple-600 text-zinc-400 hover:text-white flex items-center justify-center mx-auto transition-colors"
                      >
                        {isThisPlaying ? (
                          <Pause className="w-4 h-4 fill-current text-purple-400 group-hover:text-white" />
                        ) : isCurrent ? (
                          <Play className="w-4 h-4 fill-current text-purple-400 group-hover:text-white" />
                        ) : (
                          <span className="group-hover:hidden font-mono">{idx + 1}</span>
                        )}
                        {!isCurrent && <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block" />}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {song.artworkUrl ? (
                          <img src={song.artworkUrl} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Music className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white'}`}>
                            {song.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 md:hidden truncate">{song.artist}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-300 font-medium hidden md:table-cell truncate">
                      {song.artist}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span
                        onClick={() => onSelectAlbum(song.album)}
                        className="text-zinc-400 hover:text-purple-300 cursor-pointer truncate max-w-xs block"
                      >
                        {song.album}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-zinc-400">
                      {Math.floor(song.duration / 60)}:
                      {(song.duration % 60).toString().padStart(2, '0')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleDownloadSong(song)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Download Song"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
                              onDeleteSong(song.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Song"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => playSong(song, filteredSongs)}
                className={`glass-card rounded-2xl p-3 cursor-pointer group flex flex-col justify-between ${
                  isCurrent ? 'border-purple-500 bg-purple-500/10' : ''
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-zinc-900">
                  {song.artworkUrl ? (
                    <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-purple-950 to-zinc-900 flex items-center justify-center">
                      <Music className="w-10 h-10 text-purple-400" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                  <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
