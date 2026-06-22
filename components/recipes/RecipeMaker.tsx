"use client";

import { useState } from"react";
import Link from"next/link";
import { motion } from"framer-motion";
import { ChipInput } from"./ChipInput";
import { RecipeCard, RecipeCardSkeleton } from"./RecipeCard";
import { RecommendationsChart } from"./RecommendationsChart";
import { COMMON_INGREDIENTS } from"@/lib/recipes/ingredients";
import { fetchCookFrom } from"@/lib/recipes/api";
import { unlockSuggestions } from"@/lib/recipes/unlock";
import { useToast } from"@/components/ui/Toast";
import { CountUp } from"@/components/ui/CountUp";
import type { CookFromResponse, Diet } from"@/lib/recipes/types";
import { CANONICAL_CUISINES } from"@/indexer/data/types";

const DIETS: { key: Diet; label: string }[] = [
 { key:"any", label:"Any"},
 { key:"veg", label:"Veg"},
 { key:"non-veg", label:"Non-veg"},
];

const EXAMPLES: { emoji: string; label: string; items: string[] }[] = [
 { emoji:"🍳", label:"onion · tomato · eggs", items: ["onion","tomato","eggs","green chili"] },
 { emoji:"🥘", label:"rice · onion · garlic · chicken", items: ["rice","onion","garlic","chicken","ginger"] },
 { emoji:"🧀", label:"paneer · onion · tomato", items: ["paneer","onion","tomato","bell pepper"] },
 { emoji:"🍝", label:"pasta · tomato · garlic", items: ["pasta","tomato","garlic","olive oil"] },
];

