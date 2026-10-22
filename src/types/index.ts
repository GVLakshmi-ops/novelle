/**
 * Novelle - Personal Reading Intelligence Platform
 * Core Domain Types & Contracts
 */

export type MediumType =
  | 'BOOK'
  | 'MANGA'
  | 'MANHWA'
  | 'WEBTOON'
  | 'WEB_NOVEL'
  | 'FANFICTION'
  | 'AUDIOBOOK'
  | 'ARTICLE';

export type ReadingStatus =
  | 'READING'
  | 'COMPLETED'
  | 'PLAN_TO_READ'
  | 'ON_HOLD'
  | 'DROPPED';

export type ProgressUnit = 'PAGES' | 'CHAPTERS' | 'MINUTES' | 'PERCENT';

export type DataProvenance =
  | 'USER_ENTERED'
  | 'PLATFORM_REPORTED'
  | 'IMPORTED'
  | 'CALCULATED'
  | 'AI_ESTIMATED';

export type PlatformSource =
  | 'MANUAL'
  | 'ANILIST'
  | 'OPEN_LIBRARY'
  | 'WEBTOON'
  | 'WATTPAD'
  | 'AO3'
  | 'ROYAL_ROAD'
  | 'OTHER';

export interface ReadingItem {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  coverUrl: string;
  medium: MediumType;
  status: ReadingStatus;
  unit: ProgressUnit;
  progress: number;
  totalProgress: number | null; // null if unknown, never 0 for unknown
  score: number | null; // 1 to 10
  genres: string[];
  tags?: string[];
  sourceUrl?: string;
  sourcePlatform: PlatformSource;
  provenance: DataProvenance;
  notes?: string;
  startDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReadingEventType =
  | 'SESSION_ENDED'
  | 'PROGRESS_UPDATED'
  | 'CHAPTER_COMPLETED'
  | 'ITEM_COMPLETED'
  | 'RATING_UPDATED'
  | 'NOTE_CREATED';

export interface ReadingEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCover?: string;
  medium: MediumType;
  type: ReadingEventType;
  timestamp: string; // ISO 8601 UTC
  durationSeconds: number; // For active timed sessions
  progressChange: number; // e.g. +3 chapters or +45 pages
  unit: ProgressUnit;
  provenance: DataProvenance;
  notes?: string;
  isDeleted?: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  isStreakActiveToday: boolean;
  activeDates: string[]; // YYYY-MM-DD in user's timezone
}

export interface UnitAggregates {
  totalPages: number;
  totalChapters: number;
  totalMinutes: number;
  itemsCompleted: number;
  itemsReading: number;
}

export interface NovelleRewindData {
  year: number;
  totalMinutes: number;
  totalPages: number;
  totalChapters: number;
  itemsCompleted: number;
  totalItemsTracked: number;
  longestStreakDays: number;
  activeDaysCount: number;
  topMedium: MediumType;
  mediumDistribution: Record<MediumType, number>;
  topGenres: { genre: string; count: number }[];
  topRated: ReadingItem[];
  peakDay: { date: string; amount: number; unit: ProgressUnit } | null;
  monthlyPace: { month: string; chapters: number; pages: number; minutes: number }[];
  // AI-generated narrative layer
  archetype: string;
  archetypeTagline: string;
  narrativeStory: string;
  keyMilestones: string[];
  literaryForecast: string;
  isAiGenerated: boolean;
}

export interface AIActivityInsight {
  headline: string;
  paceAnalysis: string;
  completionEstimates: {
    title: string;
    estimatedDaysRemaining: number | null;
    paceSummary: string;
  }[];
  slumpRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  coachingRecommendation: string;
  suggestedNextPicks: string[];
}
