"use client";

import { useEffect, useState } from "react";
import { getExercises, createWorkout, type Exercise } from "@/lib/api";

const CATEGORIES = ["Push", "Pull", "Legs", "Cardio", "Full Body", "Core"];

export default function LogPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [form, setForm] = useState({
    logged_on: "",
    exercise: "",
    category: "",
    sets: 3,
    reps: 8,
    weight_kg: 0,
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((f) => ({ ...f, logged_on: new Date().toISOString().split("T")[0] }));
    getExercises().then(setExercises);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "sets" || name === "reps" || name === "weight_kg" ? Number(value) : value }));

    // Auto-fill category from exercise master
    if (name === "exercise") {
      const ex = exercises.find((x) => x.name === value);
      if (ex) {
        setForm((f) => ({ ...f, exercise: value, category: ex.is_compound ? "Push" : f.category }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.exercise || !form.category) return;
    setStatus("saving");
    try {
      await createWorkout(form);
      setStatus("saved");
      setForm((f) => ({ ...f, notes: "" })); // reset notes only
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Log Workout</h1>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Date</label>
          <input type="date" name="logged_on" value={form.logged_on} onChange={handleChange} className={inputCls} required />
        </div>

        {/* Exercise */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Exercise</label>
          <select name="exercise" value={form.exercise} onChange={handleChange} className={inputCls} required>
            <option value="">— Select exercise —</option>
            {exercises.map((ex) => (
              <option key={ex.name} value={ex.name}>{ex.name} ({ex.muscle_group})</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls} required>
            <option value="">— Select category —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Sets / Reps / Weight */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Sets</label>
            <input type="number" name="sets" min={1} value={form.sets} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Reps</label>
            <input type="number" name="reps" min={1} value={form.reps} onChange={handleChange} className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Weight (kg)</label>
            <input type="number" name="weight_kg" min={0} step={0.5} value={form.weight_kg} onChange={handleChange} className={inputCls} required />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Notes (optional)</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="e.g. felt strong, paused reps" className={inputCls} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Logged!" : "Log Set"}
        </button>

        {status === "error" && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </form>
    </div>
  );
}
