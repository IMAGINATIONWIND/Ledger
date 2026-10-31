"use client";

import { useMemo } from "react";
import type { WeeklyStat, PR, CategoryStat, StreakRow } from "@/lib/api";

interface Props {
  weekly: WeeklyStat[];
  prs: PR[];
  categories: CategoryStat[];
  streak: StreakRow[];
  userId: string;
}

export default function PlainEnglishInsights({
  weekly,
  prs,
  categories,
  streak,
  userId,
}: Props) {
  const insights = useMemo(() => {
    const list: { title: string; text: string; icon: string; badge: string; color: string }[] = [];

    // 1. Weekly Volume Trend in Simple Words
    if (weekly.length >= 2) {
      const cur = Number(weekly[0]?.total_volume_kg || 0);
      const prev = Number(weekly[1]?.total_volume_kg || 0);
      if (prev > 0) {
        const diff = cur - prev;
        const pct = Math.round((diff / prev) * 100);
        if (pct > 0) {
          list.push({
            title: "Volume Overload",
            text: `You lifted ${Math.abs(Math.round(diff)).toLocaleString()} kg more than last week (+${pct}%). Your progressive overload is moving in the right direction.`,
            icon: "🚀",
            badge: `+${pct}% Surge`,
            color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
          });
        } else if (pct < 0) {
          list.push({
            title: "Recovery Period",
            text: `Volume dropped by ${Math.abs(pct)}% this week compared to last. This allows connective tissue and CNS recovery if you were on a heavy cycle.`,
            icon: "🧘",
            badge: "Deloading",
            color: "border-amber-500/30 bg-amber-950/20 text-amber-400",
          });
        }
      }
    }

    // 2. Strongest Personal Record in Plain English
    if (prs.length > 0) {
      const topPr = [...prs].sort((a, b) => Number(b.pr_weight_kg) - Number(a.pr_weight_kg))[0];
      list.push({
        title: "Heaviest Movement",
        text: `Your peak lift on record is ${topPr.exercise} at ${topPr.pr_weight_kg} kg, recorded on ${topPr.pr_date}.`,
        icon: "🏆",
        badge: "Crown Lift",
        color: "border-blue-500/30 bg-blue-950/20 text-blue-400",
      });
    }

    // 3. Consistency Streak
    const currentStreak = streak[0]?.days_in_streak || 0;
    if (currentStreak > 0) {
      list.push({
        title: "Consistency Streak",
        text: `You have trained ${currentStreak} consecutive session${currentStreak > 1 ? "s" : ""} without breaking the routine. Habits drive 90% of strength progression.`,
        icon: "🔥",
        badge: `${currentStreak}d Streak`,
        color: "border-orange-500/30 bg-orange-950/20 text-orange-400",
      });
    }

    // 4. Muscle Balance in Plain Words
    if (categories.length > 0) {
      const totalVol = categories.reduce((sum, c) => sum + Number(c.total_volume_kg), 0);
      const topCat = categories[0];
      const topPct = totalVol > 0 ? Math.round((Number(topCat.total_volume_kg) / totalVol) * 100) : 0;
      list.push({
        title: "Training Focus",
        text: `Your primary training focus is ${topCat.category} (${topPct}% of all work). Keep antagonist muscle groups stimulated to prevent postural imbalances.`,
        icon: "⚖️",
        badge: `${topCat.category} Dominant`,
        color: "border-purple-500/30 bg-purple-950/20 text-purple-400",
      });
    }

    return list;
  }, [weekly, prs, categories, streak]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-3xl p-6 border border-zinc-800/80 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Coach Insights in Simple English
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-500">Athlete #{userId}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 border transition-all hover:scale-[1.02] flex flex-col justify-between space-y-3 ${item.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-950/60 border border-current">
                {item.badge}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[11px] text-zinc-300/90 leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
