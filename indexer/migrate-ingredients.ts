// One-off data migration: re-canonicalize every ingredient's normalized_name
// (fixed singularizer + synonyms), MERGE rows that now collapse to the same
// canonical name, repoint recipe_ingredients + pantry_items, and delete the
// orphaned duplicates. Idempotent — safe to re-run. Run with the service role:
// npm run migrate:ingredients
//
// Requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).

import { config } from"dotenv";
config({ path:".env.local"});

import { createClient } from"@supabase/supabase-js";
import { createAdminClient } from"@/lib/supabase/admin";
import { canonicalize } from"@/lib/domain/synonyms";

// Use the service role when it's set; otherwise fall back to the anon key, which
// only works while the temporary`tmp anon migrate ...`RLS policies are active
// (added/dropped around this run via the Supabase MCP).
function getDb() {
 const key = process.env.SUPABASE_SERVICE_ROLE_KEY ??"";
 if (key && !key.startsWith("your-")) return createAdminClient();
 console.warn("⚠ SUPABASE_SERVICE_ROLE_KEY not set — using anon key (needs temp RLS policies).");
 return createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 { auth: { persistSession: false, autoRefreshToken: false } },
 );
}

interface IngRow {
 id: string;
 name: string;
 normalized_name: string;
 aisle: string | null;
}

async function fetchAll(db: any, table: string, columns: string): Promise<any[]> {
 const out: any[] = [];
 const page = 1000;
 for (let from = 0; ; from += page) {
 const { data, error } = await db.from(table).select(columns).range(from, from + page - 1);
 if (error) throw new Error(`${table}: ${error.message}`);
 out.push(...(data ?? []));
 if (!data || data.length < page) break;
 }
 return out;
}

async function main() {
 const db = getDb();
 const DRY = process.argv.includes("--dry-run");
 if (DRY) console.log("— DRY RUN — no writes will be performed —\n");
 const mergePlan: string[] = [];

 const ingredients = (await fetchAll(db,"ingredients","id, name, normalized_name, aisle")) as IngRow[];

 // Group every ingredient by its NEW canonical name.
 const groups = new Map<string, IngRow[]>();
 for (const ing of ingredients) {
 const canon = canonicalize(ing.name) || ing.normalized_name;
 if (!canon) continue;
 (groups.get(canon) ?? groups.set(canon, []).get(canon)!).push(ing);
 }

 let merges = 0;
 let renames = 0;
 const pantryRenames: Array<[string, string]> = []; // [oldNorm, newNorm]

 for (const [canon, rows] of groups.entries()) {
 // Pick the canonical row: prefer one already named`canon`, else the most-linked.
 let primary = rows.find((r) => r.normalized_name === canon);
 if (!primary) {
 // most links wins
 let best = rows[0];
 let bestCount = -1;
 for (const r of rows) {
 const { count } = await db
 .from("recipe_ingredients")
 .select("recipe_id", { count:"exact", head: true })
 .eq("ingredient_id", r.id);
 if ((count ?? 0) > bestCount) {
 bestCount = count ?? 0;
 best = r;
 }
 }
 primary = best;
 }

 const dupes = rows.filter((r) => r.id !== primary!.id);

 // Merge each duplicate into the primary.
 for (const dup of dupes) {
 mergePlan.push(`merge"${dup.normalized_name}"→"${canon}"`);
 if (!DRY) {
 // Delete dup links that would collide with an existing primary link
 // (recipe_ids already linked to the primary), then repoint the rest.
 const { data: primRecs } = await db
 .from("recipe_ingredients")
 .select("recipe_id")
 .eq("ingredient_id", primary!.id);
 const conflictIds = (primRecs ?? []).map((r: any) => r.recipe_id);
 if (conflictIds.length) {
 await db.from("recipe_ingredients").delete().eq("ingredient_id", dup.id).in("recipe_id", conflictIds);
 }
 // Repoint the rest, then delete the now-orphaned ingredient row.
 await db.from("recipe_ingredients").update({ ingredient_id: primary!.id }).eq("ingredient_id", dup.id);
 await db.from("ingredients").delete().eq("id", dup.id);
 }
 if (dup.normalized_name !== canon) pantryRenames.push([dup.normalized_name, canon]);
 merges++;
 }

 // Normalize the primary row's name + aisle.
 const bestAisle = rows.map((r) => r.aisle).find((a) => a && a !=="Other") ?? primary.aisle ??"Other";
 if (primary.normalized_name !== canon || primary.aisle !== bestAisle) {
 if (primary.normalized_name !== canon) mergePlan.push(`rename"${primary.normalized_name}"→"${canon}"`);
 if (!DRY) {
 await db.from("ingredients").update({ normalized_name: canon, aisle: bestAisle }).eq("id", primary.id);
 }
 if (primary.normalized_name !== canon) {
 pantryRenames.push([primary.normalized_name, canon]);
 renames++;
 }
 }
 }

 // Repoint pantry items whose normalized_name changed.
 if (!DRY) {
 for (const [oldNorm, newNorm] of pantryRenames) {
 if (oldNorm === newNorm) continue;
 await db.from("pantry_items").update({ normalized_name: newNorm }).eq("normalized_name", oldNorm);
 }
 }

 if (DRY) {
 console.log(`Planned: ${merges} merges, ${renames} renames.\n`);
 for (const line of mergePlan.slice(0, 60)) console.log(""+ line);
 if (mergePlan.length > 60) console.log(`…and ${mergePlan.length - 60} more`);
 console.log("\n(dry run — nothing written)");
 return;
 }

 // Report.
 const after = await fetchAll(db,"ingredients","id, normalized_name");
 const seen = new Map<string, number>();
 for (const r of after) seen.set(r.normalized_name, (seen.get(r.normalized_name) ?? 0) + 1);
 const stillDup = [...seen.entries()].filter(([, c]) => c > 1);

 console.log(`✓ merges: ${merges}, renames: ${renames}, ingredients now: ${after.length}`);
 console.log(stillDup.length ?`⚠ remaining duplicate canonical names: ${stillDup.map(([n]) => n).join(",")}`:"✓ no duplicate canonical names remain");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
