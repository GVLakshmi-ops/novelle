/**
 * Novelle Timezone-Aware Streak & Activity Calculator
 * Adheres strictly to the DST-safe local day boundary and event provenance rules.
 */

import { ReadingEvent, StreakStats } from '../types';

/**
 * Returns YYYY-MM-DD for a UTC ISO timestamp formatted in the specified IANA timezone.
 */
export function getLocalDateString(isoUtcString: string, timeZone: string = 'UTC'): string {
  try {
    const date = new Date(isoUtcString);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // en-CA gives YYYY-MM-DD format
  } catch {
    return isoUtcString.slice(0, 10);
  }
}

/**
 * Returns today's YYYY-MM-DD in the specified IANA timezone.
 */
export function getTodayLocalDateString(timeZone: string = 'UTC'): string {
  return getLocalDateString(new Date().toISOString(), timeZone);
}

/**
 * Returns yesterday's YYYY-MM-DD in the specified IANA timezone safely using date arithmetic on local midnight.
 */
export function getYesterdayLocalDateString(timeZone: string = 'UTC'): string {
  const now = new Date();
  // Subtract 24 hours plus safe buffer, or compute via Date
  const yesterday = new Date(now.getTime() - 86_400_000);
  return getLocalDateString(yesterday.toISOString(), timeZone);
}

/**
 * Checks whether an event qualifies for an active reading day:
 * Must be non-deleted and one of:
 * - SESSION_ENDED with duration > 0
 * - PROGRESS_UPDATED
 * - CHAPTER_COMPLETED
 * - ITEM_COMPLETED
 * (NOTE_CREATED, RATING_UPDATED alone do NOT count as active reading)
 */
export function isEventActiveDayContributor(event: ReadingEvent): boolean {
  if (event.isDeleted) return false;

  switch (event.type) {
    case 'SESSION_ENDED':
      return event.durationSeconds > 0 || event.progressChange > 0;
    case 'PROGRESS_UPDATED':
    case 'CHAPTER_COMPLETED':
    case 'ITEM_COMPLETED':
      return event.progressChange > 0 || event.type === 'ITEM_COMPLETED';
    default:
      return false;
  }
}

/**
 * Compute streaks and active day set for a list of reading events.
 */
export function calculateStreaks(
  events: ReadingEvent[],
  timeZone: string = 'UTC'
): StreakStats {
  const activeDateSet = new Set<string>();

  for (const event of events) {
    if (isEventActiveDayContributor(event)) {
      const localDate = getLocalDateString(event.timestamp, timeZone);
      activeDateSet.add(localDate);
    }
  }

  // Sorted list of distinct active dates (YYYY-MM-DD)
  const sortedDates = Array.from(activeDateSet).sort();
  const todayStr = getTodayLocalDateString(timeZone);
  const yesterdayStr = getYesterdayLocalDateString(timeZone);

  const isStreakActiveToday = activeDateSet.has(todayStr);

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeDaysCount: 0,
      isStreakActiveToday: false,
      activeDates: [],
    };
  }

  // Calculate longest streak by iterating through consecutive calendar days
  let longestStreak = 0;
  let currentRun = 0;
  let prevDateMs: number | null = null;

  for (const dateStr of sortedDates) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateMs = Date.UTC(year, month - 1, day);

    if (prevDateMs === null) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((dateMs - prevDateMs) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }

    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDateMs = dateMs;
  }

  // Calculate current streak:
  // Must end on today, or on yesterday (streak is preserved until end of today!)
  let currentStreak = 0;
  let checkDateStr = isStreakActiveToday ? todayStr : yesterdayStr;

  if (activeDateSet.has(checkDateStr)) {
    // Count backward
    let count = 0;
    let [y, m, d] = checkDateStr.split('-').map(Number);
    let targetMs = Date.UTC(y, m - 1, d);

    while (true) {
      const candidateDate = new Date(targetMs);
      const yyyy = candidateDate.getUTCFullYear();
      const mm = String(candidateDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(candidateDate.getUTCDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      if (activeDateSet.has(key)) {
        count++;
        targetMs -= 86_400_000;
      } else {
        break;
      }
    }
    currentStreak = count;
  }

  return {
    currentStreak,
    longestStreak,
    activeDaysCount: sortedDates.length,
    isStreakActiveToday,
    activeDates: sortedDates,
  };
}
