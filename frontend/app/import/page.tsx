"use client";

import { useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

interface PreviewRow {
  logged_on: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
}

interface PreviewResponse {
  total_rows: number;
  preview: PreviewRow[];
}

export default function ImportPage() {
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<PreviewResponse | null>(null);
  const [status, setStatus]       = useState<"idle" | "previewing" | "confirming" | "done" | "error">("idle");
  const [message, setMessage]     = useState("");

  const handlePreview = async () => {
    if (!file) return;
    setStatus("previewing");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/import/preview`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      setPreview(await res.json());
      setStatus("idle");
    } catch (e: any) {
      setMessage(e.message);
      setStatus("error");
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setStatus("confirming");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/import/confirm`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessage(`✓ ${data.inserted} rows imported successfully`);
      setStatus("done");
      setPreview(null);
      setFile(null);
    } catch (e: any) {
      setMessage(e.message);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Import CSV / Excel</h1>

      {/* Instructions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-sm text-zinc-400 space-y-2">
        <p className="font-semibold text-white">Required columns:</p>
        <code className="block bg-zinc-800 rounded p-3 text-zinc-300 text-xs">
          logged_on, exercise, category, sets, reps, weight_kg
        </code>
        <p>Optional: <code>notes</code></p>
        <p>Accepted formats: <code>.csv</code>, <code>.xlsx</code>, <code>.xls</code></p>
      </div>

      {/* File picker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); setStatus("idle"); setMessage(""); }}
          className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
        />
        <button
          onClick={handlePreview}
          disabled={!file || status === "previewing"}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium disabled:opacity-40 transition-colors"
        >
          {status === "previewing" ? "Validating…" : "Preview"}
        </button>
      </div>

      {/* Preview table */}
      {preview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden space-y-0">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {preview.total_rows} rows found — showing first {preview.preview.length}
            </span>
            <button
              onClick={handleConfirm}
              disabled={status === "confirming"}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
            >
              {status === "confirming" ? "Importing…" : "Confirm Import"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  {["Date", "Exercise", "Category", "Sets", "Reps", "Weight (kg)", "Notes"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.preview.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-800/40">
                    <td className="px-3 py-1.5 font-mono text-zinc-400">{r.logged_on}</td>
                    <td className="px-3 py-1.5 text-white">{r.exercise}</td>
                    <td className="px-3 py-1.5 text-zinc-300">{r.category}</td>
                    <td className="px-3 py-1.5 text-right text-zinc-300">{r.sets}</td>
                    <td className="px-3 py-1.5 text-right text-zinc-300">{r.reps}</td>
                    <td className="px-3 py-1.5 text-right text-zinc-300">{r.weight_kg}</td>
                    <td className="px-3 py-1.5 text-zinc-500">{r.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status message */}
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
