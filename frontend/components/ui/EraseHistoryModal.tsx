"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function EraseHistoryModal() {
  const { userId, isResetOpen, closeResetModal, eraseActiveUserHistory } = useUser();
  const [inputVal, setInputVal] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!isResetOpen) return null;

  const isConfirmed = inputVal.trim() === userId;

  const handleErase = async () => {
    if (!isConfirmed) return;
    setStatus("loading");
    try {
      const res = await eraseActiveUserHistory(inputVal.trim());
      setStatus("done");
      setMsg(res.message);
      setTimeout(() => {
        closeResetModal();
        window.location.reload();
      }, 1800);
    } catch (err: any) {
      setStatus("error");
      setMsg(err.message || "Failed to erase data");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-red-500/30 shadow-2xl shadow-red-950/40 rounded-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">
            ⚠️
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Erase Workout History</h3>
            <p className="text-xs text-zinc-400">Irreversible action for User #{userId}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          This will permanently delete all logged workouts, volume history, and personal record calculations for{" "}
          <span className="font-semibold text-white">Athlete #{userId}</span>. Other athletes will not be affected.
        </p>

        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 space-y-2">
          <label className="block text-xs font-medium text-zinc-400">
            Type your ID <span className="font-mono text-red-400 font-bold">{userId}</span> to proceed:
          </label>
          <input
            type="text"
            placeholder={userId}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-red-500 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {msg && (
          <p className={`text-xs ${status === "error" ? "text-red-400" : "text-green-400"}`}>
            {msg}
          </p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={closeResetModal}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmed || status === "loading"}
            onClick={handleErase}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-red-600/20 transition-all"
          >
            {status === "loading" ? "Erasing…" : "Permanently Erase"}
          </button>
        </div>
      </div>
    </div>
  );
}
