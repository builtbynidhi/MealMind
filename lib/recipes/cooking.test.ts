import { describe, it, expect } from"vitest";
import { toSteps, estimateCookTime, estimateDifficulty } from"@/lib/recipes/cooking";

describe("toSteps", () => {
 it("splits sentences and semicolons into trimmed numbered steps", () => {
 const steps = toSteps("Sauté the onion. Add tomato and simmer; season with salt.");
 expect(steps).toEqual([
"Sauté the onion.",
"Add tomato and simmer",
"Season with salt.",
 ]);
 });
 it("returns [] for empty input", () => {
 expect(toSteps(null)).toEqual([]);
 expect(toSteps("")).toEqual([]);
 });
});

describe("estimateCookTime", () => {
 it("is clamped to [10,120] and rounded to 5", () => {
 const t = estimateCookTime({ ingredientCount: 6, instructions:"Mix and serve."});
 expect(t % 5).toBe(0);
 expect(t).toBeGreaterThanOrEqual(10);
 expect(t).toBeLessThanOrEqual(120);
 });
 it("adds time for slow-cooking cues", () => {
 const quick = estimateCookTime({ ingredientCount: 5, instructions:"Toss together."});
 const slow = estimateCookTime({ ingredientCount: 5, instructions:"Simmer and braise for a while."});
 expect(slow).toBeGreaterThan(quick);
 });
});

describe("estimateDifficulty", () => {
 it("scales with ingredient + step count", () => {
 expect(estimateDifficulty({ ingredientCount: 3, instructions:"Mix."})).toBe("Easy");
 expect(
 estimateDifficulty({
 ingredientCount: 12,
 instructions:"Do this. Then that. Then more. And more. Finally plate.",
 }),
 ).not.toBe("Easy");
 });
});
