import { normalizeName } from"@/lib/domain/normalize";

// Deterministic, free (no LLM) eco-friendly waste reuse/disposal guidance, keyed
// by ingredient. Returns tips relevant to a recipe's ingredients so users can
// reuse or responsibly dispose of scraps. Always returns at least one tip.

export interface EcoTip {
 ingredient: string;
 tip: string;
}

// Specific tips by normalized ingredient name (singular, post-normalizeName).
const SPECIFIC: Record<string, string> = {
 egg:"Crush eggshells and mix into compost or garden soil — they add calcium and deter slugs. The shell membrane can go in compost too.",
 onion:"Save onion skins in a freezer bag and simmer them into a golden vegetable stock, then compost the spent skins.",
 garlic:"Garlic skins and ends boost homemade stock; compost what's left instead of binning it.",
 potato:"Roast potato peels with a little oil for crisps, or compost them — never send them to landfill.",
 tomato:"Compost tomato cores and skins; the seeds enrich your soil. Overripe tomatoes freeze well for sauces.",
 carrot:"Carrot tops make a pesto or stock; peels go straight into the compost.",
 banana:"Bury banana peels near plant roots or compost them — they're rich in potassium.",
 lemon:"Dry lemon peels for a natural surface cleaner (steep in vinegar), or candy the zest; compost the rest.",
 lime:"Use lime peels to scrub and deodorise sinks, then compost them.",
 ginger:"Regrow ginger from a leftover knob in soil, or freeze peels for tea; compost otherwise.",
 coriander:"Plant coriander stem ends to regrow, or compost trimmings.",
 cilantro:"Plant cilantro stem ends to regrow, or compost trimmings.",
 bread:"Turn stale bread into breadcrumbs or croutons; compost only un-mouldy scraps (mouldy bread goes to food-waste collection).",
 oil:"Never pour used cooking oil down the drain — cool it, seal it in a container, and drop it at a recycling/food-waste point.",
"olive oil":"Don't bin or drain leftover oil — collect it in a sealed jar and take it to an oil-recycling point.",
 rice:"Cooked rice leftovers can be fried the next day or frozen; never compost large amounts of cooked rice (pests) — use food-waste collection.",
 milk:"Use soured milk in baking or pancakes instead of pouring it away; small amounts can water acid-loving plants (diluted).",
 cheese:"Save hard cheese rinds to flavour soups and stocks; keep dairy out of home compost (pests) — use food-waste bins.",
 yogurt:"Empty yogurt pots make great seed-starter planters — rinse and reuse before recycling.",
};

// Category fallbacks (checked when no specific tip matches).
const MEAT = ["chicken","mutton","lamb","goat","beef","pork","bacon","ham","sausage"];
const SEAFOOD = ["fish","salmon","tuna","prawn","shrimp","crab","squid","anchovy","mussel","clam","octopu"];

export function ecoTipsForIngredients(names: string[]): EcoTip[] {
 const tips: EcoTip[] = [];
 const usedTips = new Set<string>();
 let hasMeat = false;
 let hasSeafood = false;
 let hasProduce = false;

 const push = (ingredient: string, tip: string) => {
 if (usedTips.has(tip)) return;
 usedTips.add(tip);
 tips.push({ ingredient, tip });
 };

 for (const raw of names) {
 const n = normalizeName(raw);
 if (SPECIFIC[n]) {
 push(raw, SPECIFIC[n]);
 continue;
 }
 const tokens = n.split("");
 if (MEAT.some((m) => tokens.includes(m) || n.includes(m))) hasMeat = true;
 else if (SEAFOOD.some((m) => tokens.includes(m) || n.includes(m))) hasSeafood = true;
 else hasProduce = true;
 }

 if (hasMeat)
 push("bones & meat trim","Simmer bones into a nourishing broth before disposal. Don't home-compost raw meat (pests/odour) — use a council food-waste caddy.");
 if (hasSeafood)
 push("seafood shells & trim","Shells make a quick seafood stock; keep raw seafood out of home compost and use food-waste collection or freeze trimmings until bin day.");

 // Always include a general composting nudge.
 if (hasProduce || tips.length === 0)
 push("vegetable scraps","Compost vegetable peels and trimmings instead of binning them — it cuts landfill methane and feeds your soil. No garden? Many councils offer food-waste collection.");

 return tips.slice(0, 5);
}
