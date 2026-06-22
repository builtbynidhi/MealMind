import { recipeArt, type RecipeArtInput } from"@/lib/recipes/art";

// Refined recipe banner: a muted tonal gradient with a tasteful emoji and a soft
// scrim for depth. Used as the card header and the detail hero.
export function RecipeArt({
 recipe,
 className ="",
 emojiClass ="text-4xl",
}: {
 recipe: RecipeArtInput;
 className?: string;
 emojiClass?: string;
}) {
 const { background, emoji } = recipeArt(recipe);
 return (
 <div
 className={`relative flex items-center justify-center overflow-hidden ${className}`}
 style={{ backgroundImage: background }}
 aria-hidden
 >
 <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent"/>
 <span className={`relative opacity-90 drop-shadow-sm ${emojiClass}`}>{emoji}</span>
 </div>
 );
}
