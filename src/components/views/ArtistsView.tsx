import React from 'react';
import { Mic2, Play } from 'lucide-react';
import type { Song, Artist } from '../../types/music';
import { useAudio } from '../../context/AudioContext';

interface ArtistsViewProps {
  artists: Artist[];
  songs: Song[];
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ artists, songs }) => {
  const { playSong } = useAudio();

  const handlePlayArtist = (artistName: string) => {
    const artistSongs = songs.filter((s) => s.artist.toLowerCase() === artistName.toLowerCase());
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Artists</h1>
        <p className="text-xs text-zinc-400">{artists.length} artists in your collection</p>
      </div>

      {artists.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <Mic2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No artists found</h3>
          <p className="text-xs text-zinc-400 mt-1">Upload song folders to populate your artist directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {artists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => handlePlayArtist(artist.name)}
              className="glass-card rounded-2xl p-4 cursor-pointer group flex flex-col items-center text-center"
            >
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 bg-zinc-900 shadow-lg border border-white/10">
                {artist.artworkUrl ? (
                  <img src={artist.artworkUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center">
                    <Mic2 className="w-12 h-12 text-purple-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {artist.songCount} {artist.songCount === 1 ? 'Track' : 'Tracks'} • {artist.albumCount} {artist.albumCount === 1 ? 'Album' : 'Albums'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
