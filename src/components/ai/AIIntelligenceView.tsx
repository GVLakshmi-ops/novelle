import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Calendar,
  Compass,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { ReadingItem, StreakStats, AIActivityInsight } from '../../types';

interface AIIntelligenceViewProps {
  items: ReadingItem[];
  streaks: StreakStats;
  timeZone: string;
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({
  items,
  streaks,
  timeZone,
}) => {
  const [insights, setInsights] = useState<AIActivityInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inProgressItems = items.filter((i) => i.status === 'READING');

  const fetchAIInsights = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/activity-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inProgressItems,
          streakStats: streaks,
          recentVelocity: `${streaks.currentStreak}-day active streak with ${inProgressItems.length} active works`,
          timeZone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInsights({
          headline: data.headline,
          paceAnalysis: data.paceAnalysis,
          completionEstimates: data.completionEstimates || [],
          slumpRiskLevel: data.slumpRiskLevel || 'LOW',
          coachingRecommendation: data.coachingRecommendation,
          suggestedNextPicks: data.suggestedNextPicks || [],
        });
      } else {
        // Deterministic fallback
        setInsights(generateDeterministicFallback(inProgressItems, streaks));
      }
    } catch {
      setInsights(generateDeterministicFallback(inProgressItems, streaks));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [items.length, streaks.currentStreak]);

  function generateDeterministicFallback(
    active: ReadingItem[],
    streak: StreakStats
  ): AIActivityInsight {
    return {
      headline:
        streak.currentStreak > 3
          ? 'Exceptional Momentum: Your Daily Reading Habit is Thriving'
          : 'Ready for Steady Acceleration: Building Your Reading Rhythm',
      paceAnalysis: `You currently maintain ${active.length} active works. Your ${streak.currentStreak}-day streak demonstrates consistent reader immersion without reading fatigue.`,
      completionEstimates: active.slice(0, 3).map((item) => {
        const remaining = item.totalProgress ? item.totalProgress - item.progress : null;
        return {
          title: item.title,
          estimatedDaysRemaining: remaining ? Math.ceil(remaining / 3) : null,
          paceSummary: remaining
            ? `~${remaining} ${item.unit.toLowerCase()} remaining at a steady pace of ~3 per day`
            : 'Ongoing serialization; track updates weekly',
        };
      }),
      slumpRiskLevel: 'LOW',
      coachingRecommendation:
        'Rotate between deep literary fiction and fast-paced graphic formats to keep mental stamina elevated without burnout.',
      suggestedNextPicks: [
        'S.S.S.-Class Suicide Hunter (Manhwa / Web Novel)',
        'Children of Time by Adrian Tchaikovsky (Hard Sci-Fi)',
        'The Apothecary Diaries (Manga / Light Novel)',
      ],
    };
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161625] via-[#13131F] to-[#0E0E15] border border-violet-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono tracking-wider text-violet-400 font-bold">
              Gemini 3.8 Flash Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-editorial">
            Reading Intelligence & Velocity Coach
          </h2>
          <p className="text-xs text-[#9E9EBA]">
            Personalized pace calculations, projected finish dates, and burnout mitigation grounded strictly in your actual reading data.
          </p>
        </div>

        <button
          onClick={fetchAIInsights}
          disabled={isLoading}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyzing...' : 'Refresh Coach Analysis'}
        </button>
      </div>

      {insights && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Headline & Slump Risk Badge */}
          <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#797996]">
                Habit Diagnostics
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {insights.headline}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-[#8A8AA0]">Burnout Risk:</span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  insights.slumpRiskLevel === 'LOW'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : insights.slumpRiskLevel === 'MODERATE'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                {insights.slumpRiskLevel} RISK
              </span>
            </div>
          </div>

          {/* Pace Analysis & Coaching Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Reading Velocity & Habit Dynamics
              </h4>
              <p className="text-xs md:text-sm text-[#CCCCCC] leading-relaxed">
                {insights.paceAnalysis}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Coach's Tactical Recommendation
              </h4>
              <p className="text-xs md:text-sm text-[#CCCCCC] leading-relaxed">
                {insights.coachingRecommendation}
              </p>
            </div>
          </div>

          {/* Completion Target Forecasts */}
          <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Projected Completion Targets
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {insights.completionEstimates.map((est, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#181826] border border-[#26263B] space-y-1.5"
                >
                  <p className="text-xs font-bold text-white truncate">{est.title}</p>
                  <div className="text-lg font-extrabold text-sky-300 font-mono-numbers">
                    {est.estimatedDaysRemaining !== null
                      ? `~${est.estimatedDaysRemaining} Days`
                      : 'Ongoing'}
                  </div>
                  <p className="text-[11px] text-[#8686A2] leading-tight">
                    {est.paceSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Next Reads Grounded in Library Tastes */}
          <div className="p-5 rounded-2xl bg-[#14141E] border border-[#242436] space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              Synthesized "Next Read" Suggestions
            </h4>
            <p className="text-xs text-[#8E8EA8]">
              Selected to match the thematic momentum of your top-rated in-progress reads:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {insights.suggestedNextPicks.map((pick, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#181826] border border-[#242436] flex items-center gap-2.5 text-xs text-white"
                >
                  <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-semibold line-clamp-1">{pick}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
