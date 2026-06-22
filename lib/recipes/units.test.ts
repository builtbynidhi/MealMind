import { describe, it, expect } from"vitest";
import { toHouseholdUnit } from"@/lib/recipes/units";

describe("toHouseholdUnit (Indian household measures)", () => {
 it("converts pounds/oz to grams", () => {
 expect(toHouseholdUnit(1,"lb")).toEqual({ quantity: 450, unit:"g"});
 expect(toHouseholdUnit(8,"oz").unit).toBe("g");
 });
 it("converts containers to grams", () => {
 expect(toHouseholdUnit(1,"can")).toEqual({ quantity: 400, unit:"g"});
 expect(toHouseholdUnit(1,"block")).toEqual({ quantity: 200, unit:"g"});
 });
 it("converts ml/litre to cup/tbsp/tsp", () => {
 expect(toHouseholdUnit(240,"ml")).toEqual({ quantity: 1, unit:"cup"});
 expect(toHouseholdUnit(1,"litre")).toEqual({ quantity: 4.2, unit:"cup"});
 expect(toHouseholdUnit(15,"ml")).toEqual({ quantity: 1, unit:"tbsp"});
 expect(toHouseholdUnit(5,"ml")).toEqual({ quantity: 1, unit:"tsp"});
 });
 it("keeps household-friendly units", () => {
 expect(toHouseholdUnit(2,"cup")).toEqual({ quantity: 2, unit:"cup"});
 expect(toHouseholdUnit(1,"tbsp")).toEqual({ quantity: 1, unit:"tbsp"});
 expect(toHouseholdUnit(3,"cloves")).toEqual({ quantity: 3, unit:"clove"});
 });
 it("drops vague size words to a bare count", () => {
 expect(toHouseholdUnit(1,"medium")).toEqual({ quantity: 1, unit: null });
 expect(toHouseholdUnit(2,"large")).toEqual({ quantity: 2, unit: null });
 });
 it("leaves bare counts and grams untouched", () => {
 expect(toHouseholdUnit(2, null)).toEqual({ quantity: 2, unit: null });
 expect(toHouseholdUnit(200,"g")).toEqual({ quantity: 200, unit:"g"});
 });
});
