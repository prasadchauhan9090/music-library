import Dexie, { type Table } from 'dexie';
import type { Song, User } from '../types/music';

export interface RecentlyPlayedRecord {
  id?: number;
  userId: string;
  songId: string;
  timestamp: number;
}

export class MaaraMusicDB extends Dexie {
  songs!: Table<Song>;
  users!: Table<User>;
  recentlyPlayed!: Table<RecentlyPlayedRecord>;

  constructor() {
    super('MaaraMusicDB');
    this.version(1).stores({
      songs: 'id, userId, title, artist, album, genre, year, createdAt',
      users: 'id, email',
      recentlyPlayed: '++id, userId, songId, timestamp',
    });
  }
}

export const db = new MaaraMusicDB();

// Universal Shared Library: fetch all songs for everyone to play
export async function getAllSongs(): Promise<Song[]> {
  return await db.songs.reverse().sortBy('createdAt');
}

// Backwards compatibility alias
export async function getSongsForUser(_userId?: string): Promise<Song[]> {
  return await getAllSongs();
}

export async function saveSong(song: Song): Promise<string> {
  const existing = await db.songs
    .filter(s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase())
    .first();

  if (existing) {
    throw new Error('Duplicate song detected');
  }

  await db.songs.put(song);
  return song.id;
}

export async function deleteSong(songId: string): Promise<void> {
  await db.songs.delete(songId);
  await db.recentlyPlayed.where('songId').equals(songId).delete();
}

export async function clearUserLibrary(_userId?: string): Promise<void> {
  await db.songs.clear();
  await db.recentlyPlayed.clear();
}

export async function recordRecentlyPlayed(userId: string, songId: string): Promise<void> {
  await db.recentlyPlayed.add({
    userId,
    songId,
    timestamp: Date.now(),
  });
}

export async function getRecentlyPlayedSongs(_userId?: string, limit = 8): Promise<Song[]> {
  const records = await db.recentlyPlayed
    .reverse()
    .sortBy('timestamp');

  const uniqueSongIds = Array.from(new Set(records.map(r => r.songId))).slice(0, limit);
  const songs: Song[] = [];

  for (const songId of uniqueSongIds) {
    const song = await db.songs.get(songId);
    if (song) songs.push(song);
  }

  return songs;
}
