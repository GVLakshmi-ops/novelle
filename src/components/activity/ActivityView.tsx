import React, { useState, useEffect } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  Trash2,
  Undo2,
  BookOpen,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { ReadingItem, ReadingEvent, StreakStats } from '../../types';
import { getTodayLocalDateString, getLocalDateString } from '../../lib/streaks';

interface ActivityViewProps {
  items: ReadingItem[];
  events: ReadingEvent[];
  streaks: StreakStats;
  timeZone: string;
  isTimerRunning: boolean;
  timerSeconds: number;
  activeTimerItemId: string | null;
  onStartTimer: (itemId: string) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onCompleteTimerSession: (progressAmount: number, notes: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onRestoreEvent: (eventId: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  items,
  events,
  streaks,
  timeZone,
  isTimerRunning,
  timerSeconds,
  activeTimerItemId,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onCompleteTimerSession,
  onDeleteEvent,
  onRestoreEvent,
}) => {
  const readingItems = items.filter((i) => i.status === 'READING');
  const availableItems = readingItems.length > 0 ? readingItems : items;

  const [selectedItemId, setSelectedItemId] = useState<string>(
    activeTimerItemId || availableItems[0]?.id || ''
  );
  const [sessionProgress, setSessionProgress] = useState<number>(1);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [showLogCompletion, setShowLogCompletion] = useState<boolean>(false);

  useEffect(() => {
    if (activeTimerItemId) {
      setSelectedItemId(activeTimerItemId);
    }
  }, [activeTimerItemId]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFinish = () => {
    onCompleteTimerSession(sessionProgress, sessionNotes);
    setShowLogCompletion(false);
    setSessionNotes('');
    setSessionProgress(1);
  };

  // 35-day recent calendar blocks
  const calendarDays = Array.from({ length: 35 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - idx));
    const dateStr = getLocalDateString(d.toISOString(), timeZone);
    const isActive = streaks.activeDates.includes(dateStr);
    const isToday = dateStr === getTodayLocalDateString(timeZone);
    return { dateStr, isActive, isToday };
  });

