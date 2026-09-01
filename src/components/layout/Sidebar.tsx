import React from 'react';
import { LayoutDashboard, Music2, Disc3, Mic2, UploadCloud, Sparkles, Trash2, Library } from 'lucide-react';
import type { ViewMode } from '../../types/music';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenUpload: () => void;
  onLoadSamples: () => void;
  onClearLibrary: () => void;
  songCount: number;
  albumCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenUpload,
  onLoadSamples,
  onClearLibrary,
  songCount,
  albumCount,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library' as ViewMode, label: 'Music Library', icon: Music2, count: songCount },
    { id: 'albums' as ViewMode, label: 'Albums', icon: Disc3, count: albumCount },
    { id: 'artists' as ViewMode, label: 'Artists', icon: Mic2 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-65px-90px)] sticky top-[65px]">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'albums' && currentView === 'album-detail');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 pt-4 border-t border-white/5">
          <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Actions</p>
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all group"
          >
            <UploadCloud className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Upload Songs Folder</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Load Demo Music</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center gap-3">
          <Library className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="truncate text-xs">
            <p className="text-zinc-200 font-semibold truncate">Private Storage</p>
            <p className="text-zinc-500 text-[11px]">IndexedDB Offline Engine</p>
          </div>
        </div>

        {songCount > 0 && (
          <button
            onClick={onClearLibrary}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Library</span>
          </button>
        )}
      </div>
    </aside>
  );
};