export function RecipeMaker() {
 const [have, setHave] = useState<string[]>([]);
 const [diet, setDiet] = useState<Diet>("any");
 const [cuisine, setCuisine] = useState<string>("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [result, setResult] = useState<CookFromResponse | null>(null);
 const toast = useToast();

 async function run(overrideHave?: string[]) {
 const list = overrideHave ?? have;
 if (!list.length) return;
 setLoading(true);
 setError(null);
 try {
 const res = await fetchCookFrom({ have: list, diet, cuisine: cuisine || undefined });
 setResult(res);
 } catch (e: any) {
 setError(e?.message ??"Something went wrong");
 } finally {
 setLoading(false);
 }
 }

 // Add suggested ingredient(s) as chips and immediately re-run the search.
 function addAndRun(...items: string[]) {
 const next = [...have];
 const added: string[] = [];
 for (const it of items) if (!next.includes(it)) { next.push(it); added.push(it); }
 setHave(next);
 if (added.length) toast.show(`Added ${added.join(",")}`,"➕");
 run(next);
 }

 // Replace the whole list with an example set and run (first-run shortcuts).
 function runExample(items: string[]) {
 setHave(items);
 run(items);
 }

 return (
 <div className="space-y-6">
 <div className="card space-y-4">
 <div>
 <label className="mb-2 block text-sm font-semibold text-ink-800">What's in your kitchen?</label>
 <ChipInput value={have} onChange={setHave} suggestions={COMMON_INGREDIENTS} />
 </div>

 <div className="flex flex-wrap items-end gap-4">
 <div>
 <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700/70">Diet</span>
 <div className="inline-flex rounded-xl bg-cream-100 p-1">
 {DIETS.map((d) => (
 <button
 key={d.key}
 onClick={() => setDiet(d.key)}
 className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
 diet === d.key ?"bg-white text-brand-700 shadow-sm":"text-ink-700/70 hover:text-ink-900"
 }`}
 aria-pressed={diet === d.key}
 >
 {d.label}
 </button>
 ))}
 </div>
 </div>

 <div>
 <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-700/70">Cuisine</span>
 <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="input w-auto">
 <option value="">Any cuisine</option>
 {CANONICAL_CUISINES.map((c) => (
 <option key={c} value={c}>{c}</option>
 ))}
 </select>
 </div>

 <button onClick={() => run()} disabled={!have.length || loading} className="btn-primary w-full sm:ml-auto sm:w-auto">
 {loading ?"Finding…":`Find recipes${have.length ?`(${have.length})`:""}`}
 </button>
 </div>
 </div>

 {!result && !loading && (
 <div className="card">
 <p className="text-sm font-semibold text-ink-800">New here? Try one of these 👇</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {EXAMPLES.map((ex) => (
 <button
 key={ex.label}
 onClick={() => runExample(ex.items)}
 className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1.5 text-sm font-medium text-ink-800 ring-1 ring-inset ring-ink-900/10 transition hover:bg-brand-50 hover:text-brand-700"
 >
 <span>{ex.emoji}</span> {ex.label}
 </button>
 ))}
 </div>
 <p className="mt-3 text-sm text-ink-700/70">
 …or{""}
 <Link href="/recipes/browse"className="font-medium text-brand-700 hover:underline">
 browse all recipes →
 </Link>
 </p>
 </div>
 )}

 {error && (
 <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-700">{error}</div>
 )}

 {loading && (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
 </div>
 )}

 {result && !loading && (
 <>
 <UnlockBanner result={result} onAdd={addAndRun} />
 <Results result={result} />
 </>
 )}
 </div>
 );
}

function UnlockBanner({
 result,
 onAdd,
}: {
 result: CookFromResponse;
 onAdd: (...items: string[]) => void;
}) {
 const suggestions = unlockSuggestions(result.almost, 3).filter((s) => s.unlocks > 0 || s.appearsIn > 1);
 if (suggestions.length === 0) return null;
 return (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-xl2 border border-accent-200 bg-accent-50/70 p-4"
 >
 <p className="text-sm font-semibold text-accent-700">🔓 Unlock more recipes</p>
 <p className="mt-0.5 text-sm text-ink-700/80">Tap an ingredient to add it and see what opens up:</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {suggestions.map((s) => (
 <button
 key={s.ingredient}
 onClick={() => onAdd(s.ingredient)}
 className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-accent-700 shadow-sm ring-1 ring-inset ring-accent-600/20 transition hover:bg-accent-100"
 >
 + {s.ingredient}
 <span className="text-xs text-ink-700/60">
 {s.unlocks > 0 ?`unlocks ${s.unlocks}`:`in ${s.appearsIn}`}
 </span>
 </button>
 ))}
 {suggestions.length >= 2 && (
 <button
 onClick={() => onAdd(...suggestions.map((s) => s.ingredient))}
 className="inline-flex items-center rounded-full bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-700"
 >
 + Add all
 </button>
 )}
 </div>
 </motion.div>
 );
}

function Results({ result }: { result: CookFromResponse }) {
 if (!result.full.length && !result.almost.length) {
 return (
 <div className="card text-center text-ink-700/80">
 <p className="text-lg font-semibold">No matches yet 🤔</p>
 <p className="mt-1 text-sm">Try adding a few more common ingredients, or switch the cuisine to “Any”.</p>
 </div>
 );
 }
 return (
 <div className="space-y-8">
 <RecommendationsChart full={result.full} almost={result.almost} />
 {result.full.length > 0 && (
 <Section
 title={
 <span className="inline-flex items-center gap-2">
 You can make now
 <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-base text-brand-700">
 <CountUp value={result.full.length} />
 </span>
 </span>
 }
 sub="Recipes you can cook with exactly what you have"
 >
 {result.full.map((r) => <RecipeCard key={r.recipe_id} recipe={r} />)}
 </Section>
 )}
 {result.almost.length > 0 && (
 <Section title="Almost there"sub="You're only a few ingredients away — each card shows exactly what to grab">
 {result.almost.map((r) => <RecipeCard key={r.recipe_id} recipe={r} />)}
 </Section>
 )}
 </div>
 );
}

function Section({ title, sub, children }: { title: React.ReactNode; sub: string; children: React.ReactNode }) {
 return (
 <section>
 <div className="mb-3">
 <h2 className="text-xl font-bold text-ink-900">{title}</h2>
 <p className="text-sm text-ink-700/70">{sub}</p>
 </div>
 <motion.div
 initial="hidden"
 animate="show"
 variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
 className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
 >
 {children}
 </motion.div>
 </section>
 );
}
