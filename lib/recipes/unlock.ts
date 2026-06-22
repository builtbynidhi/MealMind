import type { AlmostThereCard } from"@/lib/recipes/types";

export interface UnlockSuggestion {
 ingredient: string;
 unlocks: number; // recipes that become fully makeable by adding ONLY this
 appearsIn: number; // near-miss recipes that need this ingredient
}

// From the"almost there"results, find the ingredients that most help the user:
// primarily those that would single-handedly complete a recipe, then by overall
// frequency. Powers the"add X to unlock N more recipes"nudge.
export function unlockSuggestions(almost: AlmostThereCard[], max = 3): UnlockSuggestion[] {
 const unlocks = new Map<string, number>();
 const appears = new Map<string, number>();
 for (const r of almost) {
 for (const m of r.missing) appears.set(m, (appears.get(m) ?? 0) + 1);
 if (r.missing.length === 1) {
 const only = r.missing[0];
 unlocks.set(only, (unlocks.get(only) ?? 0) + 1);
 }
 }
 return [...appears.keys()]
 .map((ingredient) => ({
 ingredient,
 unlocks: unlocks.get(ingredient) ?? 0,
 appearsIn: appears.get(ingredient) ?? 0,
 }))
 .sort((a, b) => b.unlocks - a.unlocks || b.appearsIn - a.appearsIn)
 .slice(0, max);
}
