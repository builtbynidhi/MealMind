import { canonicalize } from"@/lib/domain/synonyms";

// Rough, transparent nutrition estimate — NOT lab-accurate. Per-ingredient
// energy/protein densities (per gram) × approximate gram weights, divided by
// servings. The UI labels this"estimated". Pure + free (no API).

// [kcal per gram, protein grams per gram]
const DENSITY: Record<string, [number, number]> = {
 // staples
 rice: [3.6, 0.07],"basmati rice": [3.6, 0.07], flour: [3.64, 0.1], oats: [3.89, 0.13],
 bread: [2.65, 0.09], pasta: [3.7, 0.13], noodles: [3.7, 0.12], quinoa: [3.68, 0.14],
 poha: [3.5, 0.07], sugar: [4.0, 0], honey: [3.04, 0],
 // legumes / protein
 lentil: [3.5, 0.25],"red lentil": [3.5, 0.25], chickpea: [1.64, 0.09],"kidney bean": [1.3, 0.09],
"black bean": [1.32, 0.09], paneer: [2.65, 0.18], tofu: [1.44, 0.15], egg: [1.55, 0.13],
 chicken: [1.9, 0.25], mutton: [2.34, 0.25], lamb: [2.34, 0.25], beef: [2.5, 0.26], pork: [2.42, 0.27],
 fish: [1.4, 0.22], salmon: [2.08, 0.2], tuna: [1.32, 0.28], prawn: [0.99, 0.24], shrimp: [0.99, 0.24],
 // dairy / fats
 milk: [0.42, 0.034], yogurt: [0.59, 0.1], cheese: [4.0, 0.25],"feta cheese": [2.64, 0.14],
 parmesan: [4.3, 0.38], mozzarella: [3.0, 0.22], butter: [7.17, 0.01], ghee: [9.0, 0],
"olive oil": [8.84, 0], oil: [8.84, 0], cream: [3.4, 0.02],
 // produce
 onion: [0.4, 0.011],"spring onion": [0.32, 0.018], potato: [0.77, 0.02], tomato: [0.18, 0.009],
 carrot: [0.41, 0.009], peas: [0.81, 0.054],"bell pepper": [0.31, 0.01],"green chili": [0.4, 0.02],
 cauliflower: [0.25, 0.019], cucumber: [0.15, 0.007], spinach: [0.23, 0.029], broccoli: [0.34, 0.028],
 mushroom: [0.22, 0.031], garlic: [1.49, 0.064], ginger: [0.8, 0.018], lemon: [0.29, 0.011],
 lime: [0.3, 0.007], banana: [0.89, 0.011], berry: [0.5, 0.007], coriander: [0.23, 0.021],
 olive: [1.15, 0.008], eggplant: [0.25, 0.01], zucchini: [0.17, 0.012], corn: [0.86, 0.032],
 // pantry / misc
"coconut milk": [2.3, 0.023], tahini: [5.95, 0.17], peanut: [5.67, 0.26], cashew: [5.53, 0.18],
"soy sauce": [0.53, 0.08], chickpea_flour: [3.87, 0.22],"tomato paste": [0.82, 0.042],
};

// Approximate grams per unit (generic).
const UNIT_GRAMS: Record<string, number> = {
 g: 1, gram: 1, grams: 1, kg: 1000, ml: 1, l: 1000, litre: 1000, liter: 1000,
 cup: 200, tbsp: 15, tablespoon: 15, tsp: 5, teaspoon: 5, slice: 25, clove: 5,
 can: 400, bunch: 50, pinch: 1, handful: 30,
};

// Approximate grams for a single count item (no unit), by ingredient.
const PIECE_GRAMS: Record<string, number> = {
 onion: 110,"spring onion": 15, potato: 150, tomato: 120, carrot: 60,"bell pepper": 120,
"green chili": 8, garlic: 5, ginger: 15, lemon: 60, lime: 45, banana: 120, egg: 50,
 cucumber: 200, cauliflower: 500, eggplant: 250, zucchini: 200,
};

export interface NutritionEstimate {
 kcal: number; // per serving
 protein: number; // grams per serving
 coverage: number; // 0..1 fraction of ingredients we had data for
}

export interface NutritionInput {
 name: string;
 quantity: number | null;
 unit: string | null;
}

function gramsFor(canon: string, quantity: number | null, unit: string | null): number {
 if (quantity == null) return PIECE_GRAMS[canon] ?? 80; // unmeasured / count item
 if (!unit) return quantity * (PIECE_GRAMS[canon] ?? 80); //"2 onions"
 return quantity * (UNIT_GRAMS[unit.toLowerCase()] ?? 50);
}

export function estimateNutrition(ingredients: NutritionInput[], servings: number): NutritionEstimate {
 let kcal = 0;
 let protein = 0;
 let known = 0;
 const s = servings > 0 ? servings : 1;
 for (const ing of ingredients) {
 const canon = canonicalize(ing.name);
 const d = DENSITY[canon];
 if (!d) continue;
 known++;
 const grams = gramsFor(canon, ing.quantity, ing.unit);
 kcal += grams * d[0];
 protein += grams * d[1];
 }
 return {
 kcal: Math.round(kcal / s / 5) * 5,
 protein: Math.round(protein / s),
 coverage: ingredients.length ? known / ingredients.length : 0,
 };
}
