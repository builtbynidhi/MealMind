// Deterministic, no-dependency illustrated art for a recipe: a per-cuisine
// gradient + a dish-matched emoji. Pure (used by server + client). Gives every
// recipe a distinct, appetizing visual without any image assets or API.

// Muted, desaturated, cohesive tones — refined (not candy). One per cuisine.
const CUISINE_GRADIENTS: Record<string, string[]> = {
 Indian: ["linear-gradient(135deg,#cdbfa3,#a98f6b)"],
 Italian: ["linear-gradient(135deg,#c9a59c,#9c6f63)"],
 Chinese: ["linear-gradient(135deg,#bda7a0,#8f6f66)"],
 Thai: ["linear-gradient(135deg,#aebfa3,#7d9472)"],
 Mexican: ["linear-gradient(135deg,#d0b08a,#a87f56)"],
 Mediterranean: ["linear-gradient(135deg,#a9bcbf,#71908f)"],
 Continental: ["linear-gradient(135deg,#c4c1b6,#94908a)"],
 American: ["linear-gradient(135deg,#aab4c2,#737f92)"],
};
const DEFAULT_GRADIENTS = ["linear-gradient(135deg,#b8c2b0,#8a9683)"];

const CUISINE_EMOJI: Record<string, string> = {
 Indian:"🍛", Italian:"🍝", Chinese:"🥡", Thai:"🍜",
 Mexican:"🌮", Mediterranean:"🥗", Continental:"🥪", American:"🍔",
};

// Dish-keyword → emoji, checked in order for variety beyond the cuisine default.
const DISH_EMOJI: Array<[RegExp, string]> = [
 [/pizza/,"🍕"], [/pasta|spaghetti|noodle|linguine|fettuccine|lasagn|macaroni|penne/,"🍝"],
 [/curry|masala|tikka|korma|gravy|vindaloo/,"🍛"], [/soup|broth|stew|chowder|bisque|rasam/,"🍲"],
 [/salad|slaw|tabbouleh/,"🥗"], [/taco|burrito|quesadilla|fajita|nacho|enchilada/,"🌮"],
 [/burger|sandwich|panini|sub |wrap/,"🍔"], [/biryani|pulao|risotto|fried rice|pilaf/,"🍚"],
 [/cake|brownie|\bpie\b|pudding|tart|cookie|dessert|halwa|kheer/,"🍰"],
 [/bread|naan|roti|paratha|toast|\bbun\b|focaccia|baguette/,"🥖"],
 [/egg|omelet|omelette|frittata|shakshuka/,"🍳"], [/fish|salmon|tuna|prawn|shrimp|seafood|mussel|clam/,"🐟"],
 [/chicken|\bwing/,"🍗"], [/dumpling|momo|\bbao\b|wonton|gyoza|spring roll/,"🥟"],
 [/smoothie|juice|shake|lassi|drink/,"🥤"], [/stir.?fry|\bwok\b|teriyaki/,"🥢"],
 [/tofu|paneer|tempeh/,"🧀"], [/oat|porridge|poha|granola/,"🥣"], [/rice/,"🍚"],
];

function hash(s: string): number {
 let h = 0;
 for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
 return h;
}

export interface RecipeArtInput {
 id: string;
 title: string;
 cuisine?: string | null;
}

export function recipeArt(r: RecipeArtInput): { background: string; emoji: string } {
 const variants = (r.cuisine && CUISINE_GRADIENTS[r.cuisine]) || DEFAULT_GRADIENTS;
 const background = variants[hash(r.id || r.title) % variants.length];
 const t = (r.title ||"").toLowerCase();
 let emoji = (r.cuisine && CUISINE_EMOJI[r.cuisine]) ||"🍽️";
 for (const [re, e] of DISH_EMOJI) {
 if (re.test(t)) {
 emoji = e;
 break;
 }
 }
 return { background, emoji };
}
