/**
 * Novelle Analytics & Aggregations Engine
 * Computes strictly unit-separated reading aggregates, genre frequencies,
 * peak activity markers, and deterministic rewind metrics.
 */

import { ReadingItem, ReadingEvent, NovelleRewindData, MediumType, ProgressUnit } from '../types';
import { calculateStreaks, getLocalDateString } from './streaks';

export interface AggregateSummary {
  totalPages: number;
  totalChapters: number;
  totalMinutes: number;
  completedCount: number;
  inProgressCount: number;
  planToReadCount: number;
  mediumDistribution: Record<MediumType, number>;
  genreFrequency: { genre: string; count: number }[];
}

export function computeLibraryAggregates(
  items: ReadingItem[],
  events: ReadingEvent[],
  timeZone: string = 'UTC'
): AggregateSummary {
  let totalPages = 0;
  let totalChapters = 0;
  let totalMinutes = 0;

  // Aggregate progress from non-deleted events with duration/progress
  for (const event of events) {
    if (event.isDeleted) continue;
    if (event.unit === 'PAGES') {
      totalPages += Math.max(0, event.progressChange || 0);
    } else if (event.unit === 'CHAPTERS') {
      totalChapters += Math.max(0, event.progressChange || 0);
    }
    if (event.durationSeconds > 0) {
      totalMinutes += Math.round(event.durationSeconds / 60);
    }
  }

  // Count items by status and medium
  let completedCount = 0;
  let inProgressCount = 0;
  let planToReadCount = 0;

  const mediumDistribution: Record<MediumType, number> = {
    BOOK: 0,
    MANGA: 0,
    MANHWA: 0,
    WEBTOON: 0,
    WEB_NOVEL: 0,
    FANFICTION: 0,
    AUDIOBOOK: 0,
    ARTICLE: 0,
  };

  const genreMap = new Map<string, number>();

  for (const item of items) {
    if (item.status === 'COMPLETED') completedCount++;
    else if (item.status === 'READING') inProgressCount++;
    else if (item.status === 'PLAN_TO_READ') planToReadCount++;

    mediumDistribution[item.medium] = (mediumDistribution[item.medium] || 0) + 1;

    for (const genre of item.genres || []) {
      const g = genre.trim();
      if (!g) continue;
      genreMap.set(g, (genreMap.get(g) || 0) + 1);
    }
  }

  const genreFrequency = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalPages,
    totalChapters,
    totalMinutes,
    completedCount,
    inProgressCount,
    planToReadCount,
    mediumDistribution,
    genreFrequency,
  };
}

/**
 * Determine Reading Archetype based on verified mathematical weights
 */
export function determineReadingArchetype(
  mediumDistribution: Record<MediumType, number>,
  totalChapters: number,
  totalPages: number,
  completedCount: number
): { archetype: string; tagline: string } {
  const topMediumEntry = Object.entries(mediumDistribution).sort((a, b) => b[1] - a[1])[0];
  const topMedium = topMediumEntry ? (topMediumEntry[0] as MediumType) : 'BOOK';

  if (topMedium === 'MANHWA' || topMedium === 'WEBTOON') {
    return {
      archetype: 'The Infinite Scroll Devourer',
      tagline: 'You binge hundreds of cliffhanger-packed chapters before dawn.',
    };
  }

  if (topMedium === 'WEB_NOVEL') {
    return {
      archetype: 'The Cultivation Scholar',
      tagline: 'No 2,000-chapter epic or progression fantasy is too long for your appetite.',
    };
  }

  if (topMedium === 'MANGA') {
    return {
      archetype: 'The Shonen & Seinen Connoisseur',
      tagline: 'Fast-paced panel turns, intricate arcs, and iconic panels are your sanctuary.',
    };
  }

  if (topMedium === 'FANFICTION') {
    return {
      archetype: 'The Canon Transcender',
      tagline: 'When official endings fail, you seek million-word alternate universes and fix-it epics.',
    };
  }

  if (topMedium === 'AUDIOBOOK') {
    return {
      archetype: 'The Multitasking Story-Voyager',
      tagline: 'Turning commutes, walks, and workouts into literary adventures with narration.',
    };
  }

  if (completedCount >= 20 || totalPages >= 8000) {
    return {
      archetype: 'The Literary Marathoner',
      tagline: 'You power through thick tomes with laser-focused discipline and endless curiosity.',
    };
  }

  return {
    archetype: 'The Curious Bibliophile',
    tagline: 'An omnivorous explorer with eclectic taste bridging modern and classic literature.',
  };
}

/**
 * Generates verified annual/period Rewind stats.
 * Uses strictly computed figures and creates a high-fidelity deterministic narrative fallback.
 */
