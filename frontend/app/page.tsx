"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getRecentSessions,
  getWeeklyVolume,
  getPersonalRecords,
  getCategoryBreakdown,
  getStreak,
  getProgression,
  type RecentSession,
  type WeeklyStat,
  type PR,
  type CategoryStat,
  type StreakRow,
  type ProgressionRow,
} from "@/lib/api";
import { useUser } from "@/context/UserContext";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import BentoConcurrentChart from "@/components/charts/BentoConcurrentChart";
import PlainEnglishInsights from "@/components/ui/PlainEnglishInsights";

export default function DashboardPage() {
  const { userId } = useUser();
  const [weekly, setWeekly] = useState<WeeklyStat[]>([]);
  const [recent, setRecent] = useState<RecentSession[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [cats, setCats] = useState<CategoryStat[]>([]);
  const [streak, setStreak] = useState<StreakRow[]>([]);
  const [progression, setProgression] = useState<ProgressionRow[]>([]);
  const [featuredExercise, setFeaturedExercise] = useState("Bench Press");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getWeeklyVolume(userId),
      getRecentSessions(userId),
      getPersonalRecords(userId),
      getCategoryBreakdown(userId),
      getStreak(userId),
    ])
      .then(([w, r, p, c, s]) => {
        setWeekly(w);
        setRecent(r);
        setPrs(p);
        setCats(c);
        setStreak(s);

        const primaryEx = p.length > 0 ? p[0].exercise : "Bench Press";
        setFeaturedExercise(primaryEx);
        return getProgression(primaryEx, userId);
      })
      .then((prog) => {
        setProgression(prog);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API connection error:", err);
        setError("Failed to load database stats. Please check database connection.");
        setLoading(false);
      });
  }, [userId]);

  const handleExerciseChange = async (exerciseName: string) => {
    setFeaturedExercise(exerciseName);
    try {
      const prog = await getProgression(exerciseName, userId);
      setProgression(prog);
    } catch (e) {
      console.error(e);
    }
  };

  const thisWeek = weekly[0];
  const currentStreak = streak[0]?.days_in_streak ?? 0;
  const totalVolume = cats.reduce((sum, c) => sum + Number(c.total_volume_kg), 0);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-zinc-500 font-mono">Syncing Neon SQL queries for Athlete #{userId}…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <span>IronLedger Bento Analytics</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Live Neon DB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Performance Bento</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
              User #{userId}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/log"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <span>+</span> Log Workout Set
          </Link>
          <Link
            href="/anatomy"
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>🧬</span> Anatomy
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-amber-950/60 border border-amber-600/50 text-amber-200 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Bento Grid: Top 4 Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Volume */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Weekly Volume
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {thisWeek ? `${Math.round(thisWeek.total_volume_kg).toLocaleString()} kg` : "0 kg"}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">
              {thisWeek ? `${thisWeek.days_trained} days trained` : "Rest week"}
            </span>
          </div>
          <div className="absolute top-4 right-4 text-zinc-700 text-lg">⚡</div>
        </div>

        {/* Metric 2: Streak */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Training Streak
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {currentStreak} {currentStreak === 1 ? "Day" : "Days"}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
            <span className="text-orange-400 font-semibold">
              {currentStreak > 0 ? "Active consistency" : "Log next session"}
            </span>
          </div>
          <div className="absolute top-4 right-4 text-zinc-700 text-lg">🔥</div>
        </div>

        {/* Metric 3: Total All-Time Volume */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Cumulative Volume
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {Math.round(totalVolume).toLocaleString()} kg
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
            <span className="text-purple-400 font-semibold">{recent.length} recorded workouts</span>
          </div>
          <div className="absolute top-4 right-4 text-zinc-700 text-lg">⛰️</div>
        </div>

        {/* Metric 4: PR Count */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-5 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Personal Records
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {prs.length}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
            <span className="text-blue-400 font-semibold">Calculated via SQL RANK()</span>
          </div>
          <div className="absolute top-4 right-4 text-zinc-700 text-lg">🏆</div>
        </div>
      </div>

      {/* Main Bento Row: Large Interactive Chart (8 Cols) + Category / Anatomy (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Concurrent Interactive Dynamic Chart (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Dynamic Concurrent Analysis
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Concurrent Dual-Axis: Peak Intensity (kg) vs Total Volume Work
              </p>
            </div>

            {/* Exercise dropdown switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium">Lift:</span>
              <select
                value={featuredExercise}
                onChange={(e) => handleExerciseChange(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {prs.map((p) => (
                  <option key={p.exercise} value={p.exercise}>
                    {p.exercise} ({p.pr_weight_kg} kg)
                  </option>
                ))}
                {prs.length === 0 && <option value="Bench Press">Bench Press</option>}
              </select>
            </div>
          </div>

          <BentoConcurrentChart
            volumeData={weekly}
            progressionData={progression}
            exerciseName={featuredExercise}
          />
        </div>

        {/* Right Bento Column (4 Cols): Muscle Category Distribution */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Muscle Split Share
              </h2>
              <span className="text-xs text-zinc-500 font-mono">SQL View</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Volume distribution by movement category</p>
          </div>

          <div className="py-2">
            <CategoryPieChart data={cats} />
          </div>

          {/* Quick Dissection Callout */}
          <Link
            href="/anatomy"
            className="group rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-blue-500/20 p-3.5 flex items-center justify-between hover:border-blue-500/40 transition-all"
          >
            <div>
              <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                🧬 Dissect Muscle Groups →
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Biomechanics & agonist/synergist mapping
              </div>
            </div>
            <span className="text-lg">🎯</span>
          </Link>
        </div>
      </div>

      {/* Bento Middle Row: Plain English Insights */}
      <PlainEnglishInsights
        weekly={weekly}
        prs={prs}
        categories={cats}
        streak={streak}
        userId={userId}
      />

      {/* Bottom Bento Row: Recent Sessions Table + PR Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Sessions Table (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Recent Training Log
            </h2>
            <Link href="/history" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              View All History →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/60 bg-zinc-950/40 font-mono">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Exercises Done</th>
                  <th className="px-5 py-3 text-right">Sets</th>
                  <th className="px-5 py-3 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {recent.map((r) => (
                  <tr key={r.logged_on} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-zinc-400">{r.logged_on}</td>
                    <td className="px-5 py-3 text-white font-medium max-w-xs truncate">
                      {r.exercises_done}
                    </td>
                    <td className="px-5 py-3 text-right text-zinc-300 font-mono">{r.total_sets}</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-400 font-mono">
                      {Math.round(Number(r.volume_kg)).toLocaleString()} kg
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                      No workouts logged for User #{userId} yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PR Leaderboard (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Personal Records (PRs)
              </h2>
              <span className="text-xs font-mono text-blue-400 font-bold">SQL RANK()</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {prs.slice(0, 5).map((p, idx) => (
                <div
                  key={p.exercise}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-[11px] text-zinc-300">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{p.exercise}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{p.pr_date}</div>
                    </div>
                  </div>
                  <div className="text-sm font-black font-mono text-blue-400">
                    {p.pr_weight_kg} kg
                  </div>
                </div>
              ))}
              {prs.length === 0 && (
                <div className="px-6 py-8 text-center text-zinc-500 text-xs">
                  No personal records recorded yet.
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/30 text-center">
            <Link href="/progress" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Explore Complete Strength Curves & Week-over-Week →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
