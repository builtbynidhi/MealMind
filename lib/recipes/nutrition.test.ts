import { describe, it, expect } from"vitest";
import { estimateNutrition } from"@/lib/recipes/nutrition";

describe("estimateNutrition", () => {
 it("produces a sensible per-serving estimate with full coverage", () => {
 // Paneer Bhurji-ish for 2 servings.
 const n = estimateNutrition(
 [
 { name:"paneer", quantity: 200, unit:"g"},
 { name:"onion", quantity: 1, unit: null },
 { name:"tomato", quantity: 1, unit: null },
 { name:"bell pepper", quantity: 1, unit: null },
 ],
 2,
 );
 expect(n.coverage).toBe(1);
 expect(n.kcal).toBeGreaterThan(100);
 expect(n.kcal).toBeLessThan(800);
 expect(n.protein).toBeGreaterThan(0);
 });

 it("reports partial coverage when ingredients are unknown", () => {
 const n = estimateNutrition(
 [
 { name:"paneer", quantity: 100, unit:"g"},
 { name:"exotic-unknown-thing", quantity: 1, unit: null },
 ],
 1,
 );
 expect(n.coverage).toBe(0.5);
 });

 it("divides by servings (per-serving scales down with more people)", () => {
 const ings = [{ name:"rice", quantity: 200, unit:"g"}];
 const for2 = estimateNutrition(ings, 2);
 const for4 = estimateNutrition(ings, 4);
 expect(for4.kcal).toBeLessThan(for2.kcal);
 });
});
