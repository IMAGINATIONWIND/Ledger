"use client";

import { useEffect, useState } from "react";
import {
  getRecentSessions,
  getWeeklyVolume,
  getPersonalRecords,
  getCategoryBreakdown,
  getStreak,
  type RecentSession,
  type WeeklyStat,
  type PR,
  type CategoryStat,
  type StreakRow,
} from "@/lib/api";
import VolumeBarChart from "@/components/charts/VolumeBarChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import StatCard from "@/components/ui/StatCard";

export default function DashboardPage() {
  const [weekly, setWeekly]     = useState<WeeklyStat[]>([]);
  const [recent, setRecent]     = useState<RecentSession[]>([]);
  const [prs, setPrs]           = useState<PR[]>([]);
  const [cats, setCats]         = useState<CategoryStat[]>([]);
  const [streak, setStreak]     = useState<StreakRow[]>([]);
  const [loading, setLoading]   = useState(true);

  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getWeeklyVolume(),
      getRecentSessions(),
      getPersonalRecords(),
      getCategoryBreakdown(),
      getStreak(),
    ])
      .then(([w, r, p, c, s]) => {
        setWeekly(w);
        setRecent(r);
        setPrs(p);
        setCats(c);
        setStreak(s);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API connection error:", err);
        setError("Failed to load database stats. Please check database connection.");
        setLoading(false);
      });
  }, []);

  const thisWeek      = weekly[0];
  const currentStreak = streak[0]?.days_in_streak ?? 0;
  const totalPRs      = prs.length;

  if (loading) return <div className="text-zinc-400 animate-pulse">Loading dashboard…</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {error && (
        <div className="bg-amber-950/60 border border-amber-600/50 text-amber-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="This Week Volume"
          value={thisWeek ? `${Math.round(thisWeek.total_volume_kg).toLocaleString()} kg` : "—"}
          sub="sets × reps × weight"
        />
        <StatCard
          label="Days Trained (week)"
          value={thisWeek?.days_trained ?? "—"}
          sub="this calendar week"
        />
        <StatCard
          label="Current Streak"
          value={`${currentStreak} day${currentStreak !== 1 ? "s" : ""}`}
          sub="consecutive training days"
        />
        <StatCard
          label="Personal Records"
          value={totalPRs}
          sub="exercises tracked"
        />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h2 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">
            Weekly Volume (kg)
          </h2>
          <VolumeBarChart data={weekly} />
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h2 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">
            Volume by Category
          </h2>
          <CategoryPieChart data={cats} />
        </div>
      </div>

      {/* Recent sessions table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide">
            Recent Sessions
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Exercises</th>
              <th className="px-4 py-2 text-right">Sets</th>
              <th className="px-4 py-2 text-right">Volume (kg)</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.logged_on} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-2 font-mono text-zinc-300">{r.logged_on}</td>
                <td className="px-4 py-2 text-zinc-400 max-w-xs truncate">{r.exercises_done}</td>
                <td className="px-4 py-2 text-right text-zinc-300">{r.total_sets}</td>
                <td className="px-4 py-2 text-right font-semibold text-white">
                  {Math.round(Number(r.volume_kg)).toLocaleString()}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No sessions yet — go log one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
