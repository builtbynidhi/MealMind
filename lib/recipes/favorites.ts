"use client";

// Client-only favorites stored in localStorage — no account required. A custom
// event lets all mounted components react to changes instantly.

export interface FavoriteRecipe {
 recipe_id: string;
 title: string;
 cuisine: string | null;
 dietary_tags: string[];
 servings: number;
 summary: string | null;
}

const KEY ="mealmind:favorites";
const EVENT ="mealmind:favorites-changed";

export function getFavorites(): FavoriteRecipe[] {
 if (typeof window ==="undefined") return [];
 try {
 return JSON.parse(localStorage.getItem(KEY) ??"[]") as FavoriteRecipe[];
 } catch {
 return [];
 }
}

export function isFavorite(id: string): boolean {
 return getFavorites().some((f) => f.recipe_id === id);
}

function save(list: FavoriteRecipe[]) {
 localStorage.setItem(KEY, JSON.stringify(list));
 window.dispatchEvent(new Event(EVENT));
}

/** Add if missing, remove if present. Returns the new favorited state. */
export function toggleFavorite(recipe: FavoriteRecipe): boolean {
 const list = getFavorites();
 const idx = list.findIndex((f) => f.recipe_id === recipe.recipe_id);
 if (idx >= 0) {
 list.splice(idx, 1);
 save(list);
 return false;
 }
 list.unshift(recipe);
 save(list);
 return true;
}

/** Subscribe to favorite changes (returns an unsubscribe fn). */
export function onFavoritesChanged(cb: () => void): () => void {
 if (typeof window ==="undefined") return () => {};
 window.addEventListener(EVENT, cb);
 window.addEventListener("storage", cb); // cross-tab
 return () => {
 window.removeEventListener(EVENT, cb);
 window.removeEventListener("storage", cb);
 };
}
