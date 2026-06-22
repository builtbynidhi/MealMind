// Pure, free derivations of"cooking depth"from existing recipe data — no LLM,
// no DB. Numbered steps come from the instructions text; time/difficulty are
// transparent heuristics (labeled"estimated"in the UI).

export type Difficulty ="Easy"|"Medium"|"Hard";

/** Split a free-text instruction blob into numbered, trimmed steps. */
export function toSteps(instructions: string | null | undefined): string[] {
 if (!instructions) return [];
 return instructions
 .split(/(?<=[.;!?])\s+|\n+|\s*;\s*/)
 .map((s) => s.trim().replace(/^[-*\d.)\s]+/,"").trim())
 .filter((s) => s.length > 1)
 .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

const SLOW = /(simmer|braise|roast|bake|slow|stew|boil|marinat|overnight|refrigerat|rest|rise|knead|grill|fry)/i;

/** Rough cook-time estimate in minutes from ingredient + step counts + cues. */
export function estimateCookTime(opts: {
 ingredientCount: number;
 instructions?: string | null;
}): number {
 const steps = toSteps(opts.instructions).length || 1;
 let mins = 10 + opts.ingredientCount * 2 + steps * 3;
 if (opts.instructions && SLOW.test(opts.instructions)) mins += 15;
 if (/overnight|marinat/i.test(opts.instructions ??"")) mins += 20;
 return Math.min(120, Math.max(10, Math.round(mins / 5) * 5)); // clamp + round to 5
}

/** Rough difficulty from how much is going on. */
export function estimateDifficulty(opts: {
 ingredientCount: number;
 instructions?: string | null;
}): Difficulty {
 const steps = toSteps(opts.instructions).length;
 const score = opts.ingredientCount + steps;
 if (score <= 9) return"Easy";
 if (score <= 15) return"Medium";
 return"Hard";
}
