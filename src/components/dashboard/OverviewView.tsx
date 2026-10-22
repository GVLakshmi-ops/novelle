import React from 'react';
import {
  Flame,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  BookMarked,
  Layers,
} from 'lucide-react';
import { ReadingItem, ReadingEvent, StreakStats } from '../../types';
import { AggregateSummary } from '../../lib/analytics';
import { NavTab } from '../layout/Sidebar';

interface OverviewViewProps {
  items: ReadingItem[];
  events: ReadingEvent[];
  streaks: StreakStats;
  aggregates: AggregateSummary;
  onNavigateTab: (tab: NavTab) => void;
  onQuickIncrement: (itemId: string, amount: number) => void;
  onOpenQuickLogModal: () => void;
  onOpenAddModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  items,
  events,
  streaks,
  aggregates,
  onNavigateTab,
  onQuickIncrement,
  onOpenQuickLogModal,
  onOpenAddModal,
}) => {
  const currentlyReading = items.filter((i) => i.status === 'READING');
  const recentEvents = events.filter((e) => !e.isDeleted).slice(0, 6);

  const formatHours = (mins: number) => {
    const h = (mins / 60).toFixed(1);
    return `${h}h`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Coach & Streak Spotlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#181826] to-indigo-950/30 border border-violet-500/25 p-5 md:p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
                <Sparkles className="w-3 h-3 text-violet-400" />
                Novelle Intelligence
              </span>
              <span className="text-xs text-[#8E8EA8]">Timezone: DST-safe local active</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-editorial">
              {streaks.currentStreak > 0
                ? `You're on a ${streaks.currentStreak}-day reading streak!`
                : 'Welcome to your unified reading intelligence sanctuary.'}
            </h2>
            <p className="text-xs md:text-sm text-[#A8A8C0] leading-relaxed">
              Track manga, web novels, books, webtoons, and fanfiction in one place. Units are tracked strictly without incompatible sums, backed by AniList sync and annual Rewind.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigateTab('rewind')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-violet-950/50 transition-all cursor-pointer flex items-center gap-1.5 border border-pink-400/30"
            >
              <Sparkles className="w-4 h-4" />
              Open 2025 Rewind
            </button>
            <button
              onClick={onOpenQuickLogModal}
              className="px-4 py-2 rounded-xl bg-[#202030] hover:bg-[#28283C] text-white text-xs font-semibold transition-colors cursor-pointer border border-[#35354D] flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-violet-400" />
              Log Session
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8EA8]">
            <span className="text-xs font-medium">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono-numbers">
              {streaks.currentStreak}
            </div>
            <p className="text-[11px] text-amber-400/90 font-medium">
              Longest: {streaks.longestStreak} days
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8EA8]">
            <span className="text-xs font-medium">Chapters Read</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono-numbers">
              {aggregates.totalChapters.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#7A7A98]">Manga, Webtoons & Web Novels</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8EA8]">
            <span className="text-xs font-medium">Pages Read</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono-numbers">
              {aggregates.totalPages.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#7A7A98]">Books & Print Editions</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8E8EA8]">
            <span className="text-xs font-medium">Time Tracked</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono-numbers">
              {formatHours(aggregates.totalMinutes)}
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              {aggregates.totalMinutes} active minutes
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#8E8EA8]">
            <span className="text-xs font-medium">Works Finished</span>
            <CheckCircle2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white font-mono-numbers">
              {aggregates.completedCount}
            </div>
            <p className="text-[11px] text-[#7A7A98]">
              {aggregates.inProgressCount} in progress
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Currently Reading & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Continue Reading Shelf */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                Continue Reading ({currentlyReading.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('library')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              Full Library <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentlyReading.map((item) => {
              const hasTotal = item.totalProgress !== null && item.totalProgress > 0;
              const percent = hasTotal
                ? Math.min(100, Math.round((item.progress / (item.totalProgress as number)) * 100))
                : null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#14141E] border border-[#242436] hover:border-violet-500/40 transition-all group flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-16 h-22 object-cover rounded-xl bg-[#222232] flex-shrink-0 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1F1F2E] text-[#9E9EB8] border border-[#2B2B3E]">
                          {item.medium}
                        </span>
                        {item.score && (
                          <span className="text-[11px] text-amber-300 font-bold font-mono-numbers">
                            ★ {item.score}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate mt-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#7F7F9A] truncate">{item.author}</p>

                      <div className="mt-2 text-xs font-mono-numbers">
                        <span className="text-white font-semibold">
                          {item.progress}
                        </span>
                        <span className="text-[#6C6C86]">
                          {hasTotal ? ` / ${item.totalProgress}` : ''} {item.unit.toLowerCase()}
                        </span>
                        {percent !== null && (
                          <span className="text-[11px] text-violet-400 font-semibold ml-2">
                            ({percent}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Fast +1 increment action */}
                  <div className="mt-3 pt-2.5 border-t border-[#1F1F2C] flex items-center justify-between gap-3">
                    <div className="flex-1">
                      {hasTotal ? (
                        <div className="w-full bg-[#20202F] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#696982] italic">Ongoing serialization</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onQuickIncrement(item.id, 1)}
                        className="px-2.5 py-1 rounded-lg bg-[#1E1E2C] hover:bg-violet-600 hover:text-white text-xs text-[#B2B2CC] font-semibold border border-[#2F2F42] transition-colors cursor-pointer flex items-center gap-1"
                        title={`Add 1 ${item.unit.toLowerCase()}`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>+1</span>
                      </button>
                      <button
                        onClick={() => onQuickIncrement(item.id, 5)}
                        className="px-2 py-1 rounded-lg bg-[#1E1E2C] hover:bg-[#2A2A3E] text-xs text-[#8A8AA5] font-semibold border border-[#2F2F42] transition-colors cursor-pointer"
                        title={`Add 5 ${item.unit.toLowerCase()}`}
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Recent Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
            >
              View Log
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3.5">
            {recentEvents.length === 0 ? (
              <p className="text-xs text-[#8A8AA0] text-center py-6">
                No recent activity logged. Click 'Quick Log' to start your streak!
              </p>
            ) : (
              recentEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {ev.itemTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#7F7F98] mt-0.5">
                      <span className="text-emerald-400 font-mono-numbers">
                        +{ev.progressChange} {ev.unit.toLowerCase()}
                      </span>
                      {ev.durationSeconds > 0 && (
                        <span>· {Math.round(ev.durationSeconds / 60)} mins</span>
                      )}
                      <span>· {ev.provenance.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    {ev.notes && (
                      <p className="text-[11px] text-[#A6A6BF] italic mt-0.5 truncate">
                        "{ev.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

    
      {/* Empty state for brand-new users */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-violet-500/30 bg-[#14141C]/80 p-8 md:p-12 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-violet-400" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-white font-editorial">Your dashboard is ready</h3>
            <p className="text-sm text-[#9E9EBA] leading-relaxed">
              This is a clean slate. Add your first title, connect AniList, or import a file to start building your personal reading intelligence.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-900/40 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add your first title
            </button>
            <button
              onClick={() => onNavigateTab('integrations')}
              className="px-5 py-2.5 rounded-xl bg-[#1C1C28] hover:bg-[#262638] border border-[#33334D] text-[#E8E8F0] text-sm font-medium transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Sync accounts
            </button>
          </div>
        </div>
      )}

      {/* Quick Platform Matrix Link Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#171724] to-[#111119] border border-[#28283C] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">AniList & Manual Sync Matrix</p>
              <p className="text-[11px] text-[#86869E] mt-0.5">
                Manga sync enabled · Webtoon/Wattpad manual cataloging
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('integrations')}
              className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
