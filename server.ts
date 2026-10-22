import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side with User-Agent header as required
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// 1. GEMINI AI: NOVELLE REWIND NARRATION
// ==========================================
app.post('/api/gemini/rewind', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = req.body;
    if (!stats || typeof stats !== 'object') {
      res.status(400).json({ error: 'Missing computed stats object' });
      return;
    }

    if (!ai) {
      res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected. Using deterministic narrative.',
      });
      return;
    }

    const prompt = `Here are the verified pre-computed annual reading metrics for the reader for ${stats.year || 2025}:
- Total Reading Time: ${stats.totalMinutes || 0} minutes
- Total Pages Read: ${stats.totalPages || 0} pages
- Total Chapters Read: ${stats.totalChapters || 0} chapters
- Works Completed: ${stats.itemsCompleted || 0}
- Longest Streak: ${stats.longestStreakDays || 0} consecutive active days
- Total Active Days: ${stats.activeDaysCount || 0} days
- Primary Medium: ${stats.topMedium || 'Books & Graphic Novels'}
- Format Distribution: ${JSON.stringify(stats.mediumDistribution || {})}
- Favorite Genres: ${JSON.stringify(stats.topGenres || [])}
- Peak Day: ${stats.peakDay ? `${stats.peakDay.amount} ${stats.peakDay.unit} on ${stats.peakDay.date}` : 'None logged'}
- Highest Rated Works: ${JSON.stringify(stats.topRated?.map((t: any) => ({ title: t.title, score: t.score, medium: t.medium })) || [])}

Transform these exact statistics into an evocative Spotify-Wrapped-style Novelle Rewind recap.
Narrate ONLY these facts. Do not fabricate unmentioned metrics. Give them a cool literary archetype, 3 lyrical narrative paragraphs celebrating their journey, 3 notable key milestones, and a playful literary forecast.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are the bard of Novelle Rewind. You synthesize computed reading statistics into memorable, witty, prestigious, and emotionally resonant wrap stories. You strictly respect the user\'s actual numbers without hallucinating unmeasured metrics.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: {
              type: Type.STRING,
              description: 'A poetic 3-4 word reader archetype title, e.g. "The Astral Dungeon Chronicler"',
            },
            archetypeTagline: {
              type: Type.STRING,
              description: 'One witty, punchy sentence defining this reading identity',
            },
            narrativeStory: {
              type: Type.STRING,
              description: 'A 2-3 paragraph captivating narrative celebrating their reading accomplishments and tastes',
            },
            keyMilestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 distinct bullet summaries highlighting their peak stats',
            },
            literaryForecast: {
              type: Type.STRING,
              description: 'A playful and inspiring forecast for where their reading curiosity will lead next',
            },
          },
          required: ['archetype', 'archetypeTagline', 'narrativeStory', 'keyMilestones', 'literaryForecast'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed, isAiGenerated: true });
  } catch (err: any) {
    console.error('Error in /api/gemini/rewind:', err?.message || err);
    res.status(200).json({
      fallback: true,
      error: err?.message || 'Gemini Rewind failed',
    });
  }
});

// ==========================================
// 2. GEMINI AI: ACTIVITY INSIGHTS & COACH
// ==========================================
app.post('/api/gemini/activity-insights', async (req: Request, res: Response): Promise<void> => {
  try {
    const { inProgressItems, streakStats, recentVelocity, timeZone } = req.body;

    if (!ai) {
      res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected. Using deterministic insights.',
      });
      return;
    }

    const prompt = `Current Reader Activity & Library snapshot:
- In-Progress Items: ${JSON.stringify(
      inProgressItems?.map((i: any) => ({
        title: i.title,
        medium: i.medium,
        progress: i.progress,
        total: i.totalProgress,
        unit: i.unit,
      })) || []
    )}
- Current Streak: ${streakStats?.currentStreak || 0} days (Longest: ${streakStats?.longestStreak || 0})
- Active Days This Month: ${streakStats?.activeDaysCount || 0}
- Reading Velocity Summary: ${recentVelocity || 'Regular steady pace'}
- Timezone: ${timeZone || 'UTC'}

Provide sharp, motivating reading intelligence:
1. An overall headline assessing their momentum.
2. Pace analysis across chapters and pages.
3. Estimated days to finish their top current works (if total is known, calculate realistic remaining days based on average chapter/page speed; if unknown, note that it is an ongoing serial).
4. Slump risk diagnosis (LOW, MODERATE, HIGH) with tactical advice.
5. 3 curated "Next Read" suggestions based on their ongoing themes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are the Novelle Personal Reading Intelligence Coach. You offer actionable, compassionate, and precise advice on maintaining reading habits without guilt.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            paceAnalysis: { type: Type.STRING },
            completionEstimates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estimatedDaysRemaining: { type: Type.INTEGER, nullable: true },
                  paceSummary: { type: Type.STRING },
                },
                required: ['title', 'paceSummary'],
              },
            },
            slumpRiskLevel: {
              type: Type.STRING,
              enum: ['LOW', 'MODERATE', 'HIGH'],
            },
            coachingRecommendation: { type: Type.STRING },
            suggestedNextPicks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'headline',
            'paceAnalysis',
            'completionEstimates',
            'slumpRiskLevel',
            'coachingRecommendation',
            'suggestedNextPicks',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in /api/gemini/activity-insights:', err?.message || err);
    res.status(200).json({
      fallback: true,
      error: err?.message || 'Insights failed',
    });
  }
});

