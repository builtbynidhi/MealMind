import { describe, it, expect } from"vitest";
import { normalizeName, round } from"@/lib/domain/normalize";
import { canonicalize } from"@/lib/domain/synonyms";

describe("normalizeName — singularization", () => {
 it("collapses -oes plurals to the singular (the core bug fix)", () => {
 expect(normalizeName("potatoes")).toBe("potato");
 expect(normalizeName("tomatoes")).toBe("tomato");
 expect(normalizeName("mangoes")).toBe("mango");
 });

 it("matches the singular form too (so plural == singular)", () => {
 expect(normalizeName("potato")).toBe("potato");
 expect(normalizeName("potatoes")).toBe(normalizeName("potato"));
 expect(normalizeName("tomatoes")).toBe(normalizeName("tomato"));
 });

 it("handles leaves → leaf without breaking olives → olive", () => {
 expect(normalizeName("curry leaves")).toBe("curry leaf");
 expect(normalizeName("bay leaves")).toBe("bay leaf");
 expect(normalizeName("olives")).toBe("olive");
 });

 it("keeps existing rules (ies→y, es, plain s) + strips digits/stopwords", () => {
 expect(normalizeName("berries")).toBe("berry");
 expect(normalizeName("dishes")).toBe("dish");
 expect(normalizeName("onions")).toBe("onion");
 expect(normalizeName("2 onions")).toBe("onion"); // digit stripped + singularized
 expect(normalizeName("fresh tomatoes")).toBe("tomato"); // stopword stripped + -oes fix
 });
});

describe("canonicalize — synonyms", () => {
 it("maps Indian-English aliases", () => {
 expect(canonicalize("aloo")).toBe("potato");
 expect(canonicalize("gobi")).toBe("cauliflower");
 expect(canonicalize("dhania")).toBe("coriander");
 expect(canonicalize("pyaaz")).toBe("onion");
 });

 it("maps regional/alternate names", () => {
 expect(canonicalize("scallion")).toBe("spring onion");
 expect(canonicalize("garbanzo")).toBe("chickpea");
 expect(canonicalize("aubergine")).toBe("eggplant");
 expect(canonicalize("cilantro")).toBe("coriander");
 });

 it("plural alias still maps (potatoes → potato via normalize)", () => {
 expect(canonicalize("potatoes")).toBe("potato");
 });

 it("passes through unknown ingredients unchanged (normalized)", () => {
 expect(canonicalize("Paneer")).toBe("paneer");
 });
});

describe("round", () => {
 it("rounds to 2 places by default", () => {
 expect(round(1.005)).toBeCloseTo(1.0, 2);
 expect(round(2.666)).toBe(2.67);
 });
});