  return (
    <div className="space-y-6">
      {/* Top Section: Live Reading Stopwatch */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161624] to-[#101018] border border-[#26263B] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Work Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
                <Timer className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Active Reading Session
                </h3>
                <p className="text-xs text-[#8E8EA8]">Track measured time vs. estimates</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9E9EB8] mb-1">
                Reading Target:
              </label>
              <select
                disabled={isTimerRunning}
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 disabled:opacity-60 cursor-pointer"
              >
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.medium} · Currently {item.progress}{' '}
                    {item.unit.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="flex items-center gap-2.5 text-xs text-[#A6A6C0]">
                <img
                  src={selectedItem.coverUrl}
                  alt={selectedItem.title}
                  className="w-10 h-14 object-cover rounded-md bg-[#222232]"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{selectedItem.title}</p>
                  <p className="text-[11px] text-[#7E7E98] truncate">{selectedItem.author}</p>
                  <p className="text-[11px] text-violet-400 font-mono-numbers">
                    Current: {selectedItem.progress} {selectedItem.unit.toLowerCase()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Big Digital Timer Display */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0D0D14] border border-[#202030] shadow-inner">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#777792] mb-1 flex items-center gap-1.5">
              {isTimerRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              {isTimerRunning ? 'Session In Progress' : 'Timer Ready'}
            </span>
            <div className="text-4xl md:text-5xl font-extrabold text-white font-mono-numbers tracking-tight">
              {formatTimer(timerSeconds)}
            </div>

            {timerSeconds > 0 && selectedItem && (
              <p className="text-[11px] text-emerald-400 mt-2 font-mono-numbers">
                Measured: {Math.max(1, Math.round(timerSeconds / 60))} minutes
              </p>
            )}
          </div>

          {/* Controls & Finish Session */}
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              {!isTimerRunning ? (
                <button
                  onClick={() => onStartTimer(selectedItemId)}
                  disabled={!selectedItemId}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start Timer
                </button>
              ) : (
                <button
                  onClick={onPauseTimer}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  Pause Timer
                </button>
              )}

              <button
                onClick={onResetTimer}
                disabled={timerSeconds === 0}
                className="p-3 bg-[#20202E] hover:bg-[#2A2A3E] text-[#9E9EB8] hover:text-white text-xs font-semibold rounded-xl border border-[#303046] cursor-pointer transition-colors disabled:opacity-40"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowLogCompletion(true)}
              disabled={timerSeconds === 0}
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish & Log Progress
            </button>
          </div>
        </div>

        {/* Completion Modal Prompt inside stopwatch */}
        {showLogCompletion && (
          <div className="mt-5 p-4 rounded-xl bg-[#1D1D2C] border border-violet-500/40 space-y-3 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Log Completed Reading for {selectedItem?.title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#A6A6C0] mb-1">
                  {selectedItem?.unit === 'PAGES' ? 'Pages Read' : 'Chapters Read'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={sessionProgress}
                  onChange={(e) => setSessionProgress(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#12121C] border border-[#2E2E42] rounded-lg px-3 py-1.5 text-xs text-white font-mono-numbers"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#A6A6C0] mb-1">Session Notes (Optional)</label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="e.g. Chapter 45 cliffhanger, beautiful art..."
                  className="w-full bg-[#12121C] border border-[#2E2E42] rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogCompletion(false)}
                className="px-3 py-1.5 text-xs text-[#9E9EB6] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg shadow-md cursor-pointer"
              >
                Save & Update Streak
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: 35-Day Active Reading Calendar Grid */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              35-Day Active Day Activity
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8A8AA0]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              Active Reading Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#20202E]" />
              Rest Day
            </span>
          </div>
        </div>

        {/* Calendar visual cells */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => (
            <div
              key={day.dateStr}
              className={`p-2 rounded-xl text-center border transition-all ${
                day.isActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm shadow-amber-950/20'
                  : 'bg-[#181824] border-[#222232] text-[#696982]'
              } ${day.isToday ? 'ring-2 ring-violet-500' : ''}`}
            >
              <div className="text-[10px] font-mono-numbers">{day.dateStr.slice(5)}</div>
              <div className="mt-1 flex items-center justify-center">
                {day.isActive ? (
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2C2C3E]" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-[#181826] border border-[#242436] text-[11px] text-[#8E8EA8] flex items-center justify-between">
          <span>
            <strong>Integrity Check:</strong> Active days require &ge;1 session (&gt;0s) or progress update. Note creation alone never fakes streak continuation.
          </span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Verified
          </span>
        </div>
      </div>

      {/* Bottom Section: Full Activity Audit Log */}
      <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Activity Log & Provenance Trail ({events.length} Events)
          </h3>
          <span className="text-xs text-[#8A8AA0]">Soft-deleted events are excluded from stats</span>
        </div>

        <div className="divide-y divide-[#1F1F2F]">
          {events.length === 0 ? (
            <p className="text-xs text-[#828299] text-center py-8">
              No activity recorded yet. Start reading to build your log!
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`py-3 flex items-center justify-between gap-4 transition-colors ${
                  event.isDeleted ? 'opacity-40 line-through' : 'hover:bg-[#181826]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {event.itemTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#7F7F98] mt-0.5">
                      <span className="text-emerald-400 font-mono-numbers">
                        +{event.progressChange} {event.unit.toLowerCase()}
                      </span>
                      {event.durationSeconds > 0 && (
                        <span>· {Math.round(event.durationSeconds / 60)} mins</span>
                      )}
                      <span>· {new Date(event.timestamp).toLocaleString()}</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#202030] text-[#9A9AB5] text-[10px] uppercase font-mono">
                        {event.provenance}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-[11px] text-[#A6A6BF] italic mt-0.5">
                        "{event.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!event.isDeleted ? (
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1.5 rounded-lg text-[#7C7C94] hover:text-rose-400 hover:bg-[#20202F] cursor-pointer"
                      title="Soft delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestoreEvent(event.id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#20202F] cursor-pointer"
                      title="Restore event"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