// ==========================================
// 3. ANILIST GRAPHQL SYNC & SEARCH
// ==========================================
app.post('/api/anilist/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName } = req.body;
    if (!userName || typeof userName !== 'string') {
      res.status(400).json({ error: 'Valid AniList username is required' });
      return;
    }

    const query = `
      query ($userName: String) {
        MediaListCollection(userName: $userName, type: MANGA) {
          lists {
            name
            status
            entries {
              id
              status
              score(format: POINT_10_DECIMAL)
              progress
              progressVolumes
              updatedAt
              createdAt
              media {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  medium
                }
                chapters
                volumes
                format
                genres
                status
                averageScore
                siteUrl
                description
              }
            }
          }
        }
      }
    `;

    const anilistRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { userName: userName.trim() },
      }),
    });

    if (!anilistRes.ok) {
      const errText = await anilistRes.text();
      res.status(anilistRes.status).json({
        error: `AniList API error (${anilistRes.status}): User '${userName}' not found or profile is private.`,
        details: errText,
      });
      return;
    }

    const data = await anilistRes.json();
    const lists = data?.data?.MediaListCollection?.lists || [];

    const normalizedItems: any[] = [];
    const statusMap: Record<string, string> = {
      CURRENT: 'READING',
      COMPLETED: 'COMPLETED',
      PLANNING: 'PLAN_TO_READ',
      PAUSED: 'ON_HOLD',
      DROPPED: 'DROPPED',
    };

    const mediumMap: Record<string, string> = {
      MANGA: 'MANGA',
      NOVEL: 'WEB_NOVEL',
      ONE_SHOT: 'MANGA',
    };

    for (const list of lists) {
      for (const entry of list.entries || []) {
        const media = entry.media;
        if (!media) continue;

        const title =
          media.title?.english ||
          media.title?.romaji ||
          media.title?.native ||
          'Untitled Manga';

        const medium = (media.format === 'NOVEL' ? 'WEB_NOVEL' : 'MANGA') as any;

        normalizedItems.push({
          id: `anilist-${media.id}`,
          title,
          originalTitle: media.title?.native || media.title?.romaji || '',
          author: 'AniList Tracked Creator',
          coverUrl: media.coverImage?.large || media.coverImage?.medium || '',
          medium,
          status: statusMap[entry.status] || 'READING',
          unit: 'CHAPTERS',
          progress: entry.progress || 0,
          totalProgress: media.chapters || null,
          score: entry.score > 0 ? entry.score : null,
          genres: media.genres || [],
          tags: ['AniList Sync', media.status].filter(Boolean),
          sourceUrl: media.siteUrl || `https://anilist.co/manga/${media.id}`,
          sourcePlatform: 'ANILIST',
          provenance: 'PLATFORM_REPORTED',
          notes: media.description
            ? media.description.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...'
            : '',
          createdAt: entry.createdAt
            ? new Date(entry.createdAt * 1000).toISOString()
            : new Date().toISOString(),
          updatedAt: entry.updatedAt
            ? new Date(entry.updatedAt * 1000).toISOString()
            : new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      userName,
      count: normalizedItems.length,
      items: normalizedItems,
    });
  } catch (err: any) {
    console.error('Error syncing AniList:', err);
    res.status(500).json({ error: err.message || 'Failed to sync with AniList' });
  }
});

