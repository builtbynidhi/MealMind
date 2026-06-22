import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { dietToTags } from"@/lib/recipes/diet";
import type { RecipeCardData } from"@/lib/recipes/types";

// Public catalog browse: filter the recipe library by cuisine / diet / text.
export const runtime ="nodejs";

const Query = z.object({
 cuisine: z.string().max(40).optional(),
 diet: z.enum(["veg","non-veg","any"]).optional(),
 q: z.string().max(80).optional(),
 limit: z.coerce.number().int().min(1).max(48).default(24),
 offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
 const parsed = Query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
 if (!parsed.success) return NextResponse.json({ error:"Invalid query"}, { status: 400 });
 const { cuisine, diet, q, limit, offset } = parsed.data;

 try {
 const supabase = await createClient();
 let query = supabase
 .from("recipes")
 .select("id, title, cuisine, dietary_tags, servings, summary")
 .order("title", { ascending: true })
 .range(offset, offset + limit - 1);

 if (cuisine) query = query.eq("cuisine", cuisine);
 const tags = dietToTags(diet);
 if (tags) query = query.overlaps("dietary_tags", tags);
 if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);

 const { data, error } = await query;
 if (error) throw error;

 const recipes: RecipeCardData[] = (data ?? []).map((r: any) => ({
 recipe_id: r.id,
 title: r.title,
 cuisine: r.cuisine,
 dietary_tags: r.dietary_tags ?? [],
 servings: r.servings ?? 2,
 summary: r.summary,
 coverage: 1,
 }));
 return NextResponse.json({ recipes, hasMore: recipes.length === limit });
 } catch (err: any) {
 return NextResponse.json({ error: err?.message ??"Browse failed"}, { status: 500 });
 }
}
