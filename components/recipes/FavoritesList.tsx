"use client";

import { useEffect, useState } from"react";
import Link from"next/link";
import { RecipeCard } from"./RecipeCard";
import { getFavorites, onFavoritesChanged, type FavoriteRecipe } from"@/lib/recipes/favorites";

export function FavoritesList() {
 const [favs, setFavs] = useState<FavoriteRecipe[] | null>(null); // null = not yet hydrated

 useEffect(() => {
 const sync = () => setFavs(getFavorites());
 sync();
 return onFavoritesChanged(sync);
 }, []);

 if (favs === null) {
 return (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-44 w-full"/>)}
 </div>
 );
 }

 if (favs.length === 0) {
 return (
 <div className="card text-center text-ink-700/80">
 <p className="text-lg font-semibold">No saved recipes yet ♡</p>
 <p className="mt-1 text-sm">
 Tap the heart on any recipe to save it here.{""}
 <Link href="/recipes"className="font-medium text-brand-700 hover:underline">Find recipes →</Link>
 </p>
 </div>
 );
 }

 return (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {favs.map((f) => (
 <RecipeCard key={f.recipe_id} recipe={{ ...f, coverage: 1 }} showMatch={false} />
 ))}
 </div>
 );
}
