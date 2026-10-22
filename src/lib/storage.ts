/**
 * Novelle Local State & Persistence Store
 * Per-user isolation via localStorage. Server sync is opt-in and debounced elsewhere.
 */

import { ReadingItem, ReadingEvent } from '../types';
import { INITIAL_ITEMS, generateInitialEvents } from '../data/mockLibrary';

const TIMEZONE_KEY = 'novelle_user_timezone';

export function getUserItemsKey(userId?: string): string {
  if (!userId) return 'novelle_library_items_guest';
  return `novelle_library_items_${userId}`;
}

export function getUserEventsKey(userId?: string): string {
  if (!userId) return 'novelle_activity_events_guest';
  return `novelle_activity_events_${userId}`;
}

export function getStoredItems(userId?: string): ReadingItem[] {
  try {
    const key = getUserItemsKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    if (userId === 'usr-demo-01') {
      localStorage.setItem(key, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    localStorage.setItem(key, JSON.stringify([]));
    return [];
  } catch {
    return userId === 'usr-demo-01' ? INITIAL_ITEMS : [];
  }
}

export function saveStoredItems(items: ReadingItem[], userId?: string): void {
  try {
    const key = getUserItemsKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items:', err);
  }
}

export function getStoredEvents(userId?: string): ReadingEvent[] {
  try {
    const key = getUserEventsKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    if (userId === 'usr-demo-01') {
      const initial = generateInitialEvents();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    localStorage.setItem(key, JSON.stringify([]));
    return [];
  } catch {
    return userId === 'usr-demo-01' ? generateInitialEvents() : [];
  }
}

export function saveStoredEvents(events: ReadingEvent[], userId?: string): void {
  try {
    const key = getUserEventsKey(userId);
    localStorage.setItem(key, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events:', err);
  }
}

/** Optional: push current library to server (call sparingly, e.g. on logout or manual sync) */
export function syncLibraryToServer(
  userId: string,
  items: ReadingItem[],
  events: ReadingEvent[]
): void {
  if (!userId) return;
  fetch('/api/user/library', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ items, events }),
  }).catch(() => {});
}

export function getStoredTimezone(): string {
  try {
    const stored = localStorage.getItem(TIMEZONE_KEY);
    if (stored) return stored;
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function saveStoredTimezone(tz: string): void {
  try {
    localStorage.setItem(TIMEZONE_KEY, tz);
  } catch (err) {
    console.error('Failed to save timezone:', err);
  }
}

export function resetDemoData(userId?: string): void {
  localStorage.setItem(getUserItemsKey(userId), JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(getUserEventsKey(userId), JSON.stringify(generateInitialEvents()));
}

export function clearAllData(userId?: string): void {
  localStorage.setItem(getUserItemsKey(userId), JSON.stringify([]));
  localStorage.setItem(getUserEventsKey(userId), JSON.stringify([]));
}
