import { normalizeName } from"@/lib/domain/normalize";

// Ingredient aliases → canonical name. Keys are already NORMALIZED (post
// normalizeName), values are the canonical normalized form. This unifies
// regional/alternate names so matching treats them as the same ingredient.
// Used at seed time (recipe ingredients) AND query time (user input) so both
// sides of the matcher agree.
export const SYNONYMS: Record<string, string> = {
 // Indian-English
 aloo:"potato",
 gobi:"cauliflower",
 pyaaz:"onion",
 pyaz:"onion",
 tamatar:"tomato",
 dhania:"coriander",
 jeera:"cumin",
 haldi:"turmeric",
 dahi:"yogurt",
 curd:"yogurt",
 besan:"chickpea flour",
 atta:"flour",
 maida:"flour",
 chawal:"rice",
 // British / US / regional
 cilantro:"coriander",
 scallion:"spring onion",
"green onion":"spring onion",
 aubergine:"eggplant",
 brinjal:"eggplant",
 courgette:"zucchini",
 capsicum:"bell pepper",
"bell peppers":"bell pepper",
 garbanzo:"chickpea",
"garbanzo bean":"chickpea",
"ladyfinger":"okra",
"bhindi":"okra",
 coriander_powder:"coriander",
"spring onions":"spring onion",
 // Cleanups of odd generated names
"b chamel sauce":"bechamel sauce",
"all purpose flour":"flour",
"plain flour":"flour",
"kosher salt":"salt",
"sea salt":"salt",
"table salt":"salt",
"granulated sugar":"sugar",
"caster sugar":"sugar",
"extra virgin olive oil":"olive oil",
"cooking oil":"oil",
"vegetable oil":"oil",
};

/** Normalize + map through the synonym table to a single canonical key. */
export function canonicalize(raw: string): string {
 const n = normalizeName(raw);
 return SYNONYMS[n] ?? n;
}
