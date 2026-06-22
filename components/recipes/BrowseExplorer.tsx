"use client";

import { useCallback, useEffect, useRef, useState } from"react";
import { RecipeCard, RecipeCardSkeleton } from"./RecipeCard";
import { fetchBrowse } from"@/lib/recipes/api";
import type { Diet, RecipeCardData } from"@/lib/recipes/types";
import { CANONICAL_CUISINES } from"@/indexer/data/types";

const PAGE = 24;
const DIETS: { key: Diet; label: string }[] = [
 { key:"any", label:"All"},
 { key:"veg", label:"Veg"},
 { key:"non-veg", label:"Non-veg"},
];

export function BrowseExplorer({ initialCuisine =""}: { initialCuisine?: string }) {
 const [cuisine, setCuisine] = useState(initialCuisine);
 const [diet, setDiet] = useState<Diet>("any");
 const [q, setQ] = useState("");
 const [debouncedQ, setDebouncedQ] = useState("");
 const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null);
 const [hasMore, setHasMore] = useState(false);
 const [loading, setLoading] = useState(false);
 const reqId = useRef(0);

 useEffect(() => {
 const t = setTimeout(() => setDebouncedQ(q), 300);
 return () => clearTimeout(t);
 }, [q]);

 const load = useCallback(
 async (offset: number) => {
 const id = ++reqId.current;
 setLoading(true);
 try {
 const res = await fetchBrowse({ cuisine: cuisine || undefined, diet, q: debouncedQ || undefined, limit: PAGE, offset });
 if (id !== reqId.current) return; // stale response
 setHasMore(res.hasMore);
 setRecipes((prev) => (offset === 0 ? res.recipes : [...(prev ?? []), ...res.recipes]));
 } catch {
 if (id === reqId.current) setRecipes([]);
 } finally {
 if (id === reqId.current) setLoading(false);
 }
 },
 [cuisine, diet, debouncedQ],
 );

 useEffect(() => {
 load(0);
 }, [load]);

 return (
 <div className="space-y-6">
 {/* Filter bar */}
 <div className="glass sticky top-16 z-20 space-y-3 rounded-xl2 p-4">
 <input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Search recipes…"
 className="input"
 aria-label="Search recipes"
 />
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={() => setCuisine("")}
 className={`rounded-full px-3 py-1 text-sm font-medium transition ${cuisine ===""?"bg-brand-gradient text-white shadow-glow":"bg-white text-ink-700 ring-1 ring-inset ring-ink-900/10"}`}
 >
 All cuisines
 </button>
 {CANONICAL_CUISINES.map((c) => (
 <button
 key={c}
 onClick={() => setCuisine(c)}
 className={`rounded-full px-3 py-1 text-sm font-medium transition ${cuisine === c ?"bg-brand-gradient text-white shadow-glow":"bg-white text-ink-700 ring-1 ring-inset ring-ink-900/10"}`}
 >
 {c}
 </button>
 ))}
 <span className="mx-1 h-5 w-px bg-ink-900/10"/>
 <div className="inline-flex rounded-xl bg-cream-100 p-1">
 {DIETS.map((d) => (
 <button
 key={d.key}
 onClick={() => setDiet(d.key)}
 aria-pressed={diet === d.key}
 className={`rounded-lg px-3 py-1 text-sm font-medium transition ${diet === d.key ?"bg-white text-brand-700 shadow-sm":"text-ink-700/70"}`}
 >
 {d.label}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Grid */}
 {recipes === null ? (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
 </div>
 ) : recipes.length === 0 ? (
 <div className="card text-center text-ink-700/80">
 <p className="text-lg font-semibold">No recipes match those filters</p>
 <p className="mt-1 text-sm">Try a different cuisine or clear the search.</p>
 </div>
 ) : (
 <>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {recipes.map((r) => <RecipeCard key={r.recipe_id} recipe={r} showMatch={false} />)}
 </div>
 {hasMore && (
 <div className="flex justify-center">
 <button onClick={() => load(recipes.length)} disabled={loading} className="btn-ghost">
 {loading ?"Loading…":"Load more"}
 </button>
 </div>
 )}
 </>
 )}
 </div>
 );
}
