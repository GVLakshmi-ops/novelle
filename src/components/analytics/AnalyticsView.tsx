import React from 'react';
import {
  BarChart3,
  Flame,
  BookOpen,
  Layers,
  Clock,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { ReadingItem, ReadingEvent, StreakStats, MediumType } from '../../types';
import { AggregateSummary } from '../../lib/analytics';
import { ReadingContributionGraph } from './ReadingContributionGraph';

interface AnalyticsViewProps {
  items: ReadingItem[];
  events: ReadingEvent[];
  streaks: StreakStats;
  aggregates: AggregateSummary;
  timeZone: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  items,
  events,
  streaks,
  aggregates,
  timeZone,
}) => {
  const totalItems = items.length || 1;

  // Medium breakdown percentages
  const mediumPercentages = Object.entries(aggregates.mediumDistribution)
    .filter(([_, count]) => count > 0)
    .map(([med, count]) => ({
      medium: med as MediumType,
      count,
      percent: Math.round((count / totalItems) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Provenance distribution
  const provenanceMap: Record<string, number> = {
    USER_ENTERED: 0,
    PLATFORM_REPORTED: 0,
    IMPORTED: 0,
  };

  for (const item of items) {
    provenanceMap[item.provenance] = (provenanceMap[item.provenance] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#232334] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Reading Analytics & Strict Unit Metrics
          </h2>
          <p className="text-xs text-[#8A8AA0] mt-0.5">
            Measured in timezone: <span className="font-mono text-white">{timeZone}</span> · DST-safe calendar conversion
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl bg-violet-950/20 text-violet-300 border border-violet-500/30">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>Pages & Chapters are never summed together</span>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A8AA0]">
            <span className="font-medium">Streak Dynamics</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {streaks.currentStreak} <span className="text-sm font-normal text-[#8E8EA8]">Days</span>
          </div>
          <p className="text-xs text-amber-300/90 font-medium">
            Longest run: {streaks.longestStreak} days
          </p>
          <div className="text-[11px] text-[#71718C] pt-2 border-t border-[#1F1F2E]">
            {streaks.isStreakActiveToday
              ? 'Active day logged today'
              : 'Streak alive: log reading before midnight to maintain'}
          </div>
        </div>

        {/* Chapters Card */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A8AA0]">
            <span className="font-medium">Serial Progress</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {aggregates.totalChapters.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#8E8EA8]">Chapters</span>
          </div>
          <p className="text-xs text-indigo-300/90 font-medium">
            Across manga, webtoons, web novels & fanfics
          </p>
          <div className="text-[11px] text-[#71718C] pt-2 border-t border-[#1F1F2E]">
            Accurate serialized volume unit
          </div>
        </div>

        {/* Pages Card */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A8AA0]">
            <span className="font-medium">Print Volume</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {aggregates.totalPages.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#8E8EA8]">Pages</span>
          </div>
          <p className="text-xs text-sky-300/90 font-medium">
            Books, published paperbacks & articles
          </p>
          <div className="text-[11px] text-[#71718C] pt-2 border-t border-[#1F1F2E]">
            Exact page increments recorded
          </div>
        </div>

        {/* Time Card */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8A8AA0]">
            <span className="font-medium">Measured Immersion</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono-numbers">
            {(aggregates.totalMinutes / 60).toFixed(1)}{' '}
            <span className="text-sm font-normal text-[#8E8EA8]">Hours</span>
          </div>
          <p className="text-xs text-emerald-300/90 font-medium">
            {aggregates.totalMinutes} total minutes
          </p>
          <div className="text-[11px] text-[#71718C] pt-2 border-t border-[#1F1F2E]">
            Timed sessions & estimates logged
          </div>
        </div>
      </div>

      {/* 52-Week Contribution Graph Heatmap */}
      <ReadingContributionGraph events={events} timeZone={timeZone} />

      {/* Format & Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Format Breakdown */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-400" />
              Medium & Format Distribution
            </h3>
            <span className="text-xs text-[#8A8AA0]">{items.length} Total Works</span>
          </div>

          <div className="space-y-3">
            {mediumPercentages.map((item) => (
              <div key={item.medium} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{item.medium}</span>
                  <span className="font-mono-numbers text-[#8E8EA8]">
                    {item.count} works ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#20202F] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Ranking */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-pink-400" />
              Top Genres & Themes
            </h3>
            <span className="text-xs text-[#8A8AA0]">By frequency in library</span>
          </div>

          <div className="space-y-2.5">
            {aggregates.genreFrequency.slice(0, 8).map((g, idx) => (
              <div
                key={g.genre}
                className="p-2.5 rounded-xl bg-[#181824] border border-[#242436] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#222234] text-[#8E8EA8] font-mono-numbers font-bold text-[10px] flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-white">{g.genre}</span>
                </div>
                <span className="text-pink-300 font-mono-numbers font-bold">
                  {g.count} {g.count === 1 ? 'work' : 'works'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provenance Audit Integrity Box */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Data Provenance & Source Transparency
        </h3>
        <p className="text-xs text-[#8A8AA0]">
          Every metric carries its origin. We strictly differentiate user-entered numbers, platform-reported syncs, and imports.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#181826] border border-[#242436]">
            <span className="text-[10px] font-mono uppercase text-[#777792]">USER_ENTERED</span>
            <div className="text-lg font-bold text-white font-mono-numbers mt-1">
              {provenanceMap.USER_ENTERED || 0}
            </div>
            <p className="text-[11px] text-[#8686A0]">Manually added or logged</p>
          </div>
          <div className="p-3 rounded-xl bg-[#181826] border border-[#242436]">
            <span className="text-[10px] font-mono uppercase text-indigo-400">PLATFORM_REPORTED</span>
            <div className="text-lg font-bold text-white font-mono-numbers mt-1">
              {provenanceMap.PLATFORM_REPORTED || 0}
            </div>
            <p className="text-[11px] text-[#8686A0]">Direct AniList sync</p>
          </div>
          <div className="p-3 rounded-xl bg-[#181826] border border-[#242436]">
            <span className="text-[10px] font-mono uppercase text-sky-400">IMPORTED</span>
            <div className="text-lg font-bold text-white font-mono-numbers mt-1">
              {provenanceMap.IMPORTED || 0}
            </div>
            <p className="text-[11px] text-[#8686A0]">Open Library / File import</p>
          </div>
        </div>
      </div>
    </div>
  );
};
