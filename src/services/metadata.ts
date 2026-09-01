import jsmediatags from 'jsmediatags';

export interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  trackNumber?: number;
  genre?: string;
  year?: number;
  duration: number;
  artworkUrl?: string;
}

export function parseFilename(fileName: string): { title: string; artist: string; album: string; trackNumber?: number } {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '').trim();
  const parts = nameWithoutExt.split('-').map(p => p.trim());

  if (parts.length >= 3) {
    const trackNum = parseInt(parts[0], 10);
    if (!isNaN(trackNum)) {
      return {
        trackNumber: trackNum,
        artist: parts[1] || 'Unknown Artist',
        title: parts.slice(2).join(' - ') || nameWithoutExt,
        album: 'Unknown Album',
      };
    } else {
      return {
        artist: parts[0],
        album: parts[1],
        title: parts.slice(2).join(' - '),
      };
    }
  } else if (parts.length === 2) {
    return {
      artist: parts[0],
      title: parts[1],
      album: 'Unknown Album',
    };
  }

  return {
    title: nameWithoutExt,
    artist: 'Unknown Artist',
    album: 'Single / Unknown Album',
  };
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanup();
      resolve(isNaN(dur) ? 0 : Math.round(dur));
    };

    audio.onerror = () => {
      cleanup();
      resolve(0);
    };
  });
}

export async function extractMetadata(file: File, relativePath?: string): Promise<ExtractedMetadata> {
  const fallback = parseFilename(file.name);
  const duration = await getAudioDuration(file);

  if (relativePath) {
    const pathParts = relativePath.split('/');
    if (pathParts.length > 1 && pathParts[pathParts.length - 2]) {
      fallback.album = pathParts[pathParts.length - 2];
    }
  }

  return new Promise((resolve) => {
    try {
      jsmediatags.read(file, {
        onSuccess: (tag) => {
          const tags = tag.tags;
          let artworkUrl: string | undefined = undefined;

          if (tags.picture) {
            const { data, format } = tags.picture;
            let base64String = '';
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i]);
            }
            artworkUrl = `data:${format};base64,${btoa(base64String)}`;
          }

          resolve({
            title: tags.title ? String(tags.title).trim() : fallback.title,
            artist: tags.artist ? String(tags.artist).trim() : fallback.artist,
            album: tags.album ? String(tags.album).trim() : fallback.album,
            albumArtist: tags.albumArtist ? String(tags.albumArtist).trim() : (tags.artist ? String(tags.artist).trim() : fallback.artist),
            trackNumber: tags.track ? parseInt(String(tags.track), 10) : fallback.trackNumber,
            genre: tags.genre ? String(tags.genre).trim() : 'General',
            year: tags.year ? parseInt(String(tags.year), 10) : undefined,
            duration: duration,
            artworkUrl: artworkUrl,
          });
        },
        onError: () => {
          resolve({
            title: fallback.title,
            artist: fallback.artist,
            album: fallback.album,
            trackNumber: fallback.trackNumber,
            duration: duration,
          });
        },
      });
    } catch {
      resolve({
        title: fallback.title,
        artist: fallback.artist,
        album: fallback.album,
        trackNumber: fallback.trackNumber,
        duration: duration,
      });
    }
  });
}
