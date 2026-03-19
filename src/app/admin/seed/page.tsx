"use client";

import { useState } from "react";
import { seedWordsDatabase } from "@/app/actions/seed";

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await seedWordsDatabase();
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, message: e.message || "Failed to trigger action" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 p-8">
      <div className="w-full max-w-lg p-10 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">Database Seeder</h1>
          <p className="text-zinc-400 leading-relaxed">
            This tool reads the word list from <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-sm">data/words.txt</code>, cleans up the formatting, drops duplicates, and inserts them into your PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl bg-zinc-100/90 text-zinc-950 font-bold text-lg hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Seeding Database..." : "Start Seed Process"}
        </button>

        {result && (
          <div className={`p-5 rounded-xl border ${result.success ? "border-green-500/30 bg-green-950/20 text-green-400" : "border-red-500/30 bg-red-950/20 text-red-400"}`}>
            <p className="font-medium">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
