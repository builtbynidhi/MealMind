import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { recommend } from"@/lib/recipes/recommend";

// Public — recommended-recipe chart from the user's groceries + niche filters.
export const runtime ="nodejs";

const Body = z.object({
 groceries: z.array(z.string().min(1)).min(1).max(80),
 diet: z.enum(["veg","non-veg","any"]).optional(),
 cuisine: z.string().max(40).optional(),
});

export async function POST(request: NextRequest) {
 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });

 try {
 const supabase = await createClient();
 const result = await recommend(supabase, {
 groceries: parsed.data.groceries,
 diet: parsed.data.diet,
 cuisine: parsed.data.cuisine || undefined,
 });
 return NextResponse.json(result);
 } catch (err: any) {
 return NextResponse.json({ error: err?.message ??"Recommendation failed"}, { status: 500 });
 }
}
