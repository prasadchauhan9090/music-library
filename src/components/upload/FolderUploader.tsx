import React, { useState, useRef } from 'react';
import { UploadCloud, Folder, FileAudio, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, Lock, KeyRound } from 'lucide-react';
import { extractMetadata } from '../../services/metadata';
import { saveSong } from '../../services/db';
import type { Song, UploadProgressItem } from '../../types/music';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

interface FolderUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const FolderUploader: React.FC<FolderUploaderProps> = ({ isOpen, onClose, onUploadComplete }) => {
  const { user, isOwner, verifyOwnerPin, loginAs } = useAuth();
  const [uploadQueue, setUploadQueue] = useState<UploadProgressItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = verifyOwnerPin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  const supportedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/x-m4a'];

  const isAudioFile = (file: File) => {
    if (supportedTypes.includes(file.type.toLowerCase())) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['mp3', 'm4a', 'wav', 'flac', 'ogg', 'aac'].includes(ext || '');
  };

  const processFiles = async (files: File[]) => {
    if (!user || !isOwner) return;
    const audioFiles = files.filter(isAudioFile);

    if (audioFiles.length === 0) {
      alert('No supported audio files (.mp3, .m4a, .wav, .flac, .ogg) were found in your selection.');
      return;
    }

    const initialQueue: UploadProgressItem[] = audioFiles.map((file, idx) => ({
      id: `up_${Date.now()}_${idx}`,
      fileName: file.name,
      filePath: (file as any).webkitRelativePath || file.name,
      fileSize: file.size,
      progress: 0,
      status: 'pending',
    }));

    setUploadQueue(initialQueue);
    setIsProcessing(true);

    let successCount = 0;

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];

      setUploadQueue((prev) =>
        prev.map((q, index) => (index === i ? { ...q, status: 'parsing', progress: 30 } : q))
      );

      try {
        const relativePath = (file as any).webkitRelativePath;
        const meta = await extractMetadata(file, relativePath);

        setUploadQueue((prev) =>
          prev.map((q, index) => (index === i ? { ...q, status: 'saving', progress: 70 } : q))
        );

        const newSong: Song = {
          id: `song_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: user.id,
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          albumArtist: meta.albumArtist,
          trackNumber: meta.trackNumber,
          genre: meta.genre,
          year: meta.year,
          duration: meta.duration,
          fileSize: file.size,
          mimeType: file.type || 'audio/mp3',
          artworkUrl: meta.artworkUrl,
          audioBlob: file,
          createdAt: Date.now(),
          filePath: relativePath || file.name,
        };

        await saveSong(newSong);

        setUploadQueue((prev) =>
          prev.map((q, index) => (index === i ? { ...q, status: 'completed', progress: 100 } : q))
        );
        successCount++;
      } catch (err: any) {
        if (err.message?.includes('Duplicate')) {
          setUploadQueue((prev) =>
            prev.map((q, index) => (index === i ? { ...q, status: 'duplicate', progress: 100 } : q))
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((q, index) =>
              index === i
                ? { ...q, status: 'error', progress: 0, errorMessage: err.message || 'Failed to parse' }
                : q
            )
          );
        }
      }
    }

    setIsProcessing(false);
    if (successCount > 0) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onUploadComplete();
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const completedCount = uploadQueue.filter((q) => q.status === 'completed').length;
  const totalCount = uploadQueue.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      {!isOwner ? (
        /* Owner Authorization Locked Modal */
        <div className="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-white/15 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-rose-400" />
          </div>

          <h2 className="text-xl font-extrabold text-white">Upload Access Restricted</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Song upload privileges are reserved exclusively for the library owner (<span className="text-purple-300 font-semibold">Prasad Chauhan</span>).
          </p>

          <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
            <button
              onClick={() => loginAs('prasadchauhan99@gmail.com', 'Prasad Chauhan (Owner)')}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Switch to Prasad Chauhan (Owner Account)</span>
            </button>

            <form onSubmit={handleUnlockPin} className="space-y-2">
              <p className="text-[11px] text-zinc-500">Or enter Owner Passkey / PIN (9090):</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter PIN..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-zinc-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-xl"
                >
                  Unlock
                </button>
              </div>
              {pinError && <p className="text-[10px] text-rose-400">Incorrect Passkey. Please try again.</p>}
            </form>
          </div>
        </div>
      ) : (
        /* Owner Upload Panel */
        <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 shadow-2xl border border-white/15 relative overflow-hidden flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Upload Songs Folder</h2>
                <p className="text-xs text-zinc-400">
                  Authorized Owner: <span className="text-purple-300 font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {uploadQueue.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`my-6 border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 transition-all ${
                isDragOver
                  ? 'border-purple-500 bg-purple-500/10 scale-[0.99]'
                  : 'border-white/15 bg-zinc-900/40 hover:border-purple-500/50 hover:bg-zinc-900/60'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600/30 to-pink-600/30 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Folder className="w-8 h-8 text-purple-300" />
              </div>

              <div>
                <p className="text-base font-semibold text-white">Drag & Drop your "songs" folder or files here</p>
                <p className="text-xs text-zinc-400 mt-1">Supports MP3, M4A, WAV, FLAC, OGG up to high bitrates</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mt-2">
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={handleFolderSelect}
                  // @ts-ignore
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                >
                  <Folder className="w-4 h-4" />
                  <span>Select Folder</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm border border-white/10 transition-all flex items-center gap-2"
                >
                  <FileAudio className="w-4 h-4 text-purple-400" />
                  <span>Select Individual Files</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
                <span>
                  {isProcessing ? 'Processing files...' : 'Upload completed'} ({completedCount} of {totalCount} saved)
                </span>
                {isProcessing && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
              </div>

              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 truncate flex-1">
                    <FileAudio className="w-5 h-5 text-purple-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{item.fileName}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{item.filePath}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === 'parsing' && (
                      <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Extracting Tags...
                      </span>
                    )}
                    {item.status === 'saving' && (
                      <span className="text-[11px] text-cyan-400 font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Storing DB...
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Saved
                      </span>
                    )}
                    {item.status === 'duplicate' && (
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Already exists
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Error
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500">Files stored in private local IndexedDB object storage</p>
            <div className="flex gap-2">
              {uploadQueue.length > 0 && !isProcessing && (
                <button
                  onClick={() => setUploadQueue([])}
                  className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                >
                  Upload Another Folder
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
