import { describe, it, expect } from"vitest";
import { unlockSuggestions } from"@/lib/recipes/unlock";
import type { AlmostThereCard } from"@/lib/recipes/types";

const mk = (id: string, missing: string[]): AlmostThereCard => ({
 recipe_id: id,
 title: id,
 cuisine:"Indian",
 dietary_tags: [],
 servings: 2,
 summary: null,
 coverage: 0.5,
 have: 2,
 total: 2 + missing.length,
 missing,
});

describe("unlockSuggestions", () => {
 it("ranks single-missing ingredients (true unlocks) first", () => {
 const almost = [
 mk("a", ["cauliflower"]),
 mk("b", ["cauliflower"]),
 mk("c", ["turmeric","cumin"]),
 ];
 const s = unlockSuggestions(almost, 3);
 expect(s[0].ingredient).toBe("cauliflower");
 expect(s[0].unlocks).toBe(2);
 });

 it("falls back to frequency when nothing is a sole-missing item", () => {
 const almost = [mk("a", ["x","y"]), mk("b", ["x","z"])];
 const s = unlockSuggestions(almost, 3);
 expect(s[0].ingredient).toBe("x"); // appears twice
 expect(s[0].unlocks).toBe(0);
 expect(s[0].appearsIn).toBe(2);
 });

 it("respects the max count", () => {
 const almost = [mk("a", ["p"]), mk("b", ["q"]), mk("c", ["r"]), mk("d", ["s"])];
 expect(unlockSuggestions(almost, 2)).toHaveLength(2);
 });

 it("returns nothing for an empty list", () => {
 expect(unlockSuggestions([], 3)).toEqual([]);
 });
});
