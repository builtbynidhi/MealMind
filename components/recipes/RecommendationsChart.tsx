"use client";

import { useMemo } from"react";
import Link from"next/link";
import { motion } from"framer-motion";
import type { AlmostThereCard, RecipeCardData } from"@/lib/recipes/types";

const CUISINE_EMOJI: Record<string, string> = {
 Indian:"🍛", Italian:"🍝", Chinese:"🥡", Thai:"🍜",
 Mexican:"🌮", Mediterranean:"🥗", Continental:"🥪", American:"🍔",
};

// Derives a per-cuisine"what can I cook"chart straight from the match results
// — no extra request. Bars show make-now (solid) vs almost-there (light).
export function RecommendationsChart({
 full,
 almost,
}: {
 full: RecipeCardData[];
 almost: AlmostThereCard[];
}) {
 const rows = useMemo(() => {
 const m = new Map<string, { now: number; almost: number }>();
 for (const r of full) {
 const c = r.cuisine ??"Other";
 const e = m.get(c) ?? { now: 0, almost: 0 };
 e.now++;
 m.set(c, e);
 }
 for (const r of almost) {
 const c = r.cuisine ??"Other";
 const e = m.get(c) ?? { now: 0, almost: 0 };
 e.almost++;
 m.set(c, e);
 }
 const arr = [...m.entries()].map(([cuisine, v]) => ({ cuisine, ...v, total: v.now + v.almost }));
 arr.sort((a, b) => b.now - a.now || b.total - a.total);
 return arr;
 }, [full, almost]);

 if (rows.length === 0) return null;
 const max = Math.max(...rows.map((r) => r.total), 1);

 return (
 <div className="card shadow-soft">
 <h2 className="text-xl font-bold text-ink-900">Your recipe chart</h2>
 <p className="mb-4 text-sm text-ink-700/70">How many recipes you can cook, by cuisine.</p>
 <div className="space-y-3">
 {rows.map((r, i) => (
 <div key={r.cuisine} className="flex items-center gap-3">
 <Link
 href={`/recipes/browse?cuisine=${encodeURIComponent(r.cuisine)}`}
 className="flex w-28 shrink-0 items-center gap-1.5 text-sm font-medium text-ink-800 hover:text-brand-700 hover:underline"
 >
 <span>{CUISINE_EMOJI[r.cuisine] ??"🍽️"}</span>
 {r.cuisine}
 </Link>
 <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-cream-100">
 <motion.div
 className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient"
 initial={{ width: 0 }}
 animate={{ width:`${(r.now / max) * 100}%`}}
 transition={{ duration: 0.6, delay: i * 0.05, ease:"easeOut"}}
 />
 <motion.div
 className="absolute inset-y-0 rounded-full bg-accent-200/70"
 initial={{ width: 0, left: 0 }}
 animate={{ width:`${(r.almost / max) * 100}%`, left:`${(r.now / max) * 100}%`}}
 transition={{ duration: 0.6, delay: i * 0.05 + 0.1, ease:"easeOut"}}
 />
 </div>
 <div className="w-24 shrink-0 text-right text-xs text-ink-700/70">
 <span className="font-semibold text-brand-700">{r.now} now</span>
 {r.almost > 0 && <span> · +{r.almost}</span>}
 </div>
 </div>
 ))}
 </div>
 <div className="mt-4 flex items-center gap-4 text-xs text-ink-700/60">
 <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full bg-brand-gradient"/> ready now</span>
 <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full bg-accent-200"/> almost there</span>
 </div>
 </div>
 );
}
