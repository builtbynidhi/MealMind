// Convert a recipe ingredient quantity + unit into measurements an Indian
// household relates to: weights → grams, volumes → cup / tbsp / tsp, and
// count/everyday units kept as-is (clove, pinch, slice…). Pure + display-only.

const GRAMS_PER: Record<string, number> = {
 lb: 453.6, lbs: 453.6, pound: 453.6, pounds: 453.6,
 oz: 28.35, ounce: 28.35, ounces: 28.35,
 kg: 1000, kgs: 1000, g: 1, gram: 1, grams: 1, gm: 1, gms: 1,
};
const ML_PER: Record<string, number> = { l: 1000, litre: 1000, liter: 1000, ml: 1 };
// Container-ish units → approximate grams.
const CONTAINER_G: Record<string, number> = {
 can: 400, tin: 400, block: 200, package: 200, packet: 200, pack: 200, jar: 300, stick: 115,
};
// Units that are already household-friendly and stay unchanged.
const KEEP = new Set(["cup","cups","tbsp","tablespoon","tablespoons","tsp","teaspoon","teaspoons","clove","cloves","pinch","bunch","handful","stalk","stalks","sprig","sprigs","slice","slices"]);
// Vague size words → just a count (drop the unit).
const SIZE_WORDS = new Set(["medium","large","small","whole","piece","pieces","ear","ears","head","heads","each"]);

function roundGrams(n: number): number {
 if (n >= 100) return Math.round(n / 10) * 10;
 if (n >= 20) return Math.round(n / 5) * 5;
 return Math.round(n);
}
function round1(n: number): number {
 return Math.round(n * 10) / 10;
}

export function toHouseholdUnit(
 quantity: number | null,
 unit: string | null,
): { quantity: number | null; unit: string | null } {
 if (quantity == null) return { quantity, unit: unit && SIZE_WORDS.has(unit.toLowerCase()) ? null : unit };
 const u = (unit ??"").toLowerCase().trim();

 if (!u) return { quantity, unit: null }; // bare count, e.g."2 onions"
 if (KEEP.has(u)) return { quantity, unit: u.replace(/s$/,"") };
 if (SIZE_WORDS.has(u)) return { quantity, unit: null };

 if (GRAMS_PER[u]) return { quantity: roundGrams(quantity * GRAMS_PER[u]), unit:"g"};
 if (CONTAINER_G[u]) return { quantity: roundGrams(quantity * CONTAINER_G[u]), unit:"g"};

 if (ML_PER[u]) {
 const ml = quantity * ML_PER[u];
 if (ml >= 240) return { quantity: round1(ml / 240), unit:"cup"};
 if (ml >= 15) return { quantity: Math.round(ml / 15), unit:"tbsp"};
 if (ml >= 5) return { quantity: Math.round(ml / 5), unit:"tsp"};
 return { quantity: Math.round(ml), unit:"ml"};
 }

 return { quantity, unit }; // unknown — leave as-is
}
