import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Database,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';

import { User } from '../../types/auth';
import { User as UserIcon, LogOut, Key } from 'lucide-react';

interface SettingsViewProps {
  timeZone: string;
  onSaveTimezone: (tz: string) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  timeZone,
  onSaveTimezone,
  onResetDemoData,
  onClearAllData,
  currentUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [selectedTz, setSelectedTz] = useState(timeZone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const popularTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Singapore',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  const handleSaveTz = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTimezone(selectedTz);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* User Account & Identity Card */}
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Reader Account & Identity
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {currentUser ? 'Unique Vault Active' : 'Guest Mode'}
          </span>
        </div>

        {currentUser ? (
          <div className="p-4 rounded-xl bg-[#181826] border border-[#27273C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-pink-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                <p className="text-xs text-[#8E8EA8]">{currentUser.email}</p>
                <p className="text-[10px] text-[#63637E] font-mono mt-0.5">
                  User ID: {currentUser.id} · Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-[#222234] hover:bg-[#2B2B42] text-xs font-semibold text-[#B2B2C9] hover:text-white transition-colors cursor-pointer"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#181826] border border-[#27273C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white">Not signed in (Guest Explorer)</h4>
              <p className="text-[11px] text-[#86869E] mt-0.5">
                Sign in or create a free account to permanently store your unique library, custom notes, and annual Rewind across devices.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer whitespace-nowrap"
            >
              Sign In or Register
            </button>
          </div>
        )}
      </div>

      {/* Timezone Preference */}
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Timezone & Day Boundary Configuration
          </h3>
        </div>
        <p className="text-xs text-[#8E8EA8]">
          Novelle uses DST-safe IANA timezone calculations for active day streaks. Day boundaries transition at local midnight.
        </p>

        <form onSubmit={handleSaveTz} className="flex gap-3 max-w-md">
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="flex-1 bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer font-mono"
          >
            {popularTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            {savedSuccess ? 'Saved!' : 'Save Timezone'}
          </button>
        </form>
      </div>

      {/* Database & Local Data Control */}
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Data Storage & Demo State
          </h3>
        </div>
        <p className="text-xs text-[#8E8EA8]">
          Manage your local library and activity events. Reset back to the sample dataset or start fresh.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (confirm('Reset your library back to the realistic sample dataset?')) {
                onResetDemoData();
              }
            }}
            className="px-4 py-2 bg-[#1C1C2A] hover:bg-[#25253A] border border-[#2E2E44] text-xs font-semibold text-white rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
            Reload Sample Library & Streaks
          </button>

          <button
            onClick={() => {
              if (confirm('Clear ALL local data and start completely empty?')) {
                onClearAllData();
              }
            }}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Non-Negotiable Integrity Rules Review */}
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Novelle Integrity Constitution
          </h3>
        </div>

        <div className="space-y-2 text-xs text-[#9E9EBA]">
          <div className="p-2.5 rounded-xl bg-[#171724] border border-[#222234] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>No Fabricated Stats:</strong> Demo data is labeled as synthetic and never bleeds into production metrics.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#171724] border border-[#222234] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Unknown &ne; Zero:</strong> Serializations with unknown chapters are stored as null; progress % is only computed with verified totals.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#171724] border border-[#222234] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Incompatible Units Separated:</strong> Pages, chapters, and minutes are never summed together.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#171724] border border-[#222234] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Honest Auto-Sync Reality:</strong> Auto-sync is ignored for Wattpad, Webtoons, and AO3 in favor of pristine manual entry without scraping or credential collection.</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#171724] border border-[#222234] flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>AI Narrates Computed Numbers Only:</strong> Gemini narrates your pre-computed statistics without mathematical hallucination.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
