import React, { useState } from 'react';
import { X, Clock, Flame, BookOpen, Plus, Check } from 'lucide-react';
import { ReadingItem } from '../../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReadingItem[];
  onLogProgress: (itemId: string, increment: number, durationMinutes: number, note: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  items,
  onLogProgress,
}) => {
  const readingItems = items.filter((i) => i.status === 'READING');
  const availableItems = readingItems.length > 0 ? readingItems : items;

  const [selectedItemId, setSelectedItemId] = useState<string>(
    availableItems[0]?.id || ''
  );
  const [increment, setIncrement] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || increment <= 0) return;
    onLogProgress(selectedItemId, increment, durationMinutes, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#14141E] border border-[#2B2B3E] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#222232] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Quick Activity Log</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8888A0] hover:text-white hover:bg-[#1E1E2C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A2A2BC] mb-1.5">
              Select Work
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.medium} · Currently {item.progress}{' '}
                  {item.totalProgress ? `/ ${item.totalProgress}` : ''}{' '}
                  {item.unit.toLowerCase()})
                </option>
              ))}
            </select>
          </div>

          {selectedItem && (
            <div className="p-3 rounded-xl bg-[#181824] border border-[#242436] flex items-center gap-3">
              <img
                src={selectedItem.coverUrl}
                alt={selectedItem.title}
                className="w-12 h-16 object-cover rounded-lg bg-[#252538] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {selectedItem.title}
                </h4>
                <p className="text-[11px] text-[#8C8CA4]">
                  {selectedItem.medium} · Progress:{' '}
                  <span className="text-violet-300 font-mono-numbers font-semibold">
                    {selectedItem.progress} {selectedItem.unit.toLowerCase()}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#A2A2BC]">
                Amount Read Today ({selectedItem?.unit.toLowerCase() || 'chapters'})
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 5, 10, 25].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setIncrement(amt)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers font-semibold cursor-pointer ${
                      increment === amt
                        ? 'bg-violet-600 text-white'
                        : 'bg-[#222234] text-[#A6A6C0] hover:text-white'
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min="1"
              required
              value={increment}
              onChange={(e) => setIncrement(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers font-semibold text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A2A2BC] mb-1.5">
              Time Spent (Minutes)
            </label>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono-numbers"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A2A2BC] mb-1.5">
              Quick Note / Arc Highlight
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Read the Demon Castle battle"
              className="w-full bg-[#1A1A28] border border-[#2B2B3E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#20202F] text-xs font-medium text-[#B2B2C9] rounded-xl hover:bg-[#2A2A3E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white rounded-xl shadow-md shadow-violet-950/40 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Log & Advance Streak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
