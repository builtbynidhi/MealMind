// Canonicalize an ingredient / pantry item name so"2 Litres of Milk","milk",
// and"Milks"all match the same pantry/ingredient row. Pure + deterministic.

export function normalizeName(raw: string): string {
 let s = raw
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\b\d+(\.\d+)?\b/g,"") // drop stray quantities
 .replace(/\b(of|the|a|an|some|fresh|raw|ground)\b/g,"")
 .replace(/\s+/g, " ")
 .trim();

 // Singularization. Order matters; specific suffixes before the generic -s.
 if (s.endsWith("leaves")) s = s.slice(0, -6) +"leaf"; // (curry) leaves → leaf
 else if (s.endsWith("ies")) s = s.slice(0, -3) +"y"; // berries → berry
 else if (s.endsWith("oes")) s = s.slice(0, -2); // potatoes → potato, tomatoes → tomato
 else if (/(?:ses|ches|shes|xes)$/.test(s)) s = s.slice(0, -2); // boxes → box, dishes → dish
 else if (s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1); // onions → onion (olives → olive)

 return s.trim();
}

export function round(n: number, places = 2): number {
 const f = 10 ** places;
 return Math.round(n * f) / f;
}
