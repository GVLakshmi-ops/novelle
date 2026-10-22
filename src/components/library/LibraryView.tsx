import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List as ListIcon,
  Star,
  ExternalLink,
  Trash2,
  Edit3,
  BookOpen,
  Check,
  ChevronDown,
} from 'lucide-react';
import { ReadingItem, MediumType, ReadingStatus } from '../../types';

interface LibraryViewProps {
  items: ReadingItem[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onQuickIncrement: (itemId: string, amount: number) => void;
  onUpdateItem: (item: ReadingItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  items,
  searchQuery,
  onOpenAddModal,
  onQuickIncrement,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'ALL'>('ALL');
  const [mediumFilter, setMediumFilter] = useState<MediumType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title' | 'progress'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingItem, setEditingItem] = useState<ReadingItem | null>(null);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
        if (mediumFilter !== 'ALL' && item.medium !== mediumFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesOriginal = item.originalTitle?.toLowerCase().includes(q);
          const matchesAuthor = item.author.toLowerCase().includes(q);
          const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesOriginal && !matchesAuthor && !matchesGenre) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'progress') return b.progress - a.progress;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, statusFilter, mediumFilter, searchQuery, sortBy]);

  const statusTabs: { id: ReadingStatus | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Items' },
    { id: 'READING', label: 'Reading' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'PLAN_TO_READ', label: 'Plan to Read' },
    { id: 'ON_HOLD', label: 'On Hold' },
    { id: 'DROPPED', label: 'Dropped' },
  ];

  const mediumOptions: { id: MediumType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Mediums' },
    { id: 'MANHWA', label: 'Manhwa' },
    { id: 'WEBTOON', label: 'Webtoon' },
    { id: 'MANGA', label: 'Manga' },
    { id: 'WEB_NOVEL', label: 'Web Novel' },
    { id: 'BOOK', label: 'Books' },
    { id: 'FANFICTION', label: 'Fanfiction' },
    { id: 'AUDIOBOOK', label: 'Audiobooks' },
  ];

  return (
    <div className="space-y-5">
      {/* Controls Bar: Status tabs + Search + View toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#212130] pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? items.length
                : items.filter((i) => i.status === tab.id).length;
            const isActive = statusFilter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/40'
                    : 'text-[#8E8EA8] hover:text-white hover:bg-[#181826]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono-numbers px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#222234] text-[#8C8CA4]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Medium + Sort + Layout selectors */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Medium Filter Dropdown */}
          <select
            value={mediumFilter}
            onChange={(e) => setMediumFilter(e.target.value as any)}
            className="bg-[#161622] border border-[#28283C] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {mediumOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#161622] border border-[#28283C] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="updated">Recently Updated</option>
            <option value="score">Highest Rated</option>
            <option value="progress">Highest Progress</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-[#161622] border border-[#28283C] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#26263A] text-white' : 'text-[#73738C] hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer ${
                viewMode === 'list' ? 'bg-[#26263A] text-white' : 'text-[#73738C] hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Display */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#14141E] border border-[#222234] space-y-3">
          <BookOpen className="w-10 h-10 text-[#6B6B8A] mx-auto" />
          <h3 className="text-sm font-bold text-white">No items found</h3>
          <p className="text-xs text-[#8E8EA8] max-w-sm mx-auto">
            Try adjusting your search filters or add a new work from AniList, Open Library, or manual link.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Add New Work
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => {
            const hasTotal = item.totalProgress !== null && item.totalProgress > 0;
            const percent = hasTotal
              ? Math.min(100, Math.round((item.progress / (item.totalProgress as number)) * 100))
              : null;

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#14141E] border border-[#232336] hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/20 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Cover with Overlay Badges */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1E1E2C]">
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top tags */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/10">
                      {item.medium}
                    </span>
                    {item.score && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-300" />
                        {item.score}
                      </span>
                    )}
                  </div>

                  {/* Quick Edit Overlay button */}
                  <button
                    onClick={() => setEditingItem(item)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/75 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600 cursor-pointer shadow-md"
                    title="Edit item details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#8686A2] line-clamp-1 mt-0.5">
                      {item.author}
                    </p>

                    <div className="mt-2 text-xs font-mono-numbers flex items-center justify-between">
                      <span className="text-white font-semibold">
                        {item.progress}{' '}
                        <span className="text-[10px] text-[#71718D] font-normal">
                          {hasTotal ? `/ ${item.totalProgress}` : ''} {item.unit.toLowerCase()}
                        </span>
                      </span>
                      {percent !== null && (
                        <span className="text-[11px] text-violet-400 font-bold">
                          {percent}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar (if total known) */}
                    {hasTotal && (
                      <div className="w-full bg-[#202030] h-1 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Actions: +1 Quick Progress */}
                  <div className="mt-3 pt-2 border-t border-[#1F1F2F] flex items-center justify-between gap-1">
                    <button
                      onClick={() => onQuickIncrement(item.id, 1)}
                      className="flex-1 py-1 rounded-lg bg-[#1B1B28] hover:bg-violet-600 hover:text-white text-[11px] font-semibold text-[#A6A6C0] border border-[#2A2A3E] transition-colors cursor-pointer text-center"
                    >
                      +1 {item.unit === 'PAGES' ? 'p' : 'ch'}
                    </button>
                    <button
                      onClick={() => onQuickIncrement(item.id, 5)}
                      className="px-2 py-1 rounded-lg bg-[#1B1B28] hover:bg-[#252538] text-[11px] font-semibold text-[#80809C] border border-[#2A2A3E] transition-colors cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-[#14141E] border border-[#242436] rounded-2xl overflow-hidden divide-y divide-[#1F1F2F]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 hover:bg-[#181826] transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-10 h-14 object-cover rounded-lg bg-[#202030] flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1F1F2E] text-[#8E8EA8] border border-[#2C2C3E]">
                      {item.medium}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    {item.score && (
                      <span className="text-[11px] text-amber-300 font-bold font-mono-numbers">
                        ★ {item.score}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7C7C98] truncate mt-0.5">
                    {item.author} · {item.genres.slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>

              {/* Progress & Quick Actions */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs font-mono-numbers font-bold text-white">
                    {item.progress}{' '}
                    <span className="text-[11px] text-[#7E7E98] font-normal">
                      {item.totalProgress ? `/ ${item.totalProgress}` : ''} {item.unit.toLowerCase()}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-violet-400">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onQuickIncrement(item.id, 1)}
                    className="px-2.5 py-1 rounded-lg bg-[#202030] hover:bg-violet-600 hover:text-white text-xs font-semibold text-[#B0B0C8] border border-[#2E2E42] cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg bg-[#202030] hover:bg-[#2A2A3E] text-[#8C8CA4] hover:text-white border border-[#2E2E42] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#14141E] border border-[#28283C] rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232334] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-400" />
                Edit Work: {editingItem.title}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#8888A0] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#9E9EB6] mb-1">
                    Status
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value as any })
                    }
                    className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="READING">Reading</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PLAN_TO_READ">Plan to Read</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9E9EB6] mb-1">
                    Score (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={editingItem.score || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        score: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#9E9EB6] mb-1">
                    Current Progress ({editingItem.unit.toLowerCase()})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.progress}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        progress: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9E9EB6] mb-1">
                    Total Progress (leave blank if unknown)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.totalProgress ?? ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        totalProgress: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    placeholder="Unknown"
                    className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9E9EB6] mb-1">
                  Private Notes & Thoughts
                </label>
                <textarea
                  rows={3}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove "${editingItem.title}" from library?`)) {
                      onDeleteItem(editingItem.id);
                      setEditingItem(null);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Work
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-[#20202F] text-xs font-medium text-[#B2B2C9] rounded-xl hover:bg-[#2A2A3E]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateItem(editingItem);
                      setEditingItem(null);
                    }}
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