export function buildRewindMetrics(
  items: ReadingItem[],
  events: ReadingEvent[],
  year: number = 2025,
  timeZone: string = 'UTC'
): NovelleRewindData {
  // Filter events within targeted year
  const yearEvents = events.filter((e) => {
    if (e.isDeleted) return false;
    const localDate = getLocalDateString(e.timestamp, timeZone);
    return localDate.startsWith(String(year));
  });

  const streakStats = calculateStreaks(yearEvents, timeZone);

  let totalPages = 0;
  let totalChapters = 0;
  let totalMinutes = 0;

  const dayActivityMap = new Map<string, { pages: number; chapters: number; minutes: number }>();
  const monthMap = new Map<string, { chapters: number; pages: number; minutes: number }>();

  // Initialize 12 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (const m of months) {
    monthMap.set(m, { chapters: 0, pages: 0, minutes: 0 });
  }

  for (const event of yearEvents) {
    const localDate = getLocalDateString(event.timestamp, timeZone);
    const monthIndex = parseInt(localDate.slice(5, 7), 10) - 1;
    const monthName = months[monthIndex] || 'Jan';

    const dayEntry = dayActivityMap.get(localDate) || { pages: 0, chapters: 0, minutes: 0 };
    const monthEntry = monthMap.get(monthName) || { chapters: 0, pages: 0, minutes: 0 };

    if (event.unit === 'PAGES') {
      const p = Math.max(0, event.progressChange || 0);
      totalPages += p;
      dayEntry.pages += p;
      monthEntry.pages += p;
    } else if (event.unit === 'CHAPTERS') {
      const c = Math.max(0, event.progressChange || 0);
      totalChapters += c;
      dayEntry.chapters += c;
      monthEntry.chapters += c;
    }

    if (event.durationSeconds > 0) {
      const m = Math.round(event.durationSeconds / 60);
      totalMinutes += m;
      dayEntry.minutes += m;
      monthEntry.minutes += m;
    }

    dayActivityMap.set(localDate, dayEntry);
    monthMap.set(monthName, monthEntry);
  }

  // Completed items in this year
  const itemsCompletedInYear = items.filter((item) => {
    if (item.status !== 'COMPLETED') return false;
    if (item.completedDate) {
      return item.completedDate.startsWith(String(year));
    }
    return true; // Fallback if completed date was not explicitly logged
  });

  // Medium breakdown for year
  const mediumDistribution: Record<MediumType, number> = {
    BOOK: 0,
    MANGA: 0,
    MANHWA: 0,
    WEBTOON: 0,
    WEB_NOVEL: 0,
    FANFICTION: 0,
    AUDIOBOOK: 0,
    ARTICLE: 0,
  };

  const genreMap = new Map<string, number>();

  for (const item of items) {
    mediumDistribution[item.medium] = (mediumDistribution[item.medium] || 0) + 1;
    for (const g of item.genres || []) {
      genreMap.set(g, (genreMap.get(g) || 0) + 1);
    }
  }

  const topGenres = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topMediumEntry = Object.entries(mediumDistribution).sort((a, b) => b[1] - a[1])[0];
  const topMedium = topMediumEntry ? (topMediumEntry[0] as MediumType) : 'BOOK';

  // Peak Day calculation
  let peakDate = '';
  let peakAmount = 0;
  let peakUnit: ProgressUnit = 'CHAPTERS';

  for (const [date, data] of dayActivityMap.entries()) {
    if (data.chapters > peakAmount) {
      peakAmount = data.chapters;
      peakDate = date;
      peakUnit = 'CHAPTERS';
    } else if (data.pages > peakAmount && peakUnit !== 'CHAPTERS') {
      peakAmount = data.pages;
      peakDate = date;
      peakUnit = 'PAGES';
    }
  }

  const peakDay = peakAmount > 0 ? { date: peakDate, amount: peakAmount, unit: peakUnit } : null;

  // Monthly pace
  const monthlyPace = months.map((m) => {
    const val = monthMap.get(m)!;
    return { month: m, ...val };
  });

  // Top rated items
  const topRated = [...items]
    .filter((i) => i.score !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  const { archetype, tagline } = determineReadingArchetype(
    mediumDistribution,
    totalChapters,
    totalPages,
    itemsCompletedInYear.length
  );

  // Deterministic Narrative fallback
  const narrativeStory = `In ${year}, your reading journey spanned an astonishing breadth across multiple literary dimensions. You completed ${itemsCompletedInYear.length} works, tracked ${totalChapters} chapters and ${totalPages} pages across ${streakStats.activeDaysCount} active reading days. Your longest sustained reading streak reached ${streakStats.longestStreak} days—proving your dedication to immersing yourself in stories.`;

  const keyMilestones = [
    `Conquered ${totalChapters > 0 ? `${totalChapters.toLocaleString()} chapters` : `${totalPages.toLocaleString()} pages`} of narrative art.`,
    `Maintained a heroic ${streakStats.longestStreak}-day uninterrupted streak.`,
    `Explored ${topGenres.length > 0 ? topGenres.map((g) => g.genre).slice(0, 3).join(', ') : 'diverse genres'}.`,
  ];

  const literaryForecast = `Looking ahead, your momentum suggests you will expand deeper into ${topGenres[0]?.genre || 'captivating worlds'}, while breaking personal records for reading immersion.`;

  return {
    year,
    totalMinutes,
    totalPages,
    totalChapters,
    itemsCompleted: itemsCompletedInYear.length,
    totalItemsTracked: items.length,
    longestStreakDays: streakStats.longestStreak,
    activeDaysCount: streakStats.activeDaysCount,
    topMedium,
    mediumDistribution,
    topGenres,
    topRated,
    peakDay,
    monthlyPace,
    archetype,
    archetypeTagline: tagline,
    narrativeStory,
    keyMilestones,
    literaryForecast,
    isAiGenerated: false,
  };
}
