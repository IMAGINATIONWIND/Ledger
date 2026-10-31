"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, PRESET_PROFILES } from "@/context/UserContext";

export default function ProfileSwitcher() {
  const { userId, setUserId, openResetModal } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setUserId(customInput.trim());
      setCustomInput("");
      setIsOpen(false);
    }
  };

  const activePreset = PRESET_PROFILES.find((p) => p.id === userId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all text-xs text-zinc-300"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-zinc-500 font-mono">ID:</span>
        <span className="font-bold text-white font-mono">#{userId}</span>
        {activePreset && (
          <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-medium">
            ({activePreset.name})
          </span>
        )}
        <span className="text-zinc-500 text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl shadow-black/80 backdrop-blur-xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-1.5">
              Switch Athlete Profile
            </div>
            <div className="space-y-1">
              {PRESET_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setUserId(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                    userId === p.id
                      ? "bg-blue-600/15 border border-blue-500/30 text-white font-medium"
                      : "hover:bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="font-mono text-blue-400">#{p.id}</span>
                      <span>{p.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{p.desc}</div>
                  </div>
                  {userId === p.id && <span className="text-blue-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-2.5">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-1.5">
              Lookup Any ID Number
            </div>
            <form onSubmit={handleCustomSubmit} className="flex gap-1.5 px-1">
              <input
                type="text"
                placeholder="Enter user ID..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          <div className="border-t border-zinc-800 pt-2 px-1">
            <button
              onClick={() => {
                setIsOpen(false);
                openResetModal();
              }}
              className="w-full text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>🗑️</span>
              <span>Erase History for #{userId}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
