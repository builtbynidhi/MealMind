import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";
import { requireRole } from"@/lib/db/queries";
import { generateJSON } from"@/lib/llm/provider";
import { pantryCommandPrompt } from"@/lib/llm/prompts";
import { PantryCommandSet } from"@/lib/llm/schemas";
import { canonicalize } from"@/lib/domain/synonyms";

export const runtime ="nodejs";

const Body = z.object({
 householdId: z.string().uuid(),
 transcript: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error:"Unauthorized"}, { status: 401 });

 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });
 const { householdId, transcript } = parsed.data;

 try {
 await requireRole(householdId,"member");

 const cp = pantryCommandPrompt(transcript);
 const { commands } = await generateJSON({ system: cp.system, prompt: cp.prompt, schema: PantryCommandSet });

 const applied: string[] = [];
 for (const cmd of commands) {
 const normalized = canonicalize(cmd.item);
 if (!normalized) continue;

 if (cmd.action ==="remove") {
 await supabase.from("pantry_items").delete().eq("household_id", householdId).eq("normalized_name", normalized);
 applied.push(`removed ${cmd.item}`);
 continue;
 }

 const { data: existing } = await supabase
 .from("pantry_items")
 .select("id, quantity")
 .eq("household_id", householdId)
 .eq("normalized_name", normalized)
 .maybeSingle();

 if (cmd.action ==="set") {
 const quantity = cmd.quantity ?? 0;
 if (existing) {
 await supabase
 .from("pantry_items")
 .update({ quantity, unit: cmd.unit, updated_at: new Date().toISOString() })
 .eq("id", existing.id);
 } else {
 await supabase.from("pantry_items").insert({
 household_id: householdId,
 name: cmd.item,
 normalized_name: normalized,
 quantity,
 unit: cmd.unit,
 });
 }
 applied.push(`set ${cmd.item} to ${quantity}${cmd.unit ?""+ cmd.unit :""}`);
 } else {
 // add
 const inc = cmd.quantity ?? 1;
 if (existing) {
 await supabase
 .from("pantry_items")
 .update({ quantity: (existing.quantity ?? 0) + inc, unit: cmd.unit, updated_at: new Date().toISOString() })
 .eq("id", existing.id);
 } else {
 await supabase.from("pantry_items").insert({
 household_id: householdId,
 name: cmd.item,
 normalized_name: normalized,
 quantity: inc,
 unit: cmd.unit,
 });
 }
 applied.push(`added ${inc}${cmd.unit ?""+ cmd.unit :""} ${cmd.item}`);
 }
 }

 return NextResponse.json({ applied, commands });
 } catch (err: any) {
 const msg = err?.message ??"Voice update failed";
 const status = /not a member/i.test(msg) ? 403 : 500;
 return NextResponse.json({ error: msg }, { status });
 }
}
