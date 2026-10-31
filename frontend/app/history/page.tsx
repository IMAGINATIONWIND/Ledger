"use client";

import { useEffect, useState } from "react";
import { getWorkouts, deleteWorkout, getExercises, type WorkoutRow, type Exercise } from "@/lib/api";

export default function HistoryPage() {
  const [rows, setRows]         = useState<WorkoutRow[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterEx, setFilterEx]  = useState("");
  const [loading, setLoading]    = useState(true);

  const load = async () => {
    const params: Record<string, string> = {};
    if (filterEx) params.exercise = filterEx;
    const data = await getWorkouts(params);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  useEffect(() => { load(); }, [filterEx]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this entry?")) return;
    await deleteWorkout(id);
    setRows((r) => r.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <select
          value={filterEx}
          onChange={(e) => setFilterEx(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All exercises</option>
          {exercises.map((ex) => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-400 animate-pulse">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Exercise</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Sets</th>
                <th className="px-4 py-3 text-right">Reps</th>
                <th className="px-4 py-3 text-right">Weight (kg)</th>
                <th className="px-4 py-3 text-right">Volume</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-2 font-mono text-zinc-400">{w.logged_on}</td>
                  <td className="px-4 py-2 font-medium text-white">{w.exercise}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-300">{w.category}</span>
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-300">{w.sets}</td>
                  <td className="px-4 py-2 text-right text-zinc-300">{w.reps}</td>
                  <td className="px-4 py-2 text-right text-zinc-300">{w.weight_kg}</td>
                  <td className="px-4 py-2 text-right font-semibold text-blue-400">
                    {Math.round(w.sets * w.reps * w.weight_kg).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
