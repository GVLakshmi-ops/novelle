import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ReadingItem, MediumType, ProgressUnit, PlatformSource } from '../../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [activeTab, setActiveTab] = useState<'anilist' | 'openlibrary' | 'manual'>('anilist');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [medium, setMedium] = useState<MediumType>('MANHWA');
  const [status, setStatus] = useState<ReadingItem['status']>('READING');
  const [unit, setUnit] = useState<ProgressUnit>('CHAPTERS');
  const [progress, setProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState<string>(''); // string for easy empty/null handling
  const [score, setScore] = useState<string>('9.0');
  const [genres, setGenres] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<PlatformSource>('MANUAL');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Search AniList
  const handleAniListSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/anilist/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.results || []);
      if ((data.results || []).length === 0) {
        setSearchError('No manga or manhwa found matching your query.');
      }
    } catch (err: any) {
      setSearchError('Unable to connect to AniList search service.');
    } finally {
      setIsSearching(false);
    }
  };

  // Search Open Library
  const handleOpenLibrarySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.results || []);
      if ((data.results || []).length === 0) {
        setSearchError('No books found on Open Library matching this query.');
      }
    } catch (err: any) {
      setSearchError('Unable to connect to Open Library search service.');
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search result to import
  const handleSelectSearchResult = (result: any) => {
    if (activeTab === 'anilist') {
      onAddItem({
        title: result.title,
        originalTitle: result.originalTitle || '',
        author: 'AniList Creator',
        coverUrl: result.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        medium: result.medium || 'MANGA',
        status: 'READING',
        unit: 'CHAPTERS',
        progress: 0,
        totalProgress: result.chapters || null,
        score: result.score || null,
        genres: result.genres || [],
        tags: ['AniList Import'],
        sourceUrl: result.siteUrl || '',
        sourcePlatform: 'ANILIST',
        provenance: 'IMPORTED',
        notes: result.description || '',
      });
      onClose();
    } else if (activeTab === 'openlibrary') {
      onAddItem({
        title: result.title,
        originalTitle: '',
        author: result.author || 'Unknown Author',
        coverUrl: result.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        medium: 'BOOK',
        status: 'READING',
        unit: 'PAGES',
        progress: 0,
        totalProgress: result.pages || null,
        score: null,
        genres: result.genres || ['Fiction'],
        tags: ['Open Library Import'],
        sourceUrl: result.sourceUrl || '',
        sourcePlatform: 'OPEN_LIBRARY',
        provenance: 'IMPORTED',
        notes: `First published in ${result.publishYear || 'N/A'}`,
      });
      onClose();
    }
  };

  // Manual submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTotal = totalProgress.trim() === '' ? null : parseInt(totalProgress, 10);
    const parsedScore = score.trim() === '' ? null : parseFloat(score);

    onAddItem({
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      author: author.trim() || 'Unknown Creator',
      coverUrl:
        coverUrl.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      medium,
      status,
      unit,
      progress: Math.max(0, Number(progress) || 0),
      totalProgress: isNaN(parsedTotal as any) ? null : parsedTotal,
      score: isNaN(parsedScore as any) ? null : parsedScore,
      genres: genres
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
      tags: [sourcePlatform],
      sourceUrl: sourceUrl.trim() || undefined,
      sourcePlatform,
      provenance: 'USER_ENTERED',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#14141E] border border-[#2A2A3D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#232334] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-400" />
              Add to Library
            </h2>
            <p className="text-xs text-[#8E8EA8]">
              Import directly from AniList, Open Library, or catalog manually
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E8EA8] hover:text-white hover:bg-[#1E1E2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#232334] bg-[#0E0E16]">
          <button
            onClick={() => {
              setActiveTab('anilist');
              setSearchResults([]);
              setSearchError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'anilist'
                ? 'border-violet-500 text-white bg-violet-500/10'
                : 'border-transparent text-[#7F7F9E] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            AniList Search (Manga / Manhwa)
          </button>
          <button
            onClick={() => {
              setActiveTab('openlibrary');
              setSearchResults([]);
              setSearchError(null);
            }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'openlibrary'
                ? 'border-violet-500 text-white bg-violet-500/10'
                : 'border-transparent text-[#7F7F9E] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Open Library (Books & Novels)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-violet-500 text-white bg-violet-500/10'
                : 'border-transparent text-[#7F7F9E] hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
            Manual / Webtoon / Fanfic
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'anilist' && (
            <div className="space-y-4">
              <form onSubmit={handleAniListSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#6A6A88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search manga or manhwa by title (e.g., Solo Leveling, Chainsaw Man)..."
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </form>

              {searchError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-3 rounded-xl bg-[#1A1A28] border border-[#262638] hover:border-violet-500/50 hover:bg-[#202032] flex gap-3 cursor-pointer transition-all group"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-16 h-22 object-cover rounded-lg bg-[#242436] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-violet-300 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#8E8EA8] truncate">{item.medium} · {item.genres.slice(0, 2).join(', ')}</p>
                        <p className="text-[10px] text-emerald-400 font-mono-numbers mt-1">
                          {item.chapters ? `${item.chapters} Chapters` : 'Ongoing serialization'}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-violet-400 group-hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add to Library
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'openlibrary' && (
            <div className="space-y-4">
              <form onSubmit={handleOpenLibrarySearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#6A6A88] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search books by title, author, or ISBN (e.g., Dune, Project Hail Mary)..."
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#686882] focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search Books
                </button>
              </form>

              {searchError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-3 rounded-xl bg-[#1A1A28] border border-[#262638] hover:border-sky-500/50 hover:bg-[#202032] flex gap-3 cursor-pointer transition-all group"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-16 h-22 object-cover rounded-lg bg-[#242436] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#8E8EA8] truncate">{item.author}</p>
                        <p className="text-[10px] text-sky-400 font-mono-numbers mt-1">
                          {item.pages ? `${item.pages} Pages` : 'Book Edition'}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-sky-400 group-hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add to Library
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs text-violet-300">
                💡 <strong>Webtoons, Wattpad & Fanfiction:</strong> Direct URL cataloging and manual chapter logging are supported here without violating platform terms of service.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Omniscient Reader, Tower of God"
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Original / Native Title
                  </label>
                  <input
                    type="text"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    placeholder="e.g. 전지적 독자 시점"
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Author / Creator
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Medium
                  </label>
                  <select
                    value={medium}
                    onChange={(e) => {
                      const m = e.target.value as MediumType;
                      setMedium(m);
                      if (m === 'BOOK') setUnit('PAGES');
                      else setUnit('CHAPTERS');
                    }}
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="MANHWA">Manhwa</option>
                    <option value="WEBTOON">Webtoon</option>
                    <option value="MANGA">Manga</option>
                    <option value="WEB_NOVEL">Web Novel</option>
                    <option value="BOOK">Book</option>
                    <option value="FANFICTION">Fanfiction</option>
                    <option value="AUDIOBOOK">Audiobook</option>
                    <option value="ARTICLE">Article</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="READING">Currently Reading</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PLAN_TO_READ">Plan to Read</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ProgressUnit)}
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="CHAPTERS">Chapters</option>
                    <option value="PAGES">Pages</option>
                    <option value="MINUTES">Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Current Progress
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Total (Blank if unknown)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalProgress}
                    onChange={(e) => setTotalProgress(e.target.value)}
                    placeholder="Unknown"
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Score (1 - 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="9.5"
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Platform / Origin
                  </label>
                  <select
                    value={sourcePlatform}
                    onChange={(e) => setSourcePlatform(e.target.value as PlatformSource)}
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="WEBTOON">WEBTOON</option>
                    <option value="WATTPAD">Wattpad</option>
                    <option value="AO3">Archive of Our Own (AO3)</option>
                    <option value="ROYAL_ROAD">Royal Road</option>
                    <option value="ANILIST">AniList</option>
                    <option value="OPEN_LIBRARY">Open Library</option>
                    <option value="MANUAL">Custom / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                    Web Link / URL
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                  Genres (comma-separated)
                </label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="e.g. Fantasy, Action, Psychological"
                  className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A6C0] mb-1">
                  Private Notes / Review
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thoughts, favorite quotes, or bookmark reminders..."
                  className="w-full bg-[#181824] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#20202F] hover:bg-[#2B2B3E] text-xs font-medium text-[#B2B2C9] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white rounded-xl shadow-md shadow-violet-950/40 transition-all cursor-pointer"
                >
                  Save to Library
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
