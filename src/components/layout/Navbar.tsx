import React, { useState } from 'react';
import { Search, HardDrive, Music, UserCheck, Sparkles, FolderUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { ViewMode } from '../../types/music';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  totalSongCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  totalSongCount,
}) => {
  const { user, storageUsedBytes, loginAs } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const storageUsedStr = formatSize(storageUsedBytes);
  const storageLimitStr = formatSize(user?.storageLimitBytes || 15 * 1024 * 1024 * 1024);
  const storagePercent = Math.min(
    100,
    Math.round((storageUsedBytes / (user?.storageLimitBytes || 15 * 1024 * 1024 * 1024)) * 100)
  );

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none group-hover:text-purple-400 transition-colors">
              Maara <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">MUSIC</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Songs Folder → Cloud Library</p>
          </div>
        </div>

        <div className="relative flex-1 hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search songs, artists, albums, genres..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onNavigate('library');
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-900/60 border border-white/10 rounded-full text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <FolderUp className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Songs Folder</span>
        </button>

        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-zinc-900/50 border border-white/5">
          <HardDrive className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <div className="flex justify-between items-center text-[11px] text-zinc-300 gap-3">
              <span>{storageUsedStr}</span>
              <span className="text-zinc-500">/ {storageLimitStr}</span>
            </div>
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${Math.max(5, storagePercent)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-purple-500/50 object-cover"
            />
            <span className="text-sm font-medium text-zinc-200 hidden xl:inline">{user?.name}</span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-3 shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-xs text-zinc-400 font-medium">Logged in as</p>
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-purple-400 truncate">{user?.email}</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    loginAs('prasadchauhan99@gmail.com', 'Prasad Chauhan');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-purple-500/20 text-zinc-200 flex items-center justify-between"
                >
                  <span>Switch to Prasad Account</span>
                  {user?.email === 'prasadchauhan99@gmail.com' && <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
                </button>
                <button
                  onClick={() => {
                    loginAs('demo.music@antigravity.io', 'Demo Music Fan');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-purple-500/20 text-zinc-200 flex items-center justify-between"
                >
                  <span>Switch to Demo Account</span>
                  {user?.email === 'demo.music@antigravity.io' && <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center px-3 text-[11px] text-zinc-400">
                <span>{totalSongCount} songs saved</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Private DB
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
