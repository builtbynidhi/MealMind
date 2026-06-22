import type { Diet } from"@/lib/recipes/types";

// Map the UI niche selector to dietary_tags the matcher filters on (overlap).
//`veg`matches vegetarian OR vegan;`non-veg`matches the umbrella tag;`any`
// applies no dietary filter.
export function dietToTags(diet: Diet | undefined): string[] | undefined {
 if (diet ==="veg") return ["vegetarian","vegan"];
 if (diet ==="non-veg") return ["non-vegetarian"];
 return undefined;
}
