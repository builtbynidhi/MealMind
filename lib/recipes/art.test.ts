import { describe, it, expect } from"vitest";
import { recipeArt } from"@/lib/recipes/art";
import { CANONICAL_CUISINES } from"@/indexer/data/types";

describe("recipeArt", () => {
 it("returns a gradient + emoji for every canonical cuisine", () => {
 for (const cuisine of CANONICAL_CUISINES) {
 const art = recipeArt({ id:"x", title:"Test Dish", cuisine });
 expect(art.background).toMatch(/linear-gradient/);
 expect(art.emoji.length).toBeGreaterThan(0);
 }
 });

 it("is deterministic for the same id", () => {
 const a = recipeArt({ id:"abc", title:"Paneer Tikka", cuisine:"Indian"});
 const b = recipeArt({ id:"abc", title:"Paneer Tikka", cuisine:"Indian"});
 expect(a).toEqual(b);
 });

 it("picks a dish-specific emoji from the title", () => {
 expect(recipeArt({ id:"1", title:"Margherita Pizza", cuisine:"Italian"}).emoji).toBe("🍕");
 expect(recipeArt({ id:"2", title:"Chicken Curry", cuisine:"Indian"}).emoji).toBe("🍛");
 expect(recipeArt({ id:"3", title:"Veg Fried Rice", cuisine:"Chinese"}).emoji).toBe("🍚");
 expect(recipeArt({ id:"4", title:"Greek Salad", cuisine:"Mediterranean"}).emoji).toBe("🥗");
 });

 it("falls back gracefully for unknown cuisine", () => {
 const art = recipeArt({ id:"z", title:"Mystery Stew", cuisine: null });
 expect(art.background).toMatch(/linear-gradient/);
 expect(art.emoji).toBe("🍲"); //'stew'keyword
 });
});
