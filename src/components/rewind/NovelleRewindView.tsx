import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  BookOpen,
  Layers,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Trophy,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReadingItem, ReadingEvent, NovelleRewindData } from '../../types';
import { buildRewindMetrics } from '../../lib/analytics';

interface NovelleRewindViewProps {
  items: ReadingItem[];
  events: ReadingEvent[];
  timeZone: string;
}

export const NovelleRewindView: React.FC<NovelleRewindViewProps> = ({
  items,
  events,
  timeZone,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [rewindData, setRewindData] = useState<NovelleRewindData | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Recalculate baseline metrics when year changes
  useEffect(() => {
    const base = buildRewindMetrics(items, events, selectedYear, timeZone);
    setRewindData(base);
    setCurrentSlide(0);
  }, [items, events, selectedYear, timeZone]);

  // Request Gemini AI Narration
  const handleRequestAiNarrative = async () => {
    if (!rewindData) return;
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/gemini/rewind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewindData),
      });

      const json = await res.json();
      if (json.success) {
        setRewindData((prev) =>
          prev
            ? {
                ...prev,
                archetype: json.archetype || prev.archetype,
                archetypeTagline: json.archetypeTagline || prev.archetypeTagline,
                narrativeStory: json.narrativeStory || prev.narrativeStory,
                keyMilestones: json.keyMilestones || prev.keyMilestones,
                literaryForecast: json.literaryForecast || prev.literaryForecast,
                isAiGenerated: true,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to generate AI narrative:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Trigger celebratory confetti on last slide
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A782FA', '#F472B6', '#38BDF8', '#FBBF24'],
    });
  };

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      if (next === totalSlides - 1) {
        triggerConfetti();
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const totalSlides = 7;

  if (!rewindData) return null;

  const handleCopySummary = () => {
    const text = `✨ My Novelle ${selectedYear} Rewind ✨\n` +
      `🏆 Archetype: ${rewindData.archetype}\n` +
      `📖 Chapters Read: ${rewindData.totalChapters.toLocaleString()}\n` +
      `📚 Pages Read: ${rewindData.totalPages.toLocaleString()}\n` +
      `⏱️ Time Tracked: ${(rewindData.totalMinutes / 60).toFixed(1)} Hours\n` +
      `🔥 Longest Streak: ${rewindData.longestStreakDays} Days\n` +
      `✅ Works Completed: ${rewindData.itemsCompleted}\n` +
      `🌟 Top Genre: ${rewindData.topGenres[0]?.genre || 'Eclectic'}\n\n` +
      `Tracked with Novelle Reading Intelligence`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Year Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#14141E] border border-[#242436]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-violet-950/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Novelle Rewind
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                Annual Story
              </span>
            </h2>
            <p className="text-xs text-[#8A8AA0]">Your genuine year in reading, narrated</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[2024, 2025, 2026].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                selectedYear === yr
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-[#1C1C2A] text-[#8686A0] hover:text-white'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Story Stage */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#181828] via-[#12121D] to-[#0D0D15] border border-violet-500/30 p-6 md:p-10 shadow-2xl min-h-[480px] flex flex-col justify-between overflow-hidden">
        {/* Glowing Background Radial Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 blur-3xl pointer-events-none rounded-full" />

        {/* Progress Bar Indicator at Top */}
        <div className="relative z-10 flex items-center gap-1.5 mb-6">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? 'bg-gradient-to-r from-violet-400 to-pink-400'
                  : idx < currentSlide
                  ? 'bg-violet-600/60'
                  : 'bg-[#252538]'
              }`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>

        {/* Slide Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-4">
          {/* SLIDE 0: Welcome / Cover */}
          {currentSlide === 0 && (
            <div className="text-center space-y-4 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
              <span className="text-xs uppercase font-bold tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Novelle Rewind {selectedYear}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white font-editorial tracking-tight leading-tight">
                Every chapter turned, page soaked in, and universe explored.
              </h1>
              <p className="text-xs md:text-sm text-[#A8A8C4] leading-relaxed">
                You logged {rewindData.activeDaysCount} active reading days in {selectedYear}. Let's celebrate the stories that shaped your mind.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleNextSlide}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-violet-950/60 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Begin Story</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 1: Reader Archetype */}
          {currentSlide === 1 && (
            <div className="text-center space-y-4 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-violet-600 p-0.5 mx-auto shadow-xl">
                <div className="w-full h-full bg-[#12121E] rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-[#8E8EA8] uppercase">
                Your Reading Archetype
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-pink-200 to-amber-200 font-editorial">
                {rewindData.archetype}
              </h2>
              <p className="text-sm md:text-base text-[#D0D0E8] font-editorial italic max-w-md mx-auto">
                "{rewindData.archetypeTagline}"
              </p>
              <div className="p-4 rounded-2xl bg-[#171725] border border-[#26263A] max-w-sm mx-auto text-xs text-[#9E9EB6] space-y-1">
                <div>Primary Format: <strong className="text-white">{rewindData.topMedium}</strong></div>
                <div>Completed in {selectedYear}: <strong className="text-white">{rewindData.itemsCompleted} works</strong></div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Strict Volume Separation */}
          {currentSlide === 2 && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-mono tracking-widest text-violet-400">
                  The Measured Volume
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-editorial">
                  Distinct units. Uncompromised math.
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#171726] border border-indigo-500/30 text-center space-y-1">
                  <Layers className="w-5 h-5 text-indigo-400 mx-auto" />
                  <div className="text-3xl font-extrabold text-white font-mono-numbers">
                    {rewindData.totalChapters.toLocaleString()}
                  </div>
                  <span className="text-xs font-semibold text-indigo-300">Chapters Read</span>
                  <p className="text-[10px] text-[#787895]">Manga, Webtoons & Web Novels</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#171726] border border-sky-500/30 text-center space-y-1">
                  <BookOpen className="w-5 h-5 text-sky-400 mx-auto" />
                  <div className="text-3xl font-extrabold text-white font-mono-numbers">
                    {rewindData.totalPages.toLocaleString()}
                  </div>
                  <span className="text-xs font-semibold text-sky-300">Pages Read</span>
                  <p className="text-[10px] text-[#787895]">Print Books & Epics</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#171726] border border-emerald-500/30 text-center space-y-1">
                  <Clock className="w-5 h-5 text-emerald-400 mx-auto" />
                  <div className="text-3xl font-extrabold text-white font-mono-numbers">
                    {(rewindData.totalMinutes / 60).toFixed(1)}
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">Hours Immersed</span>
                  <p className="text-[10px] text-[#787895]">{rewindData.totalMinutes} minutes</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Streaks & Peaks */}
          {currentSlide === 3 && (
            <div className="text-center space-y-5 max-w-lg mx-auto animate-in fade-in duration-300">
              <div className="p-3 w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Flame className="w-8 h-8 fill-amber-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-editorial">
                The Relentless Streak
              </h3>
              <div className="text-5xl md:text-6xl font-black text-amber-300 font-mono-numbers">
                {rewindData.longestStreakDays}{' '}
                <span className="text-lg text-amber-200/80 font-normal">Days</span>
              </div>
              <p className="text-xs text-[#A8A8C4]">
                Your longest uninterrupted streak in {selectedYear}. You showed up on{' '}
                <strong className="text-white">{rewindData.activeDaysCount} active days</strong>.
              </p>

              {rewindData.peakDay && (
                <div className="p-3.5 rounded-xl bg-[#171725] border border-amber-500/30 max-w-xs mx-auto text-xs text-[#B2B2C9]">
                  🏆 <strong>Peak Reading Day:</strong> {rewindData.peakDay.amount}{' '}
                  {rewindData.peakDay.unit.toLowerCase()} read on {rewindData.peakDay.date}!
                </div>
              )}
            </div>
          )}

          {/* SLIDE 4: Top Genres & Masterpieces */}
          {currentSlide === 4 && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="text-xs uppercase font-mono tracking-widest text-pink-400">
                  Hall of Fame
                </span>
                <h3 className="text-2xl font-bold text-white font-editorial">
                  Your Highest Rated Treasures
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rewindData.topRated.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#181826] border border-[#26263B] flex gap-3 items-center"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded-lg bg-[#202030] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-[#8686A2]">
                        {item.medium}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-[11px] text-amber-300 font-bold font-mono-numbers">
                        ★ {item.score} / 10
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 5: The Bard's Chronicle (Gemini AI Narration) */}
          {currentSlide === 5 && (
            <div className="space-y-4 max-w-xl mx-auto animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#242436] pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    The Bard's Chronicle (Gemini AI)
                  </span>
                </div>
                <button
                  onClick={handleRequestAiNarrative}
                  disabled={isLoadingAi}
                  className="px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  {rewindData.isAiGenerated ? 'Regenerate Narrative' : 'Enrich with Gemini AI'}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#141420]/80 border border-violet-500/30 space-y-3.5 backdrop-blur-md">
                <p className="text-xs md:text-sm text-[#E2E2F2] leading-relaxed font-editorial italic">
                  "{rewindData.narrativeStory}"
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#232336]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                    Notable Milestones:
                  </p>
                  {rewindData.keyMilestones.map((m, i) => (
                    <div key={i} className="text-xs text-[#B2B2CC] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-[#9E9EB8] italic">
                  🔮 <strong>Literary Forecast:</strong> {rewindData.literaryForecast}
                </div>
              </div>

              <p className="text-[10px] text-[#63637E] text-center">
                Strict Integrity Rule: Gemini is restricted to narrating your pre-computed stats without hallucinating unlogged metrics.
              </p>
            </div>
          )}

          {/* SLIDE 6: Shareable Summary Card */}
          {currentSlide === 6 && (
            <div className="space-y-4 max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-900/60 via-[#181829] to-[#0D0D15] border-2 border-violet-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-left">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-pink-300">
                      NOVELLE REWIND {selectedYear}
                    </span>
                    <h3 className="text-base font-bold text-white font-editorial">
                      {rewindData.archetype}
                    </h3>
                  </div>
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-left text-xs font-mono-numbers">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#8686A0] uppercase block">Chapters</span>
                    <span className="text-base font-bold text-white">
                      {rewindData.totalChapters.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#8686A0] uppercase block">Pages</span>
                    <span className="text-base font-bold text-white">
                      {rewindData.totalPages.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#8686A0] uppercase block">Max Streak</span>
                    <span className="text-base font-bold text-amber-300">
                      {rewindData.longestStreakDays} Days
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] text-[#8686A0] uppercase block">Finished</span>
                    <span className="text-base font-bold text-emerald-300">
                      {rewindData.itemsCompleted} Works
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#C2C2DB] font-editorial italic pt-1">
                  "{rewindData.archetypeTagline}"
                </p>
              </div>

              <div className="flex justify-center gap-2.5 pt-2">
                <button
                  onClick={handleCopySummary}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  {copiedShare ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedShare ? 'Copied to Clipboard!' : 'Share Your Rewind'}
                </button>
                <button
                  onClick={triggerConfetti}
                  className="px-4 py-2.5 bg-[#202030] hover:bg-[#28283E] text-white text-xs font-semibold rounded-xl border border-[#303046] cursor-pointer"
                >
                  🎉 Confetti
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Carousel Navigation Controls */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#232336]">
          <button
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E1E2C] hover:bg-[#28283C] text-xs font-semibold text-[#A8A8C0] hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-[#8686A2]">
            Slide {currentSlide + 1} of {totalSlides}
          </span>

          <button
            onClick={handleNextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-md shadow-violet-950/40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
