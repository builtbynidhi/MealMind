// Shared recipe-seed shape + canonical vocab used by the seeder, the validator,
// and the LLM generator. Keep this the single source of truth.

export interface Ing {
 name: string;
 qty?: number;
 unit?: string;
}

export interface Seed {
 slug: string;
 title: string;
 summary: string;
 cuisine: string;
 tags: string[];
 servings: number;
 instructions: string;
 ingredients: Ing[];
}

// Niche selector + corpus standardize on these exact cuisine strings.
export const CANONICAL_CUISINES = [
"Indian",
"Italian",
"Chinese",
"Thai",
"Mexican",
"Mediterranean",
"Continental",
"American",
] as const;

export type Cuisine = (typeof CANONICAL_CUISINES)[number];

// Diet vocabulary. Every recipe must carry exactly one of veg/non-veg stance:
// - vegetarian or vegan → meat-free
// - non-vegetarian → contains meat/seafood (umbrella filter)
// Sub-tags (chicken/mutton/seafood/egg) refine non-veg + egg classification.
export const DIET_TAGS = [
"vegetarian",
"vegan",
"non-vegetarian",
"chicken",
"mutton",
"seafood",
"egg",
"high-protein",
"gluten-free",
"low-carb",
"dairy-free",
] as const;

// Normalized ingredient tokens that imply a recipe MUST be non-vegetarian.
// (Compared after normalizeName(); singular forms.) The validator hard-fails any
// recipe that contains one of these but isn't tagged non-vegetarian.
export const MEAT_TERMS = [
"chicken","mutton","lamb","goat","beef","pork","bacon","ham","sausage",
"fish","salmon","tuna","prawn","shrimp","crab","squid","anchovy","meat",
];
