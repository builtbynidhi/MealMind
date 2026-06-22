"use client";

import { useEffect, useState } from"react";
import { motion } from"framer-motion";
import {
 isFavorite,
 toggleFavorite,
 onFavoritesChanged,
 type FavoriteRecipe,
} from"@/lib/recipes/favorites";
import { useToast } from"@/components/ui/Toast";

export function FavoriteButton({
 recipe,
 size ="md",
}: {
 recipe: FavoriteRecipe;
 size?:"sm"|"md";
}) {
 const [fav, setFav] = useState(false);
 const toast = useToast();

 useEffect(() => {
 const sync = () => setFav(isFavorite(recipe.recipe_id));
 sync();
 return onFavoritesChanged(sync);
 }, [recipe.recipe_id]);

 const dim = size ==="sm"?"h-8 w-8 text-base":"h-10 w-10 text-lg";

 return (
 <motion.button
 whileTap={{ scale: 0.8 }}
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 const now = toggleFavorite(recipe);
 setFav(now);
 toast.show(now ?"Saved to favourites":"Removed from favourites", now ?"♥":"♡");
 }}
 aria-label={fav ?"Remove from favorites":"Save to favorites"}
 aria-pressed={fav}
 className={`inline-flex ${dim} items-center justify-center rounded-full border transition ${
 fav
 ?"border-accent-200 bg-accent-50 text-accent-600"
 :"border-ink-900/10 bg-white/80 text-ink-700/50 hover:text-accent-500"
 }`}
 >
 {fav ?"♥":"♡"}
 </motion.button>
 );
}
