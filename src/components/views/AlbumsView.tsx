import React from 'react';
import { Disc3, Play } from 'lucide-react';
import type { Album, Song } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface AlbumsViewProps {
  albums: Album[];
  songs: Song[];
  onSelectAlbum: (albumName: string) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ albums, songs, onSelectAlbum }) => {
  const { playSong } = useAudio();

  const handlePlayAlbum = (e: React.MouseEvent, albumName: string) => {
    e.stopPropagation();
    const albumSongs = songs.filter((s) => s.album.toLowerCase() === albumName.toLowerCase());
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Albums</h1>
        <p className="text-xs text-zinc-400">{albums.length} organized albums extracted from audio metadata</p>
      </div>

      {albums.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Disc3 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No albums created yet</h3>
          <p className="text-xs text-zinc-400 mt-1">Upload song folders with ID3 tags or folder names to organize albums.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album.name)}
              className="glass-card rounded-2xl p-3.5 cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900 shadow-md">
                {album.artworkUrl ? (
                  <img src={album.artworkUrl} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-pink-950 flex items-center justify-center">
                    <Disc3 className="w-12 h-12 text-purple-400/80 group-hover:rotate-45 transition-transform" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => handlePlayAlbum(e, album.name)}
                    className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform"
                    title={`Play ${album.name}`}
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white truncate">{album.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                <p className="text-[11px] text-purple-400 font-medium mt-1">
                  {album.songCount} {album.songCount === 1 ? 'Track' : 'Tracks'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
