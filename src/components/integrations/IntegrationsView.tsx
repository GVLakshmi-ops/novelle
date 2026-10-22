import React, { useState } from 'react';
import {
  RefreshCw,
  Sparkles,
  Search,
  BookOpen,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Loader2,
  ShieldCheck,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ReadingItem } from '../../types';

interface IntegrationsViewProps {
  items: ReadingItem[];
  onImportItems: (newItems: ReadingItem[]) => void;
  onFullDataRestore: (data: { items: any[]; events: any[] }) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  items,
  onImportItems,
  onFullDataRestore,
}) => {
  const [aniListUsername, setAniListUsername] = useState('');
  const [isSyncingAniList, setIsSyncingAniList] = useState(false);
  const [aniListSuccess, setAniListSuccess] = useState<string | null>(null);
  const [aniListError, setAniListError] = useState<string | null>(null);

  // Sync with AniList
  const handleAniListSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aniListUsername.trim()) return;

    setIsSyncingAniList(true);
    setAniListSuccess(null);
    setAniListError(null);

    try {
      const res = await fetch('/api/anilist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: aniListUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync with AniList');
      }

      if (data.items && data.items.length > 0) {
        onImportItems(data.items);
        setAniListSuccess(
          `Successfully synced ${data.count} works from AniList user "${data.userName}"! Check your library.`
        );
      } else {
        setAniListSuccess(`Connected to "${data.userName}", but no manga entries were found on this account.`);
      }
    } catch (err: any) {
      setAniListError(err.message || 'Unable to sync with AniList. Verify user visibility.');
    } finally {
      setIsSyncingAniList(false);
    }
  };

  // Export JSON Backup
  const handleExportJson = () => {
    try {
      const storedItems = localStorage.getItem('novelle_library_items_v2') || '[]';
      const storedEvents = localStorage.getItem('novelle_activity_events_v2') || '[]';
      const payload = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        items: JSON.parse(storedItems),
        events: JSON.parse(storedEvents),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `novelle-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export backup file.');
    }
  };

  // Import JSON Backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.items) && Array.isArray(parsed.events)) {
          onFullDataRestore({ items: parsed.items, events: parsed.events });
          alert(`Restored ${parsed.items.length} works and ${parsed.events.length} activity events!`);
        } else {
          alert('Invalid backup format: expected JSON with items and events arrays.');
        }
      } catch {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const platforms = [
    {
      name: 'AniList',
      category: 'Manga, Manhwa & Light Novels',
      status: 'AUTO-SYNC ENABLED',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Live public GraphQL sync of completed, reading, and planned titles with cover art and chapter progress.',
      method: 'Public GraphQL API (No passwords needed)',
    },
    {
      name: 'Open Library',
      category: 'Print Books & Novels',
      status: 'SEARCH & COVER SYNC',
      statusColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      description: 'Search by ISBN or title. Populates author, page count, and official cover art.',
      method: 'Direct REST API',
    },
    {
      name: 'WEBTOON',
      category: 'Digital Webcomics',
      status: 'MANUAL TRACKING ONLY',
      statusColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      description: 'Auto-sync intentionally omitted per user policy. Save direct webtoon links and log chapters manually.',
      method: 'Direct URL Cataloging',
    },
    {
      name: 'Wattpad',
      category: 'User Fiction & Web Stories',
      status: 'MANUAL TRACKING ONLY',
      statusColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      description: 'Auto-sync ignored. Enter title and track chapter progression with stopwatch or quick log.',
      method: 'Manual Chapter Tracker',
    },
    {
      name: 'Archive of Our Own (AO3)',
      category: 'Fanfiction & Epics',
      status: 'MANUAL TRACKING ONLY',
      statusColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      description: 'Paste work URL and chapter count. No scraping or ToS violations.',
      method: 'Bookmark & Progress Log',
    },
    {
      name: 'Royal Road & MangaPlus',
      category: 'Web Serials & Releases',
      status: 'MANUAL TRACKING ONLY',
      statusColor: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
      description: 'Manual entry with provenance tagging: USER_ENTERED.',
      method: 'Manual Entry',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Card: AniList Live Sync */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#181829] via-[#141420] to-[#0F0F17] border border-[#2B2B42] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                AniList Live GraphQL Auto-Sync
              </h2>
              <p className="text-xs text-[#8E8EA8]">
                Sync your public AniList manga, manhwa & light novel list with one click
              </p>
            </div>
          </div>

          <form onSubmit={handleAniListSync} className="flex gap-2.5">
            <input
              type="text"
              required
              value={aniListUsername}
              onChange={(e) => setAniListUsername(e.target.value)}
              placeholder="Enter public AniList username (e.g. your_username)..."
              className="flex-1 bg-[#10101A] border border-[#2C2C40] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isSyncingAniList}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSyncingAniList ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Sync Library
                </>
              )}
            </button>
          </form>

          {aniListSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{aniListSuccess}</span>
            </div>
          )}

          {aniListError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{aniListError}</span>
            </div>
          )}

          <p className="text-[11px] text-[#71718D]">
            🔒 <strong>Zero Credentials Required:</strong> We query the public AniList GraphQL endpoint without ever asking for your third-party password or email.
          </p>
        </div>
      </div>

      {/* Platform Capability Reality Matrix */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Platform Capability & Integrity Matrix
            </h3>
            <p className="text-xs text-[#8E8EA8] mt-0.5">
              Honest integration transparency: auto-sync is ignored for Wattpad, Webtoons & AO3 in favor of pristine manual entry.
            </p>
          </div>
          <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Anti-Slop Guarantee
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="p-4 rounded-xl bg-[#181826] border border-[#242436] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <span
                    className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${p.statusColor}`}
                  >
                    {p.status}
                  </span>
                </div>
                <span className="text-[10px] text-[#787895]">{p.category}</span>
                <p className="text-xs text-[#A0A0BA] mt-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="text-[11px] text-[#777794] pt-2 border-t border-[#202030] font-mono">
                Method: {p.method}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-400" />
          Full Data Backup & Restore
        </h3>
        <p className="text-xs text-[#8E8EA8]">
          Export your complete library and timestamped activity log into standard JSON, or import an existing Novelle backup.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-[#1C1C2A] hover:bg-[#25253A] border border-[#2E2E44] text-xs font-semibold text-white rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            Export JSON Backup ({items.length} works)
          </button>

          <label className="px-4 py-2 bg-[#1C1C2A] hover:bg-[#25253A] border border-[#2E2E44] text-xs font-semibold text-white rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-violet-400" />
            <span>Restore from JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
