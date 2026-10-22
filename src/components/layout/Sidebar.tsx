import React from 'react';
import {
  BookOpen,
  Compass,
  Library,
  Flame,
  BarChart3,
  Sparkles,
  RefreshCw,
  Cpu,
  Settings,
  BookmarkCheck,
  Timer,
  Layers,
  LogOut,
} from 'lucide-react';

import { User } from '../../types/auth';

export type NavTab =
  | 'overview'
  | 'library'
  | 'activity'
  | 'analytics'
  | 'rewind'
  | 'integrations'
  | 'ai'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  streakCount: number;
  isTimerRunning: boolean;
  libraryCount: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  streakCount,
  isTimerRunning,
  libraryCount,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: Compass,
      badge: null,
    },
    {
      id: 'library' as NavTab,
      label: 'My Library',
      icon: Library,
      badge: libraryCount > 0 ? String(libraryCount) : null,
    },
    {
      id: 'activity' as NavTab,
      label: 'Live Tracker & Activity',
      icon: Timer,
      badge: isTimerRunning ? 'LIVE' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'rewind' as NavTab,
      label: 'Novelle Rewind',
      icon: Sparkles,
      badge: '2025 WRAP',
      badgeColor: 'bg-gradient-to-r from-violet-600/30 to-pink-600/30 text-pink-300 border-pink-500/30',
    },
    {
      id: 'integrations' as NavTab,
      label: 'AniList & Sync',
      icon: RefreshCw,
      badge: null,
    },
    {
      id: 'ai' as NavTab,
      label: 'AI Reading Coach',
      icon: Cpu,
      badge: 'GEMINI',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0E0E14] border-r border-[#222230] flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#20202E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/30 border border-violet-400/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-white font-editorial">
                Novelle
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#8A8AA0]">Reading Intelligence</p>
          </div>
        </div>
      </div>

      {/* Streak Callout */}
      <div className="px-4 pt-4 pb-2">
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-amber-200 font-mono-numbers">
                  {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80">Active Streak</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
            On Fire
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#63637E]">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-violet-600/15 text-white border border-violet-500/30 shadow-sm shadow-violet-950/50'
                  : 'text-[#9A9AB2] hover:text-white hover:bg-[#161622] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-violet-400' : 'text-[#7C7C94]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                    item.badgeColor || 'bg-[#222230] text-[#B0B0C8] border-[#313145]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3.5 border-t border-[#1E1E2C] bg-[#0A0A0F] space-y-2.5">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#141420] border border-[#232336]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#7C7C94] truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-[#7C7C94] hover:text-rose-400 hover:bg-[#1E1E2C] transition-colors cursor-pointer flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sign In / Create Account</span>
          </button>
        )}

        <div className="flex items-center justify-between text-[11px] text-[#73738C] px-1">
          <span>Data Isolation</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {currentUser ? 'User Vault Active' : 'Guest Vault'}
          </span>
        </div>
      </div>
    </aside>
  );
};
