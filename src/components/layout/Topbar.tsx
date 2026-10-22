import React, { useState } from 'react';
import {
  Search,
  Plus,
  Flame,
  Globe,
  Clock,
  Menu,
  Sparkles,
  RefreshCw,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { User } from '../../types/auth';

interface TopbarProps {
  currentTab: NavTab;
  onOpenAddModal: () => void;
  onOpenQuickLogModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  streakCount: number;
  timeZone: string;
  onToggleMobileMenu?: () => void;
  isTimerRunning: boolean;
  timerSeconds: number;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onOpenAddModal,
  onOpenQuickLogModal,
  searchQuery,
  onSearchChange,
  streakCount,
  timeZone,
  onToggleMobileMenu,
  isTimerRunning,
  timerSeconds,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview & Dashboard';
      case 'library':
        return 'My Library';
      case 'activity':
        return 'Live Session & Activity Log';
      case 'analytics':
        return 'Reading Analytics & Streaks';
      case 'rewind':
        return 'Novelle Rewind 2025';
      case 'integrations':
        return 'AniList Live Sync & Platform Matrix';
      case 'ai':
        return 'AI Reading Intelligence Coach';
      case 'settings':
        return 'Preferences & Settings';
      default:
        return 'Novelle';
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="h-16 border-b border-[#20202E] bg-[#0E0E14]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger + Tab Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-[#181824] border border-[#2A2A3C] text-[#A0A0BA] hover:text-white"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            {getTabTitle(currentTab)}
            {currentTab === 'rewind' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white font-semibold">
                Wrapped
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Middle: Search input (hidden on small mobile) */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#666682] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, authors, genres (e.g. Omniscient Reader, Andy Weir)..."
            className="w-full bg-[#151520] border border-[#272738] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Active Live Session Indicator */}
        {isTimerRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono-numbers animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Reading {formatTimer(timerSeconds)}</span>
          </div>
        )}

        {/* Timezone pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141E] border border-[#232332] text-xs text-[#82829C]">
          <Globe className="w-3.5 h-3.5 text-[#5F5F7A]" />
          <span className="font-mono text-[11px] truncate max-w-[120px]">
            {timeZone.replace('_', ' ')}
          </span>
        </div>

        {/* Quick Log button */}
        <button
          onClick={onOpenQuickLogModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B1B27] hover:bg-[#232334] border border-[#2F2F44] text-xs font-medium text-white transition-colors cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">Quick Log</span>
        </button>

        {/* Primary Add Item button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-950/40 transition-all cursor-pointer border border-violet-400/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Work</span>
        </button>

        {/* User Account Button / Dropdown */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#181826] hover:bg-[#202032] border border-[#2B2B3E] cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#797996]" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#161624] border border-[#2A2A3E] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#222232] mb-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-[#7E7E98] truncate">{currentUser.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenAuth();
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-[#B0B0CA] hover:text-white hover:bg-[#202034] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-violet-400" />
                  <span>Switch / New Account</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onSignOut();
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
