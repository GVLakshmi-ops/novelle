/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { OverviewView } from './components/dashboard/OverviewView';
import { LibraryView } from './components/library/LibraryView';
import { ActivityView } from './components/activity/ActivityView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { NovelleRewindView } from './components/rewind/NovelleRewindView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { AIIntelligenceView } from './components/ai/AIIntelligenceView';
import { SettingsView } from './components/settings/SettingsView';
import { AddItemModal } from './components/library/AddItemModal';
import { QuickLogModal } from './components/library/QuickLogModal';
import { AuthPage } from './components/auth/AuthPage';
import {
  getStoredItems,
  saveStoredItems,
  getStoredEvents,
  saveStoredEvents,
  getStoredTimezone,
  saveStoredTimezone,
  resetDemoData,
  clearAllData,
} from './lib/storage';
import { getCurrentUser, clearSession } from './lib/auth';
import { calculateStreaks } from './lib/streaks';
import { computeLibraryAggregates } from './lib/analytics';
import { ReadingItem, ReadingEvent } from './types';
import { User } from './types/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => !getCurrentUser());

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [items, setItems] = useState<ReadingItem[]>(() => getStoredItems(currentUser?.id));
  const [events, setEvents] = useState<ReadingEvent[]>(() => getStoredEvents(currentUser?.id));
  const [timeZone, setTimeZone] = useState<string>(() => getStoredTimezone());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Session Stopwatch
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [activeTimerItemId, setActiveTimerItemId] = useState<string | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHydratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  // Load a user's data from localStorage only (no server write cycle)
  const reloadUserData = (userId?: string) => {
    skipNextSaveRef.current = true;
    setItems(getStoredItems(userId));
    setEvents(getStoredEvents(userId));
  };

  useEffect(() => {
    const handleAuthChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      if (user) {
        reloadUserData(user.id);
      } else {
        setItems([]);
        setEvents([]);
      }
    };

    window.addEventListener('novelle_auth_changed', handleAuthChange);
    // Mark hydrated after first paint so save effects can run
    isHydratedRef.current = true;
    return () => {
      window.removeEventListener('novelle_auth_changed', handleAuthChange);
    };
  }, []);

  // Persist items — skip the cycle right after a load
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (!currentUser?.id) return;
    saveStoredItems(items, currentUser.id);
  }, [items, currentUser?.id]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (skipNextSaveRef.current) return;
    if (!currentUser?.id) return;
    saveStoredEvents(events, currentUser.id);
  }, [events, currentUser?.id]);

  // Stopwatch ticker
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Derived Streaks & Aggregates
  const streaks = useMemo(() => {
    return calculateStreaks(events, timeZone);
  }, [events, timeZone]);

  const aggregates = useMemo(() => {
    return computeLibraryAggregates(items, events, timeZone);
  }, [items, events, timeZone]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    reloadUserData(user.id);
  };

  const handleSignOut = () => {
    clearSession();
    setCurrentUser(null);
    reloadUserData(undefined);
  };

  // Fast +1 or +5 increment directly from card or shelf
  const handleQuickIncrement = (itemId: string, amount: number) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newProgress = target.progress + amount;
    const isCompleted =
      target.totalProgress !== null && newProgress >= target.totalProgress;

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          progress: newProgress,
          status: isCompleted ? ('COMPLETED' as const) : item.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    setItems(updatedItems);

    const newEvent: ReadingEvent = {
      id: `ev-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: target.id,
      itemTitle: target.title,
      medium: target.medium,
      type: isCompleted ? 'ITEM_COMPLETED' : 'PROGRESS_UPDATED',
      timestamp: new Date().toISOString(),
      durationSeconds: amount * 60,
      progressChange: amount,
      unit: target.unit,
      provenance: 'USER_ENTERED',
      notes: `Read +${amount} ${target.unit.toLowerCase()}`,
    };

    setEvents([newEvent, ...events]);
  };

  // Quick Log modal submission
  const handleLogProgress = (
    itemId: string,
    increment: number,
    durationMinutes: number,
    note: string
  ) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newProgress = target.progress + increment;
    const isCompleted =
      target.totalProgress !== null && newProgress >= target.totalProgress;

    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          progress: newProgress,
          status: isCompleted ? ('COMPLETED' as const) : item.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    setItems(updatedItems);

    const newEvent: ReadingEvent = {
      id: `ev-log-${Date.now()}`,
      itemId: target.id,
      itemTitle: target.title,
      medium: target.medium,
      type: isCompleted ? 'ITEM_COMPLETED' : 'PROGRESS_UPDATED',
      timestamp: new Date().toISOString(),
      durationSeconds: durationMinutes * 60,
      progressChange: increment,
      unit: target.unit,
      provenance: 'USER_ENTERED',
      notes: note || undefined,
    };

    setEvents([newEvent, ...events]);
  };

  // Live Timer Handlers
  const handleStartTimer = (itemId: string) => {
    setActiveTimerItemId(itemId);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setActiveTimerItemId(null);
  };

  const handleCompleteTimerSession = (progressAmount: number, notes: string) => {
    if (!activeTimerItemId) return;
    const target = items.find((i) => i.id === activeTimerItemId);
    if (!target) return;

    const finalDuration = timerSeconds;
    const newProgress = target.progress + progressAmount;
    const isCompleted =
      target.totalProgress !== null && newProgress >= target.totalProgress;

    const updatedItems = items.map((item) => {
      if (item.id === activeTimerItemId) {
        return {
          ...item,
          progress: newProgress,
          status: isCompleted ? ('COMPLETED' as const) : item.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    setItems(updatedItems);

    const newEvent: ReadingEvent = {
      id: `ev-timed-${Date.now()}`,
      itemId: target.id,
      itemTitle: target.title,
      medium: target.medium,
      type: 'SESSION_ENDED',
      timestamp: new Date().toISOString(),
      durationSeconds: finalDuration,
      progressChange: progressAmount,
      unit: target.unit,
      provenance: 'USER_ENTERED',
      notes: notes || undefined,
    };

    setEvents([newEvent, ...events]);
    handleResetTimer();
  };

  // Add Item
  const handleAddItem = (
    itemData: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newItem: ReadingItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);

    if (newItem.progress > 0) {
      const initialEvent: ReadingEvent = {
        id: `ev-init-${newItem.id}`,
        itemId: newItem.id,
        itemTitle: newItem.title,
        medium: newItem.medium,
        type: 'PROGRESS_UPDATED',
        timestamp: new Date().toISOString(),
        durationSeconds: 0,
        progressChange: newItem.progress,
        unit: newItem.unit,
        provenance: newItem.provenance,
        notes: 'Initial progress logged',
      };
      setEvents([initialEvent, ...events]);
    }
  };

  // Update item
  const handleUpdateItem = (updatedItem: ReadingItem) => {
    setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  // Soft Delete / Restore Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, isDeleted: true } : e))
    );
  };

  const handleRestoreEvent = (eventId: string) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, isDeleted: false } : e))
    );
  };

  // Bulk AniList Import
  const handleImportItems = (newItems: ReadingItem[]) => {
    const existingIds = new Set(items.map((i) => i.id));
    const itemsToAdd = newItems.filter((i) => !existingIds.has(i.id));

    setItems([...itemsToAdd, ...items]);

    const newEvents: ReadingEvent[] = itemsToAdd
      .filter((i) => i.progress > 0)
      .map((i) => ({
        id: `ev-import-${i.id}`,
        itemId: i.id,
        itemTitle: i.title,
        medium: i.medium,
        type: 'PROGRESS_UPDATED',
        timestamp: new Date().toISOString(),
        durationSeconds: 0,
        progressChange: i.progress,
        unit: i.unit,
        provenance: 'IMPORTED',
        notes: 'Imported from AniList sync',
      }));

    setEvents([...newEvents, ...events]);
  };

  // Restore backup
  const handleFullDataRestore = (data: { items: any[]; events: any[] }) => {
    setItems(data.items);
    setEvents(data.events);
  };

  // Reset Demo
  const handleResetDemo = () => {
    resetDemoData(currentUser?.id);
    setItems(getStoredItems(currentUser?.id));
    setEvents(getStoredEvents(currentUser?.id));
  };

  // Clear All
  const handleClearAll = () => {
    clearAllData(currentUser?.id);
    setItems([]);
    setEvents([]);
  };

  // Timezone Save
  const handleSaveTimezone = (tz: string) => {
    setTimeZone(tz);
    saveStoredTimezone(tz);
  };

  // Force login / sign-up as the first screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0B10]">
        <AuthPage
          onSuccess={handleAuthSuccess}
          onCancel={undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B10] text-[#F1F1F6] flex">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          streakCount={streaks.currentStreak}
          isTimerRunning={isTimerRunning}
          libraryCount={items.length}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
          <div className="w-64 bg-[#0E0E14] h-full">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              streakCount={streaks.currentStreak}
              isTimerRunning={isTimerRunning}
              libraryCount={items.length}
              currentUser={currentUser}
              onOpenAuth={() => {
                setIsMobileMenuOpen(false);
                setIsAuthOpen(true);
              }}
              onSignOut={handleSignOut}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentTab={currentTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenQuickLogModal={() => setIsQuickLogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          streakCount={streaks.currentStreak}
          timeZone={timeZone}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isTimerRunning={isTimerRunning}
          timerSeconds={timerSeconds}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewView
              items={items}
              events={events}
              streaks={streaks}
              aggregates={aggregates}
              onNavigateTab={setCurrentTab}
              onQuickIncrement={handleQuickIncrement}
              onOpenQuickLogModal={() => setIsQuickLogOpen(true)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              items={items}
              searchQuery={searchQuery}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onQuickIncrement={handleQuickIncrement}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityView
              items={items}
              events={events}
              streaks={streaks}
              timeZone={timeZone}
              isTimerRunning={isTimerRunning}
              timerSeconds={timerSeconds}
              activeTimerItemId={activeTimerItemId}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResetTimer={handleResetTimer}
              onCompleteTimerSession={handleCompleteTimerSession}
              onDeleteEvent={handleDeleteEvent}
              onRestoreEvent={handleRestoreEvent}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              items={items}
              events={events}
              streaks={streaks}
              aggregates={aggregates}
              timeZone={timeZone}
            />
          )}

          {currentTab === 'rewind' && (
            <NovelleRewindView
              items={items}
              events={events}
              timeZone={timeZone}
            />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsView
              items={items}
              onImportItems={handleImportItems}
              onFullDataRestore={handleFullDataRestore}
            />
          )}

          {currentTab === 'ai' && (
            <AIIntelligenceView
              items={items}
              streaks={streaks}
              timeZone={timeZone}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              timeZone={timeZone}
              onSaveTimezone={handleSaveTimezone}
              onResetDemoData={handleResetDemo}
              onClearAllData={handleClearAll}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        items={items}
        onLogProgress={handleLogProgress}
      />

      {/* Auth Modal / Page */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AuthPage
            onSuccess={handleAuthSuccess}
            onCancel={() => setIsAuthOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
