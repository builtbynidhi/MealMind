import { describe, it, expect } from"vitest";
import { scaleFactor, scaleQuantity, scaleLines } from"@/lib/domain/scale";

describe("portion scaling", () => {
 it("computes the factor from target/base servings", () => {
 expect(scaleFactor(8, 2)).toBe(4);
 expect(scaleFactor(2, 2)).toBe(1);
 expect(scaleFactor(3, 2)).toBe(1.5);
 });

 it("falls back to 1 when base servings is invalid", () => {
 expect(scaleFactor(5, 0)).toBe(1);
 });

 it("scales quantities and preserves nulls (unmeasured items)", () => {
 expect(scaleQuantity(200, 4)).toBe(800);
 expect(scaleQuantity(0.5, 1.5)).toBe(0.75);
 expect(scaleQuantity(null, 4)).toBeNull();
 });

 it("scales a list of lines, keeping other fields", () => {
 const lines = [
 { name:"paneer", quantity: 200, unit:"g", aisle:"Dairy & Eggs"},
 { name:"salt", quantity: null, unit: null, aisle: null },
 ];
 const out = scaleLines(lines, scaleFactor(8, 2));
 expect(out[0].quantity).toBe(800);
 expect(out[0].name).toBe("paneer");
 expect(out[1].quantity).toBeNull();
 });
});
