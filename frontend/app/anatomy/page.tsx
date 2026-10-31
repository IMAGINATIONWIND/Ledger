"use client";

import { useEffect, useState } from "react";
import { getExercises, getPersonalRecords, type Exercise, type PR } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const MUSCLE_GROUPS = [
  { id: "All", label: "All Anatomy", icon: "🧬" },
  { id: "Chest", label: "Chest (Pectorals)", icon: "🫁", focus: "Pectoralis Major & Minor" },
  { id: "Back", label: "Back (Lats & Traps)", icon: "🦇", focus: "Latissimus Dorsi & Rhomboids" },
  { id: "Legs", label: "Legs (Quads & Glutes)", icon: "🦵", focus: "Quadriceps & Posterior Chain" },
  { id: "Shoulders", label: "Shoulders (Delts)", icon: "🛡️", focus: "Anterior, Lateral & Rear Delts" },
  { id: "Arms", label: "Arms (Biceps & Triceps)", icon: "💪", focus: "Biceps Brachii & Triceps Heads" },
  { id: "Cardio", label: "Cardio & Conditioning", icon: "⚡", focus: "Cardiovascular & Aerobic Capacity" },
];

export default function AnatomyPage() {
  const { userId } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    Promise.all([getExercises(), getPersonalRecords(userId)]).then(([exs, prList]) => {
      setExercises(exs);
      setPrs(prList);
      if (exs.length > 0) setActiveExercise(exs[0]);
    });
  }, [userId]);

  const filtered = exercises.filter((ex) => {
    const matchesGroup = selectedGroup === "All" || ex.muscle_group.toLowerCase() === selectedGroup.toLowerCase();
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.primary_muscle || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex.secondary_muscles || "").toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const getPrForExercise = (name: string) => prs.find((p) => p.exercise === name);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5">
          <span>Biomechanical Dissection</span>
          <span>•</span>
          <span>Athlete #{userId}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Muscle Anatomy & Exercise Dissection
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Examine the exact anatomical muscle groups targeted by each lift — primary agonists, synergist stabilizers,
          and biomechanical movement patterns.
        </p>
      </div>

      {/* Muscle Group Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedGroup === g.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500 scale-[1.02]"
                : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Layout: Grid of Exercises + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exercises Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono text-zinc-500">
              Showing {filtered.length} targeted movement{filtered.length !== 1 ? "s" : ""}
            </span>
            <input
              type="text"
              placeholder="Search muscle or exercise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((ex) => {
              const pr = getPrForExercise(ex.name);
              const isSelected = activeExercise?.name === ex.name;

              return (
                <div
                  key={ex.name}
                  onClick={() => setActiveExercise(ex)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-gradient-to-b from-blue-950/40 to-zinc-900 border-blue-500/80 shadow-xl shadow-blue-500/10 scale-[1.01]"
                      : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                        {ex.muscle_group}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{ex.name}</h3>
                    </div>
                    {ex.is_compound && (
                      <span className="text-[10px] font-bold bg-purple-950/80 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md">
                        Compound
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-[11px] text-cyan-300 font-medium">
                      🎯 {ex.primary_muscle || ex.muscle_group}
                    </div>
                    {ex.secondary_muscles && (
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        ⚡ {ex.secondary_muscles}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">PR:</span>
                    <span className="font-bold text-blue-400">
                      {pr ? `${pr.pr_weight_kg} kg` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Anatomy Dissection Panel (5 Cols) */}
        <div className="lg:col-span-5">
          {activeExercise ? (
            <div className="sticky top-20 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 border border-blue-500/30 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Biomechanical Breakdown
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">{activeExercise.name}</h2>
                </div>
                <span className="text-2xl">
                  {activeExercise.muscle_group === "Chest"
                    ? "🫁"
                    : activeExercise.muscle_group === "Back"
                    ? "🦇"
                    : activeExercise.muscle_group === "Legs"
                    ? "🦵"
                    : activeExercise.muscle_group === "Shoulders"
                    ? "🛡️"
                    : activeExercise.muscle_group === "Arms"
                    ? "💪"
                    : "⚡"}
                </span>
              </div>

              {/* Primary Mover Box */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Primary Agonist (Target Muscle)
                </div>
                <div className="text-sm font-extrabold text-white">
                  {activeExercise.primary_muscle || activeExercise.muscle_group}
                </div>
                <p className="text-xs text-zinc-400 pt-1">
                  Responsible for the primary force production and eccentric stretch through the active range of motion.
                </p>
              </div>

              {/* Secondary Synergists */}
              {activeExercise.secondary_muscles && (
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Secondary Synergists & Stabilizers
                  </div>
                  <div className="text-xs font-semibold text-zinc-200">
                    {activeExercise.secondary_muscles}
                  </div>
                  <p className="text-xs text-zinc-500 pt-1">
                    Recruited to stabilize joints and assist during the concentric lockout phase.
                  </p>
                </div>
              )}

              {/* Deep Anatomical Description */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Anatomical Biomechanics
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                  {activeExercise.anatomy_details ||
                    "This movement recruits multiple motor units across the target muscle fibers for strength and hypertrophy."}
                </p>
              </div>

              {/* Athlete Performance Stat */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500">Athlete #{userId} Peak Load:</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {getPrForExercise(activeExercise.name)
                      ? `${getPrForExercise(activeExercise.name)?.pr_weight_kg} kg`
                      : "No lift logged yet"}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {getPrForExercise(activeExercise.name)?.pr_date || ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-8 text-center text-zinc-500 text-sm">
              Select an exercise to dissect its anatomy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
