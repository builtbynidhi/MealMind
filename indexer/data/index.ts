import { readFileSync, existsSync } from"node:fs";
import { join } from"node:path";
import type { Seed } from"./types";
import { CURATED } from"./curated";

// LLM-generated recipes live in generated.json (produced by`npm run generate`).
// They're merged with the curated backbone; curated wins on slug collisions.
function loadGenerated(): Seed[] {
 const p = join(process.cwd(),"indexer/data/generated.json");
 if (!existsSync(p)) return [];
 try {
 const parsed = JSON.parse(readFileSync(p,"utf8"));
 return Array.isArray(parsed) ? (parsed as Seed[]) : [];
 } catch {
 return [];
 }
}

/** Curated + generated recipes, deduped by slug (curated authoritative). */
export function allRecipes(): Seed[] {
 const seen = new Set<string>();
 const out: Seed[] = [];
 for (const r of [...CURATED, ...loadGenerated()]) {
 if (seen.has(r.slug)) continue;
 seen.add(r.slug);
 out.push(r);
 }
 return out;
}
