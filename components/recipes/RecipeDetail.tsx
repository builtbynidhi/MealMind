"use client";

import { useMemo, useState } from"react";
import { motion } from"framer-motion";
import { scaleFactor, scaleLines } from"@/lib/domain/scale";
import { ecoTipsForIngredients } from"@/lib/recipes/ecoTips";
import { toSteps, estimateCookTime, estimateDifficulty } from"@/lib/recipes/cooking";
import { estimateNutrition } from"@/lib/recipes/nutrition";
import { toHouseholdUnit } from"@/lib/recipes/units";
import { FavoriteButton } from"./FavoriteButton";
import { RecipeArt } from"./RecipeArt";
import { RecipeCard } from"./RecipeCard";
import { useToast } from"@/components/ui/Toast";
import type { RecipeCardData, RecipeDetailResponse } from"@/lib/recipes/types";

function fmtQty(q: number | null): string {
 if (q == null) return"";
 return Number.isInteger(q) ? String(q) : String(q);
}

function Meta({ icon, label }: { icon: string; label: string }) {
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 text-sm font-medium text-ink-800 ring-1 ring-inset ring-ink-900/10">
 <span aria-hidden>{icon}</span>
 {label}
 </span>
 );
}

export function RecipeDetail({
 data,
 related = [],
 recipeId,
 avgRating,
 ratingCount = 0,
}: {
 data: RecipeDetailResponse;
 related?: RecipeCardData[];
 recipeId?: string;
 avgRating?: number | null;
 ratingCount?: number;
}) {
 const [servings, setServings] = useState(data.baseServings);
 const toast = useToast();
 const scaled = useMemo(
 () => scaleLines(data.ingredients, scaleFactor(servings, data.baseServings)),
 [servings, data.ingredients, data.baseServings],
 );

 const tags = data.recipe.dietary_tags;
 const ecoTips = useMemo(
 () => ecoTipsForIngredients(data.ingredients.map((i) => i.name)),
 [data.ingredients],
 );
 const steps = useMemo(() => toSteps(data.recipe.instructions), [data.recipe.instructions]);
 const cookTime = useMemo(
 () => estimateCookTime({ ingredientCount: data.ingredients.length, instructions: data.recipe.instructions }),
 [data.ingredients.length, data.recipe.instructions],
 );
 const difficulty = useMemo(
 () => estimateDifficulty({ ingredientCount: data.ingredients.length, instructions: data.recipe.instructions }),
 [data.ingredients.length, data.recipe.instructions],
 );
 const nutrition = useMemo(
 () => estimateNutrition(data.ingredients, data.baseServings),
 [data.ingredients, data.baseServings],
 );
 const favRecipe = {
 recipe_id: data.recipe.id,
 title: data.recipe.title,
 cuisine: data.recipe.cuisine,
 dietary_tags: tags,
 servings: data.baseServings,
 summary: data.recipe.summary,
 };
 const prep = Math.max(5, Math.round((cookTime * 0.4) / 5) * 5);
 const cook = Math.max(5, cookTime - prep);
 const diffStars = difficulty ==="Easy"? 1 : difficulty ==="Medium"? 2 : 3;

 async function share() {
 const url = typeof window !=="undefined"? window.location.href :"";
 try {
 if (typeof navigator !=="undefined"&& navigator.share) {
 await navigator.share({ title: data.recipe.title, text:`Cook ${data.recipe.title} on MealMind`, url });
 } else {
 await navigator.clipboard.writeText(url);
 toast.show("Link copied","🔗");
 }
 } catch {
 /* user dismissed share sheet */
 }
 }

 return (
 <div>
 <RecipeArt
 recipe={{ id: data.recipe.id, title: data.recipe.title, cuisine: data.recipe.cuisine }}
 className="mb-6 h-44 w-full rounded-xl sm:h-52"
 emojiClass="text-6xl"
 />
 <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
 <div>
 <div className="mb-2 flex flex-wrap items-center gap-2">
 {data.recipe.cuisine && <span className="tag">{data.recipe.cuisine}</span>}
 {tags.map((t) => <span key={t} className="tag">{t}</span>)}
 </div>
 <div className="flex items-start justify-between gap-3">
 <h1 className="text-3xl font-bold text-ink-900">{data.recipe.title}</h1>
 <div className="no-print flex items-center gap-2">
 <button onClick={share} aria-label="Share recipe"className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/10 bg-white/80 text-base transition hover:bg-white">🔗</button>
 <button onClick={() => window.print()} aria-label="Print recipe"className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-900/10 bg-white/80 text-base transition hover:bg-white">🖨️</button>
 <FavoriteButton recipe={favRecipe} />
 </div>
 </div>
 {data.recipe.summary && <p className="mt-2 text-ink-700/80">{data.recipe.summary}</p>}

 {/* Star rating display */}
 {avgRating !== null && avgRating !== undefined && ratingCount >= 1 && (
 <div className="mt-3 flex items-center gap-2">
 <div className="flex items-center gap-0.5">
 {[1,2,3,4,5].map((star) => (
 <span key={star} className={`text-base ${star <= Math.round(avgRating) ? "text-amber-400" : "text-ink-900/15"}`}>★</span>
 ))}
 </div>
 <span className="text-sm font-semibold text-ink-900">{avgRating}</span>
 <span className="text-sm text-ink-700/50">({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})</span>
 </div>
 )}

 {/* At-a-glance meta (estimated) */}
 <div className="mt-4 flex flex-wrap gap-2.5">
 <Meta icon="⏱️"label={`${prep} min prep · ${cook} min cook`} />
 <Meta icon="📊"label={`${difficulty} ${"●".repeat(diffStars)}${"○".repeat(3 - diffStars)}`} />
 {nutrition.coverage >= 0.5 && (
 <>
 <Meta icon="🔥"label={`~${nutrition.kcal} kcal`} />
 <Meta icon="💪"label={`~${nutrition.protein}g protein`} />
 </>
 )}
 </div>
 <p className="mt-1.5 text-xs text-ink-700/50">Times, difficulty &amp; nutrition are estimates (per serving).</p>

 {steps.length > 0 && (
 <div className="mt-6">
 <h2 className="text-lg font-semibold text-ink-900">Method</h2>
 <ol className="mt-3 space-y-3">
 {steps.map((s, i) => (
 <motion.li
 key={i}
 initial={{ opacity: 0, y: 6 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.05 }}
 className="flex gap-3"
 >
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
 {i + 1}
 </span>
 <span className="pt-0.5 leading-relaxed text-ink-800">{s}</span>
 </motion.li>
 ))}
 </ol>
 </div>
 )}

 {ecoTips.length > 0 && (
 <div className="mt-8 rounded-xl2 border border-brand-200 bg-brand-50/60 p-5">
 <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-800">
 ♻️ Reduce waste
 </h2>
 <p className="mt-1 text-sm text-brand-800/70">
 Eco-friendly ways to reuse or dispose of the scraps from this dish.
 </p>
 <ul className="mt-3 space-y-2.5">
 {ecoTips.map((t, i) => (
 <motion.li
 key={i}
 initial={{ opacity: 0, x: -8 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.06 }}
 className="flex gap-2.5 text-sm text-ink-800"
 >
 <span className="mt-0.5 select-none text-brand-600">🌱</span>
 <span>
 <span className="font-semibold capitalize">{t.ingredient}:</span> {t.tip}
 </span>
 </motion.li>
 ))}
 </ul>
 </div>
 )}
 </div>

 <div className="card h-fit shadow-soft">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-semibold text-ink-900">Ingredients</h2>
 <div className="flex items-center gap-2">
 <span className="text-xs font-medium text-ink-700/70">people</span>
 <div className="inline-flex items-center rounded-xl bg-cream-100 p-1">
 <button
 onClick={() => setServings((s) => Math.max(1, s - 1))}
 className="h-8 w-8 rounded-lg bg-white text-lg font-bold text-brand-700 shadow-sm active:scale-95"
 aria-label="Fewer servings"
 >
 −
 </button>
 <motion.span
 key={servings}
 initial={{ scale: 0.7, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="w-9 text-center text-base font-bold text-ink-900"
 >
 {servings}
 </motion.span>
 <button
 onClick={() => setServings((s) => Math.min(50, s + 1))}
 className="h-8 w-8 rounded-lg bg-white text-lg font-bold text-brand-700 shadow-sm active:scale-95"
 aria-label="More servings"
 >
 +
 </button>
 </div>
 </div>
 </div>

 <ul className="mt-4 divide-y divide-ink-900/10">
 {scaled.map((ing, i) => {
 const h = toHouseholdUnit(ing.quantity, ing.unit);
 return (
 <li key={i} className="flex items-center justify-between py-2.5">
 <span className="text-ink-800">{ing.name}</span>
 <span className="font-medium text-ink-900">
 {h.quantity != null ? fmtQty(h.quantity) :""} {h.unit ??""}
 </span>
 </li>
 );
 })}
 </ul>
 <p className="mt-3 text-xs text-ink-700/60">
 Quantities scale automatically — originally for {data.baseServings} {data.baseServings > 1 ?"people":"person"}.
 </p>
 </div>
 </div>

 {related.length > 0 && (
 <div className="no-print mt-12">
 <h2 className="mb-4 text-xl font-bold text-ink-900">
 More {data.recipe.cuisine ??""} recipes
 </h2>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {related.map((r) => <RecipeCard key={r.recipe_id} recipe={r} showMatch={false} />)}
 </div>
 </div>
 )}
 </div>
 );
}
