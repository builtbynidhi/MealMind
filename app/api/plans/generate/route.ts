import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { requireRole } from"@/lib/db/queries";
import { generatePlanForHousehold, upcomingSunday } from"@/lib/plans/generate";

export const runtime ="nodejs"; // embeddings (onnxruntime) + LLM SDKs
export const maxDuration = 60;

const Body = z.object({
 householdId: z.string().uuid(),
 constraints: z.string().max(2000).default(""),
 weekStart: z.string().optional(),
});

export async function POST(request: NextRequest) {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error:"Unauthorized"}, { status: 401 });

 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });
 const { householdId, constraints } = parsed.data;

 try {
 await requireRole(householdId,"owner");
 const result = await generatePlanForHousehold(supabase, {
 householdId,
 constraints,
 weekStart: parsed.data.weekStart ?? upcomingSunday(),
 origin:"user",
 });
 return NextResponse.json(result);
 } catch (err: any) {
 const msg = err?.message ??"Plan generation failed";
 if (msg ==="NO_RECIPES")
 return NextResponse.json(
 { error:"No recipes matched. Run`npm run setup`to seed the knowledge base, or relax your constraints."},
 { status: 422 },
 );
 if (msg ==="EMPTY_PLAN")
 return NextResponse.json({ error:"Could not assemble a valid plan. Try again."}, { status: 422 });
 const status = /owner role required|not a member/i.test(msg) ? 403 : 500;
 return NextResponse.json({ error: msg }, { status });
 }
}
