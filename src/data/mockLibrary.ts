import { ReadingItem, ReadingEvent } from '../types';

export const INITIAL_ITEMS: ReadingItem[] = [
  {
    id: 'item-1',
    title: 'Omniscient Reader\'s Viewpoint',
    originalTitle: '전지적 독자 시점',
    author: 'sing N song, Sleepy-C',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    medium: 'MANHWA',
    status: 'READING',
    unit: 'CHAPTERS',
    progress: 218,
    totalProgress: 245,
    score: 9.8,
    genres: ['Action', 'Fantasy', 'Psychological', 'Apocalypse'],
    tags: ['Constellations', 'Kim Dokja', 'Regression'],
    sourceUrl: 'https://www.webtoons.com/en/action/omniscient-reader/list?title_no=2154',
    sourcePlatform: 'WEBTOON',
    provenance: 'USER_ENTERED',
    notes: 'The subway scenario and Fourth Wall lore is peak modern fiction.',
    startDate: '2024-03-10',
    createdAt: '2024-03-10T14:22:00Z',
    updatedAt: '2025-01-20T19:40:00Z',
  },
  {
    id: 'item-2',
    title: 'Solo Leveling',
    originalTitle: '나 혼자만 레벨업',
    author: 'Chugong, DUBU (REDICE)',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    medium: 'MANHWA',
    status: 'COMPLETED',
    unit: 'CHAPTERS',
    progress: 179,
    totalProgress: 179,
    score: 9.0,
    genres: ['Action', 'Supernatural', 'Dungeon'],
    tags: ['Shadow Monarch', 'Sung Jinwoo'],
    sourceUrl: 'https://anilist.co/manga/105398/Solo-Leveling/',
    sourcePlatform: 'ANILIST',
    provenance: 'IMPORTED',
    notes: 'The art by late artist DUBU is breathtaking throughout the Jeju Island arc.',
    startDate: '2024-01-05',
    completedDate: '2024-04-18',
    createdAt: '2024-01-05T09:12:00Z',
    updatedAt: '2024-04-18T22:10:00Z',
  },
  {
    id: 'item-3',
    title: 'Project Hail Mary',
    originalTitle: '',
    author: 'Andy Weir',
    coverUrl: 'https://images.unsplash.com/photo-1618609377864-68609b857e90?auto=format&fit=crop&w=600&q=80',
    medium: 'BOOK',
    status: 'COMPLETED',
    unit: 'PAGES',
    progress: 496,
    totalProgress: 496,
    score: 9.5,
    genres: ['Science Fiction', 'Space', 'Humor'],
    tags: ['Rocky', 'Amaze amaze amaze', 'First Contact'],
    sourceUrl: 'https://openlibrary.org/works/OL21634591W/Project_Hail_Mary',
    sourcePlatform: 'OPEN_LIBRARY',
    provenance: 'USER_ENTERED',
    notes: 'Fist my bump! One of the most heartwarming sci-fi duos ever written.',
    startDate: '2024-06-01',
    completedDate: '2024-06-22',
    createdAt: '2024-06-01T11:00:00Z',
    updatedAt: '2024-06-22T21:30:00Z',
  },
  {
    id: 'item-4',
    title: 'Chainsaw Man',
    originalTitle: 'チェンソーマン',
    author: 'Tatsuki Fujimoto',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    medium: 'MANGA',
    status: 'READING',
    unit: 'CHAPTERS',
    progress: 182,
    totalProgress: null, // Ongoing series, unknown total
    score: 9.2,
    genres: ['Action', 'Dark Fantasy', 'Horror', 'Supernatural'],
    tags: ['Pochita', 'Denji', 'Makima', 'Devils'],
    sourceUrl: 'https://anilist.co/manga/105778/Chainsaw-Man/',
    sourcePlatform: 'ANILIST',
    provenance: 'PLATFORM_REPORTED',
    notes: 'Fujimoto cinematics and paneling are unbelievable.',
    startDate: '2024-02-14',
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2025-02-15T18:00:00Z',
  },
  {
    id: 'item-5',
    title: 'Lord of the Mysteries',
    originalTitle: '诡秘之主',
    author: 'Cuttlefish That Loves Diving',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    medium: 'WEB_NOVEL',
    status: 'READING',
    unit: 'CHAPTERS',
    progress: 620,
    totalProgress: 1432,
    score: 9.9,
    genres: ['Steampunk', 'Lovecraftian', 'Mystery', 'Fantasy'],
    tags: ['The Fool', 'Tarot Club', 'Beyonder Pathways'],
    sourceUrl: 'https://www.webnovel.com',
    sourcePlatform: 'MANUAL',
    provenance: 'USER_ENTERED',
    notes: 'Praise the Fool! The magic system with potion pathways and acting method is genius.',
    startDate: '2024-08-01',
    createdAt: '2024-08-01T15:00:00Z',
    updatedAt: '2025-02-20T23:15:00Z',
  },
  {
    id: 'item-6',
    title: 'Tower of God',
    originalTitle: '신의 탑',
    author: 'SIU',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    medium: 'WEBTOON',
    status: 'ON_HOLD',
    unit: 'CHAPTERS',
    progress: 480,
    totalProgress: null, // ongoing
    score: 8.5,
    genres: ['Fantasy', 'Action', 'Adventure'],
    tags: ['Regulars', 'Floor of Death', 'Shinsu'],
    sourceUrl: 'https://www.webtoons.com/en/fantasy/tower-of-god/list?title_no=95',
    sourcePlatform: 'WEBTOON',
    provenance: 'USER_ENTERED',
    notes: 'Season 2 was legendary. On hold waiting for next season stack.',
    startDate: '2023-11-01',
    createdAt: '2023-11-01T12:00:00Z',
    updatedAt: '2024-09-10T16:00:00Z',
  },
  {
    id: 'item-7',
    title: 'Dune',
    originalTitle: '',
    author: 'Frank Herbert',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    medium: 'BOOK',
    status: 'COMPLETED',
    unit: 'PAGES',
    progress: 688,
    totalProgress: 688,
    score: 9.4,
    genres: ['Science Fiction', 'Classic', 'Politics'],
    tags: ['Arrakis', 'Paul Atreides', 'Spice'],
    sourceUrl: 'https://openlibrary.org/works/OL893415W/Dune',
    sourcePlatform: 'OPEN_LIBRARY',
    provenance: 'USER_ENTERED',
    notes: 'Fear is the mind-killer. Unmatched worldbuilding of ecology and politics.',
    startDate: '2024-02-01',
    completedDate: '2024-03-05',
    createdAt: '2024-02-01T18:00:00Z',
    updatedAt: '2024-03-05T20:00:00Z',
  },
  {
    id: 'item-8',
    title: 'Manacled',
    originalTitle: '',
    author: 'SenLinYu',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    medium: 'FANFICTION',
    status: 'COMPLETED',
    unit: 'CHAPTERS',
    progress: 77,
    totalProgress: 77,
    score: 9.7,
    genres: ['Drama', 'Dark Fantasy', 'Romance', 'Psychological'],
    tags: ['Dramione', 'Handmaid Tale inspired', 'Dual timelines'],
    sourceUrl: 'https://archiveofourown.org/works/14454174',
    sourcePlatform: 'AO3',
    provenance: 'USER_ENTERED',
    notes: 'Emotionally devastating, brilliantly structured non-linear memory reveal.',
    startDate: '2024-05-10',
    completedDate: '2024-05-28',
    createdAt: '2024-05-10T20:00:00Z',
    updatedAt: '2024-05-28T22:30:00Z',
  },
  {
    id: 'item-9',
    title: 'Shadow Slave',
    originalTitle: '',
    author: 'Guiltythree',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    medium: 'WEB_NOVEL',
    status: 'READING',
    unit: 'CHAPTERS',
    progress: 1450,
    totalProgress: null,
    score: 9.3,
    genres: ['Dark Fantasy', 'Action', 'Mystery'],
    tags: ['Sunny', 'Nightmare Spell', 'Forgotten Shore'],
    sourceUrl: 'https://webnovel.com',
    sourcePlatform: 'MANUAL',
    provenance: 'USER_ENTERED',
    notes: 'Sunny and Nephis dynamic on Forgotten Shore was pure tension.',
    startDate: '2024-07-15',
    createdAt: '2024-07-15T12:00:00Z',
    updatedAt: '2025-02-18T19:30:00Z',
  },
];