// Search AniList by Title
app.get('/api/anilist/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      res.json({ results: [] });
      return;
    }

    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 12) {
          media(search: $search, type: MANGA) {
            id
            title {
              english
              romaji
              native
            }
            coverImage {
              large
              medium
            }
            chapters
            volumes
            format
            genres
            description
            averageScore
            siteUrl
            countryOfOrigin
          }
        }
      }
    `;

    const anilistRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: q.trim() },
      }),
    });

    if (!anilistRes.ok) {
      res.status(anilistRes.status).json({ error: 'AniList search failed' });
      return;
    }

    const data = await anilistRes.json();
    const mediaList = data?.data?.Page?.media || [];

    const results = mediaList.map((m: any) => {
      // Differentiate Manhwa (KR), Manhua (CN), Manga (JP), Light Novel
      let detectedMedium = 'MANGA';
      if (m.format === 'NOVEL') {
        detectedMedium = 'WEB_NOVEL';
      } else if (m.countryOfOrigin === 'KR') {
        detectedMedium = 'MANHWA';
      }

      return {
        id: `anilist-${m.id}`,
        title: m.title?.english || m.title?.romaji || m.title?.native,
        originalTitle: m.title?.native || '',
        coverUrl: m.coverImage?.large || m.coverImage?.medium || '',
        chapters: m.chapters || null,
        medium: detectedMedium,
        genres: m.genres || [],
        score: m.averageScore ? m.averageScore / 10 : null,
        siteUrl: m.siteUrl,
        description: m.description ? m.description.replace(/<[^>]*>?/gm, '').slice(0, 180) + '...' : '',
      };
    });

    res.json({ results });
  } catch (err: any) {
    console.error('AniList search error:', err);
    res.status(500).json({ error: 'AniList search failed' });
  }
});

// ==========================================
// 4. OPEN LIBRARY BOOKS SEARCH
// ==========================================
app.get('/api/openlibrary/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      res.json({ results: [] });
      return;
    }

    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      q.trim()
    )}&limit=10&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i,subject`;

    const olRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Novelle-Reader/1.0 (contact@novelle.app)',
      },
    });

    if (!olRes.ok) {
      res.status(olRes.status).json({ error: 'Open Library request failed' });
      return;
    }

    const data = await olRes.json();
    const docs = data?.docs || [];

    const results = docs.map((doc: any) => {
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

      return {
        id: `ol-${doc.key?.replace('/works/', '') || Math.random().toString(36).slice(2)}`,
        title: doc.title,
        author: doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Unknown Author',
        publishYear: doc.first_publish_year || null,
        pages: doc.number_of_pages_median || null,
        coverUrl,
        medium: 'BOOK',
        genres: doc.subject ? doc.subject.slice(0, 4) : ['General'],
        sourceUrl: doc.key ? `https://openlibrary.org${doc.key}` : 'https://openlibrary.org',
      };
    });

    res.json({ results });
  } catch (err: any) {
    console.error('OpenLibrary search error:', err);
    res.status(500).json({ error: 'Open Library search failed' });
  }
});

// ==========================================
// 5. MULTI-USER AUTHENTICATION & DATA STORAGE
// ==========================================
const DATA_DIR = path.resolve('.', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LIBRARIES_DIR = path.join(DATA_DIR, 'libraries');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LIBRARIES_DIR)) fs.mkdirSync(LIBRARIES_DIR, { recursive: true });

interface StoredUser {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function getStoredUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Seed default demo user: demo@novelle.app / demo123
      const demoSalt = crypto.randomBytes(16).toString('hex');
      const demoHash = hashPassword('demo123', demoSalt);
      const defaultUsers: StoredUser[] = [
        {
          id: 'usr-demo-01',
          name: 'Elena Vance',
          email: 'demo@novelle.app',
          salt: demoSalt,
          hash: demoHash,
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 1. Create Account / Register
app.post('/api/auth/register', (req: Request, res: Response): void => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || password.length < 6) {
      res.status(400).json({ error: 'Please enter a valid email and a password of at least 6 characters.' });
      return;
    }

    const users = getStoredUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      res.status(400).json({ error: 'An account with this email address already exists. Please sign in instead.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: String(name).trim(),
      email: cleanEmail,
      salt,
      hash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    const token = `token-${newUser.id}-${Date.now()}`;
    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 2. Sign In / Login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.hash) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = `token-${user.id}-${Date.now()}`;
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Quick 1-Click Demo Login
app.post('/api/auth/demo', (_req: Request, res: Response): void => {
  try {
    const users = getStoredUsers();
    let demoUser = users.find((u) => u.email === 'demo@novelle.app');
    if (!demoUser) {
      const demoSalt = crypto.randomBytes(16).toString('hex');
      const demoHash = hashPassword('demo123', demoSalt);
      demoUser = {
        id: 'usr-demo-01',
        name: 'Elena Vance',
        email: 'demo@novelle.app',
        salt: demoSalt,
        hash: demoHash,
        createdAt: new Date().toISOString(),
      };
      users.push(demoUser);
      saveStoredUsers(users);
    }

    res.json({
      success: true,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        createdAt: demoUser.createdAt,
      },
      token: `demo-token-${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Demo login failed' });
  }
});

// 4. Per-User Library Data Sync: GET
app.get('/api/user/library', (req: Request, res: Response): void => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(400).json({ error: 'Missing x-user-id header' });
      return;
    }

    const userFile = path.join(LIBRARIES_DIR, `${userId}.json`);
    if (fs.existsSync(userFile)) {
      const data = JSON.parse(fs.readFileSync(userFile, 'utf-8'));
      res.json({ success: true, ...data });
    } else {
      res.json({ success: true, items: null, events: null });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user library' });
  }
});

// 5. Per-User Library Data Sync: POST
app.post('/api/user/library', (req: Request, res: Response): void => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { items, events } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'Missing x-user-id header' });
      return;
    }

    const userFile = path.join(LIBRARIES_DIR, `${userId}.json`);
    fs.writeFileSync(
      userFile,
      JSON.stringify({ items: items || [], events: events || [], updatedAt: new Date().toISOString() }, null, 2)
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to persist user library' });
  }
});

// ==========================================
// 6. SERVER STATIC / VITE MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('.', 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('.', 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Novelle server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in server.ts:', err);
});
