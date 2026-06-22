import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { cookFrom } from"@/lib/rag/cookFrom";
import { pseudonymize } from"@/lib/llm/safety";

// Public — no auth. Recipe KB is anon-readable (migration 0002). nodejs runtime
// because the optional`query`similarity blend loads the in-process BGE model.
export const runtime ="nodejs";

const Body = z.object({
 have: z.array(z.string().min(1)).min(1).max(60),
 maxMissing: z.number().int().min(0).max(3).optional(),
 diet: z.enum(["veg","non-veg","any"]).optional(),
 cuisine: z.string().max(40).optional(),
 query: z.string().max(300).optional(),
});

export async function POST(request: NextRequest) {
 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });

 try {
 const supabase = await createClient();
 const result = await cookFrom(supabase, {
 have: parsed.data.have,
 maxMissing: parsed.data.maxMissing,
 diet: parsed.data.diet,
 cuisine: parsed.data.cuisine || undefined,
 query: parsed.data.query ? pseudonymize(parsed.data.query) : undefined,
 });
 return NextResponse.json(result);
 } catch (err: any) {
 return NextResponse.json({ error: err?.message ??"Match failed"}, { status: 500 });
 }
}
