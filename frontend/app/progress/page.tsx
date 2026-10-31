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
import ProgressionLineChart from "@/components/charts/ProgressionLineChart";

export default function ProgressPage() {
  const [exercises, setExercises]     = useState<Exercise[]>([]);
  const [selected, setSelected]       = useState("");
  const [progression, setProgression] = useState<ProgressionRow[]>([]);
  const [prs, setPrs]                 = useState<PR[]>([]);
  const [wow, setWow]                 = useState<WoWStat[]>([]);

  useEffect(() => {
    getExercises().then((exs) => {
      setExercises(exs);
      if (exs.length > 0) setSelected(exs[0].name);
    });
    getPersonalRecords().then(setPrs);
    getWeekOverWeek().then(setWow);
  }, []);

  useEffect(() => {
    if (selected) getProgression(selected).then(setProgression);
  }, [selected]);

  const selectedPR = prs.find((p) => p.exercise === selected);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Progression chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide flex-1">
            Strength Progression
          </h2>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {exercises.map((ex) => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
          </select>
          {selectedPR && (
            <span className="text-xs bg-blue-900/40 border border-blue-700 text-blue-300 px-3 py-1 rounded-full">
              PR: {selectedPR.pr_weight_kg} kg on {selectedPR.pr_date}
            </span>
          )}
        </div>
        {progression.length > 0
          ? <ProgressionLineChart data={progression} exercise={selected} />
          : <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">No data for this exercise yet</div>
        }
      </div>

      {/* Week over week */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide">
            Week-over-Week Volume (SQL: LAG window function)
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
              <th className="px-4 py-2 text-left">Week</th>
              <th className="px-4 py-2 text-right">Volume (kg)</th>
              <th className="px-4 py-2 text-right">vs Last Week</th>
              <th className="px-4 py-2 text-right">Change %</th>
            </tr>
          </thead>
          <tbody>
            {wow.map((w) => {
              const up = (w.volume_change ?? 0) >= 0;
              return (
                <tr key={w.week_start} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-2 font-mono text-zinc-400">{w.week_start}</td>
                  <td className="px-4 py-2 text-right font-semibold text-white">
                    {Math.round(w.volume_kg).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {w.volume_change != null
                      ? <span className={up ? "text-green-400" : "text-red-400"}>
                          {up ? "▲" : "▼"} {Math.abs(Math.round(w.volume_change)).toLocaleString()}
                        </span>
                      : <span className="text-zinc-600">—</span>
                    }
                  </td>
                  <td className="px-4 py-2 text-right">
                    {w.pct_change != null
                      ? <span className={up ? "text-green-400" : "text-red-400"}>
                          {w.pct_change > 0 ? "+" : ""}{w.pct_change}%
                        </span>
                      : <span className="text-zinc-600">—</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Personal records */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="font-semibold text-sm text-zinc-400 uppercase tracking-wide">
            Personal Records (SQL: RANK window function)
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
              <th className="px-4 py-2 text-left">Exercise</th>
              <th className="px-4 py-2 text-right">PR Weight</th>
              <th className="px-4 py-2 text-right">Date Set</th>
            </tr>
          </thead>
          <tbody>
            {prs.map((p) => (
              <tr key={p.exercise} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-2 font-medium text-white">{p.exercise}</td>
                <td className="px-4 py-2 text-right text-blue-400 font-bold">{p.pr_weight_kg} kg</td>
                <td className="px-4 py-2 text-right font-mono text-zinc-400">{p.pr_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
