"use client";

import { useEffect, useState } from "react";
import {
  getExercises,
  getProgression,
  getPersonalRecords,
  getWeekOverWeek,
  type Exercise,
  type ProgressionRow,
  type PR,
  type WoWStat,
} from "@/lib/api";
import { useUser } from "@/context/UserContext";
import ProgressionLineChart from "@/components/charts/ProgressionLineChart";

export default function ProgressPage() {
  const { userId } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState("");
  const [progression, setProgression] = useState<ProgressionRow[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [wow, setWow] = useState<WoWStat[]>([]);

  useEffect(() => {
    getExercises().then((exs) => {
      setExercises(exs);
      if (exs.length > 0 && !selected) setSelected(exs[0].name);
    });
  }, []);

  useEffect(() => {
    getPersonalRecords(userId).then(setPrs);
    getWeekOverWeek(userId).then(setWow);
    if (selected) {
      getProgression(selected, userId).then(setProgression);
    }
  }, [selected, userId]);

  const selectedPR = prs.find((p) => p.exercise === selected);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
            Analytics & Progression
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Strength Progression</h1>
        </div>
        <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
          Athlete #{userId}
        </span>
      </div>

      {/* Progression chart card */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Exercise Strength Curve
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily peak weight vs. 7-day SQL rolling average
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {exercises.map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name} ({ex.muscle_group})
                </option>
              ))}
            </select>
            {selectedPR && (
              <span className="text-xs bg-blue-950/60 border border-blue-500/40 text-blue-300 px-3.5 py-1.5 rounded-xl font-mono font-bold">
                PR: {selectedPR.pr_weight_kg} kg ({selectedPR.pr_date})
              </span>
            )}
          </div>
        </div>

        {progression.length > 0 ? (
          <ProgressionLineChart data={progression} exercise={selected} />
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
            <span>No data logged for {selected} under User #{userId}.</span>
            <span className="text-zinc-600">Switch profile or log a set to see progression lines!</span>
          </div>
        )}
      </div>

      {/* Bento Two-Column: Week-over-Week (SQL LAG) + Personal Records (SQL RANK) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Week over week */}
        <div className="lg:col-span-7 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Week-over-Week Volume
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculated dynamically via PostgreSQL LAG() window function
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">LAG() Window</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/60 bg-zinc-950/40 font-mono">
                  <th className="px-5 py-3 text-left">Week Start</th>
                  <th className="px-5 py-3 text-right">Volume</th>
                  <th className="px-5 py-3 text-right">Change (kg)</th>
                  <th className="px-5 py-3 text-right">Delta %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {wow.map((w) => {
                  const up = (w.volume_change ?? 0) >= 0;
                  return (
                    <tr key={w.week_start} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-zinc-400">{w.week_start}</td>
                      <td className="px-5 py-3 text-right font-bold text-white font-mono">
                        {Math.round(w.volume_kg).toLocaleString()} kg
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {w.volume_change != null ? (
                          <span className={up ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                            {up ? "▲ +" : "▼ "}
                            {Math.abs(Math.round(w.volume_change)).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {w.pct_change != null ? (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              up
                                ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-950/50 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {w.pct_change > 0 ? "+" : ""}
                            {w.pct_change}%
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {wow.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-500">
                      No weekly volume history found for #{userId}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Personal records table */}
        <div className="lg:col-span-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  All-Time PR Board
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  SQL PARTITION BY user_id, exercise ORDER BY weight DESC
                </p>
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold">RANK()</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {prs.map((p, idx) => (
                <div
                  key={p.exercise}
                  className="px-6 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-[11px] text-zinc-400">
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
                  No personal records logged for #{userId}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
