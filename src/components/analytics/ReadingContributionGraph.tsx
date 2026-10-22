import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Trophy, Sparkles, Clock, Layers, BookOpen } from 'lucide-react';
import { ReadingEvent } from '../../types';
import { getLocalDateString } from '../../lib/streaks';

interface ReadingContributionGraphProps {
  events: ReadingEvent[];
  timeZone: string;
}

type IntensityMetric = 'ALL' | 'CHAPTERS' | 'PAGES' | 'MINUTES';

interface DayActivity {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  formattedDate: string; // "Oct 12, 2026"
  chapters: number;
  pages: number;
  minutes: number;
  titles: string[];
  level: 0 | 1 | 2 | 3 | 4;
}

export const ReadingContributionGraph: React.FC<ReadingContributionGraphProps> = ({
  events,
  timeZone,
}) => {
  const [metricMode, setMetricMode] = useState<IntensityMetric>('ALL');
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Build the past 52 weeks (364 days + padding to align to week boundary)
  const { weeks, monthLabels, mostProductiveDay, totalActiveDaysInYear, totalYearMinutes } =
    useMemo(() => {
      // Aggregate all non-deleted events by local date
      const dayMap = new Map<
        string,
        { chapters: number; pages: number; minutes: number; titles: Set<string> }
      >();

      for (const ev of events) {
        if (ev.isDeleted) continue;
        const localDate = getLocalDateString(ev.timestamp, timeZone);
        const cur = dayMap.get(localDate) || {
          chapters: 0,
          pages: 0,
          minutes: 0,
          titles: new Set<string>(),
        };

        if (ev.unit === 'CHAPTERS') cur.chapters += Math.max(0, ev.progressChange || 0);
        else if (ev.unit === 'PAGES') cur.pages += Math.max(0, ev.progressChange || 0);

        if (ev.durationSeconds > 0) {
          cur.minutes += Math.round(ev.durationSeconds / 60);
        }

        if (ev.itemTitle) {
          cur.titles.add(ev.itemTitle);
        }

        dayMap.set(localDate, cur);
      }

      // Generate 52 weeks of dates ending on current local date
      const now = new Date();
      const todayLocalDate = getLocalDateString(now.toISOString(), timeZone);
      const [curY, curM, curD] = todayLocalDate.split('-').map(Number);
      const endDate = new Date(Date.UTC(curY, curM - 1, curD));

      // End on Saturday of the current week (or Sunday) to make a full grid
      const endDayOfWeek = endDate.getUTCDay(); // 0 is Sunday
      const daysToSaturday = 6 - endDayOfWeek;
      const gridEnd = new Date(endDate.getTime() + daysToSaturday * 86_400_000);

      // 52 weeks * 7 days = 364 days back
      const gridStart = new Date(gridEnd.getTime() - (52 * 7 - 1) * 86_400_000);

      const computedWeeks: DayActivity[][] = [];
      let currentWeek: DayActivity[] = [];
      const computedMonthLabels: { month: string; weekIndex: number }[] = [];
      let lastMonthName = '';

      let maxProductive: { day: DayActivity; score: number } | null = null;
      let activeDaysCount = 0;
      let totalMins = 0;

      const cursor = new Date(gridStart.getTime());

      for (let dayIndex = 0; dayIndex < 52 * 7; dayIndex++) {
        const y = cursor.getUTCFullYear();
        const m = cursor.getUTCMonth() + 1;
        const d = cursor.getUTCDate();
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayOfWeek = cursor.getUTCDay();

        const monthName = cursor.toLocaleString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        });

        const weekIdx = Math.floor(dayIndex / 7);
        if (monthName !== lastMonthName && dayOfWeek === 0) {
          computedMonthLabels.push({ month: monthName, weekIndex: weekIdx });
          lastMonthName = monthName;
        }

        const data = dayMap.get(dateStr) || {
          chapters: 0,
          pages: 0,
          minutes: 0,
          titles: new Set<string>(),
        };

        const chapters = data.chapters;
        const pages = data.pages;
        const minutes = data.minutes;
        const titles = Array.from(data.titles);

        if (chapters > 0 || pages > 0 || minutes > 0) {
          activeDaysCount++;
          totalMins += minutes;
        }

        // Calculate intensity level based on chosen metric
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        let score = 0;

        if (metricMode === 'CHAPTERS') {
          score = chapters;
          if (chapters >= 15) level = 4;
          else if (chapters >= 8) level = 3;
          else if (chapters >= 4) level = 2;
          else if (chapters >= 1) level = 1;
        } else if (metricMode === 'PAGES') {
          score = pages;
          if (pages >= 120) level = 4;
          else if (pages >= 60) level = 3;
          else if (pages >= 25) level = 2;
          else if (pages >= 1) level = 1;
        } else if (metricMode === 'MINUTES') {
          score = minutes;
          if (minutes >= 90) level = 4;
          else if (minutes >= 50) level = 3;
          else if (minutes >= 25) level = 2;
          else if (minutes >= 1) level = 1;
        } else {
          // Weighted composite score
          score = chapters * 15 + pages * 1.5 + minutes;
          if (score >= 120) level = 4;
          else if (score >= 60) level = 3;
          else if (score >= 25) level = 2;
          else if (score > 0) level = 1;
        }

        const formattedDate = cursor.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        });

        const dayActivity: DayActivity = {
          dateStr,
          dayOfWeek,
          formattedDate,
          chapters,
          pages,
          minutes,
          titles,
          level,
        };

        if (score > 0 && (!maxProductive || score > maxProductive.score)) {
          maxProductive = { day: dayActivity, score };
        }

        currentWeek.push(dayActivity);

        if (currentWeek.length === 7) {
          computedWeeks.push(currentWeek);
          currentWeek = [];
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      return {
        weeks: computedWeeks,
        monthLabels: computedMonthLabels,
        mostProductiveDay: maxProductive?.day || null,
        totalActiveDaysInYear: activeDaysCount,
        totalYearMinutes: totalMins,
      };
    }, [events, timeZone, metricMode]);

  // Colors for each intensity level
  const getCellColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-purple-400 border-purple-300 shadow-[0_0_8px_rgba(192,132,252,0.6)]';
      case 3:
        return 'bg-violet-600 border-violet-500';
      case 2:
        return 'bg-violet-800 border-violet-700';
      case 1:
        return 'bg-violet-950/80 border-violet-900/60';
      default:
        return 'bg-[#151522] border-[#202030] hover:border-[#383852]';
    }
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-[#14141E] border border-[#242436] space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#212132] pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            Reading Activity Contribution Graph
          </h3>
          <p className="text-xs text-[#8E8EA8] mt-0.5">
            52-week intensity heatmap tracking your daily reading consistency and peak volume
          </p>
        </div>

        {/* Metric Mode Filter */}
        <div className="flex items-center gap-1.5 bg-[#191927] border border-[#28283C] p-1 rounded-xl text-xs">
          <button
            onClick={() => setMetricMode('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metricMode === 'ALL'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#8E8EA8] hover:text-white'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setMetricMode('CHAPTERS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metricMode === 'CHAPTERS'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#8E8EA8] hover:text-white'
            }`}
          >
            Chapters
          </button>
          <button
            onClick={() => setMetricMode('PAGES')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metricMode === 'PAGES'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#8E8EA8] hover:text-white'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setMetricMode('MINUTES')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metricMode === 'MINUTES'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-[#8E8EA8] hover:text-white'
            }`}
          >
            Time (Mins)
          </button>
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#191926] border border-[#242436] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 fill-violet-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {totalActiveDaysInYear} Active Days
            </div>
            <p className="text-[11px] text-[#8C8CA8]">Logged in past 52 weeks</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#191926] border border-[#242436] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-pink-400" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold text-white font-mono-numbers truncate">
              {mostProductiveDay ? mostProductiveDay.formattedDate : 'None yet'}
            </div>
            <p className="text-[11px] text-pink-300 font-medium truncate">
              {mostProductiveDay
                ? `${mostProductiveDay.chapters} ch · ${mostProductiveDay.pages} p · ${mostProductiveDay.minutes}m`
                : 'Most productive day'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#191926] border border-[#242436] flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-base font-bold text-white font-mono-numbers">
              {(totalYearMinutes / 60).toFixed(1)} Hours
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              {totalYearMinutes} minutes measured
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Stage */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="min-w-[760px] space-y-2 select-none">
          {/* Months header line */}
          <div className="flex text-[10px] font-mono text-[#73738C] pl-7 h-4 relative">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${(m.weekIndex / 52) * 100}%` }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-[#666680] pr-1 py-0.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* 52 Columns of Weeks */}
            <div className="flex flex-1 gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1 flex-1">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`aspect-square rounded-[3px] border transition-all duration-150 cursor-pointer ${getCellColor(
                        day.level
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip & Legend Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#1F1F2F] text-xs">
        {/* Dynamic Hover Status */}
        <div className="text-[#A2A2BF] text-xs min-h-[20px] flex items-center gap-2">
          {hoveredDay ? (
            <>
              <span className="font-bold text-white">{hoveredDay.formattedDate}:</span>
              <span className="text-violet-300 font-mono-numbers font-semibold">
                {hoveredDay.chapters} chapters, {hoveredDay.pages} pages, {hoveredDay.minutes} mins
              </span>
              {hoveredDay.titles.length > 0 && (
                <span className="text-[#8888A4] truncate max-w-xs">
                  ({hoveredDay.titles.slice(0, 2).join(', ')}
                  {hoveredDay.titles.length > 2 ? ` +${hoveredDay.titles.length - 2}` : ''})
                </span>
              )}
            </>
          ) : (
            <span className="text-[#72728E]">Hover over any square to see that day's reading details.</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-[#7E7E98] self-end sm:self-auto">
          <span>Less</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-[2px] bg-[#151522] border border-[#202030]" title="No activity" />
            <span className="w-3 h-3 rounded-[2px] bg-violet-950/80 border border-violet-900/60" title="Light reading" />
            <span className="w-3 h-3 rounded-[2px] bg-violet-800 border border-violet-700" title="Moderate reading" />
            <span className="w-3 h-3 rounded-[2px] bg-violet-600 border border-violet-500" title="High reading" />
            <span className="w-3 h-3 rounded-[2px] bg-purple-400 border border-purple-300" title="Peak reading" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
