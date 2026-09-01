import type { Song } from '../types/music';
import { saveSong } from './db';

function createToneAudioBlob(frequency = 440, durationSeconds = 30): Blob {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const wave = 0.5 * Math.sin(2 * Math.PI * frequency * t) +
                 0.25 * Math.sin(2 * Math.PI * frequency * 1.5 * t) +
                 0.15 * Math.sin(2 * Math.PI * frequency * 2 * t);
    const envelope = Math.min(1, t / 2) * Math.min(1, (durationSeconds - t) / 2);
    buffer[i] = wave * envelope * 0.3;
  }

  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const SAMPLE_SONGS_DATA = [
  {
    title: 'Midnight Synth Drive',
    artist: 'MaaraMusic Soundworks',
    album: 'Neon Horizons',
    genre: 'Synthwave / Electronic',
    year: 2026,
    freq: 330,
    duration: 180,
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Solar Eclipse Reverie',
    artist: 'MaaraMusic Soundworks',
    album: 'Neon Horizons',
    genre: 'Ambient / Chill',
    year: 2026,
    freq: 440,
    duration: 210,
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Cyberpunk Odyssey',
    artist: 'HyperDrive',
    album: 'Quantum Realm',
    genre: 'Cyberpunk',
    year: 2025,
    freq: 261.63,
    duration: 195,
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Deep Focus Chillbeat',
    artist: 'Lofi MaaraMusic',
    album: 'Study Sessions Vol. 1',
    genre: 'Lo-Fi',
    year: 2026,
    freq: 392,
    duration: 160,
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80',
  },
];

export async function loadSampleSongsForUser(userId: string): Promise<Song[]> {
  const loadedSongs: Song[] = [];

  for (let i = 0; i < SAMPLE_SONGS_DATA.length; i++) {
    const s = SAMPLE_SONGS_DATA[i];
    const blob = createToneAudioBlob(s.freq, 30);

    const song: Song = {
      id: `sample_${userId}_${i}_${Date.now()}`,
      userId,
      title: s.title,
      artist: s.artist,
      album: s.album,
      albumArtist: s.artist,
      trackNumber: i + 1,
      genre: s.genre,
      year: s.year,
      duration: s.duration,
      fileSize: blob.size,
      mimeType: 'audio/wav',
      artworkUrl: s.artworkUrl,
      audioBlob: blob,
      createdAt: Date.now() - (SAMPLE_SONGS_DATA.length - i) * 60000,
    };

    try {
      await saveSong(song);
      loadedSongs.push(song);
    } catch {
      // Ignore if duplicate
    }
  }

  return loadedSongs;
}