export function generateInitialEvents(): ReadingEvent[] {
  const events: ReadingEvent[] = [];
  const now = new Date();

  // Create realistic active reading log events across the past 360 days
  // Pattern includes regular streaks, weekend binge peaks, and occasional rest days
  for (let i = 0; i < 360; i++) {
    // Skip some days (e.g. approx 1 out of 4 days is a rest day)
    // But keep the last 30 days unbroken for an active streak
    if (i > 30 && (i % 7 === 2 || (i % 11 === 0 && i % 3 === 0))) {
      continue;
    }

    const dayDate = new Date(now.getTime() - i * 86_400_000);
    const dateStr = dayDate.toISOString();
    const dayOfWeek = dayDate.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Pick work
    const workSelector = (i * 3 + dayOfWeek) % 5;

    if (workSelector === 0) {
      // Manhwa session (e.g. Omniscient Reader)
      const ch = isWeekend ? 6 + (i % 6) : 2 + (i % 3);
      events.push({
        id: `ev-orv-${i}`,
        itemId: 'item-1',
        itemTitle: 'Omniscient Reader\'s Viewpoint',
        medium: 'MANHWA',
        type: 'CHAPTER_COMPLETED',
        timestamp: dateStr,
        durationSeconds: ch * 700,
        progressChange: ch,
        unit: 'CHAPTERS',
        provenance: 'USER_ENTERED',
        notes: ch > 7 ? 'Epic marathon reading arc' : undefined,
      });
    } else if (workSelector === 1) {
      // Web novel session (e.g. Lord of the Mysteries)
      const ch = isWeekend ? 8 + (i % 8) : 3 + (i % 4);
      events.push({
        id: `ev-lotm-${i}`,
        itemId: 'item-5',
        itemTitle: 'Lord of the Mysteries',
        medium: 'WEB_NOVEL',
        type: 'PROGRESS_UPDATED',
        timestamp: dateStr,
        durationSeconds: ch * 600,
        progressChange: ch,
        unit: 'CHAPTERS',
        provenance: 'USER_ENTERED',
        notes: ch > 10 ? 'Unstoppable midnight binge reading' : undefined,
      });
    } else if (workSelector === 2) {
      // Book session (e.g. Project Hail Mary / Dune)
      const pages = isWeekend ? 55 + (i % 40) : 22 + (i % 15);
      events.push({
        id: `ev-book-${i}`,
        itemId: i % 2 === 0 ? 'item-3' : 'item-7',
        itemTitle: i % 2 === 0 ? 'Project Hail Mary' : 'Dune',
        medium: 'BOOK',
        type: 'SESSION_ENDED',
        timestamp: dateStr,
        durationSeconds: pages * 80,
        progressChange: pages,
        unit: 'PAGES',
        provenance: 'USER_ENTERED',
      });
    } else if (workSelector === 3) {
      // Manga session (e.g. Chainsaw Man)
      const ch = isWeekend ? 7 + (i % 5) : 3 + (i % 2);
      events.push({
        id: `ev-csm-${i}`,
        itemId: 'item-4',
        itemTitle: 'Chainsaw Man',
        medium: 'MANGA',
        type: 'CHAPTER_COMPLETED',
        timestamp: dateStr,
        durationSeconds: ch * 450,
        progressChange: ch,
        unit: 'CHAPTERS',
        provenance: 'PLATFORM_REPORTED',
      });
    } else {
      // Fanfiction session (e.g. Manacled)
      const ch = isWeekend ? 5 + (i % 4) : 2 + (i % 2);
      events.push({
        id: `ev-fanfic-${i}`,
        itemId: 'item-8',
        itemTitle: 'Manacled',
        medium: 'FANFICTION',
        type: 'PROGRESS_UPDATED',
        timestamp: dateStr,
        durationSeconds: ch * 800,
        progressChange: ch,
        unit: 'CHAPTERS',
        provenance: 'USER_ENTERED',
      });
    }
  }

  return events;
}
