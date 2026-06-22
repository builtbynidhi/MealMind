import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { scaleFactor, scaleLines, type ScalableLine } from"@/lib/domain/scale";
import type { RecipeDetailResponse } from"@/lib/recipes/types";

// Public — a recipe with its ingredients, scaled to`servings`people. The
// servings selector also scales client-side via lib/domain/scale.ts; this route
// is the authoritative initial load.
export const runtime ="nodejs";

const Params = z.object({ id: z.string().uuid() });
const Query = z.object({ servings: z.coerce.number().int().min(1).max(50).optional() });

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> },
) {
 const p = Params.safeParse(await params);
 if (!p.success) return NextResponse.json({ error:"Invalid id"}, { status: 400 });

 const q = Query.safeParse(
 Object.fromEntries(request.nextUrl.searchParams.entries()),
 );
 const targetServings = q.success ? q.data.servings : undefined;

 try {
 const supabase = await createClient();
 const { data: recipe, error } = await supabase
 .from("recipes")
 .select("id, title, summary, cuisine, dietary_tags, servings, instructions")
 .eq("id", p.data.id)
 .single();
 if (error || !recipe) return NextResponse.json({ error:"Recipe not found"}, { status: 404 });

 const { data: ris } = await supabase
 .from("recipe_ingredients")
 .select("quantity, unit, ingredients(name, aisle)")
 .eq("recipe_id", recipe.id);

 const lines: ScalableLine[] = (ris ?? []).map((row: any) => ({
 name: row.ingredients?.name ??"item",
 quantity: row.quantity,
 unit: row.unit,
 aisle: row.ingredients?.aisle ?? null,
 }));

 const baseServings = recipe.servings ?? 2;
 const servings = targetServings ?? baseServings;
 const factor = scaleFactor(servings, baseServings);

 const body: RecipeDetailResponse = {
 recipe: {
 id: recipe.id,
 title: recipe.title,
 summary: recipe.summary,
 cuisine: recipe.cuisine,
 dietary_tags: recipe.dietary_tags ?? [],
 instructions: recipe.instructions,
 },
 baseServings,
 servings,
 ingredients: scaleLines(lines, factor).map((l) => ({
 name: l.name,
 quantity: l.quantity,
 unit: l.unit,
 aisle: l.aisle ?? null,
 })),
 };
 return NextResponse.json(body);
 } catch (err: any) {
 return NextResponse.json({ error: err?.message ??"Lookup failed"}, { status: 500 });
 }
}
