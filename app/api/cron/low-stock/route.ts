import { NextResponse, type NextRequest } from"next/server";
import { createAdminClient } from"@/lib/supabase/admin";
import { env } from"@/lib/env";

export const runtime ="nodejs";

// Nightly low-stock check → one in-app notification per household listing items
// at/under their threshold. Secret-header auth; self-records to job_runs.
export async function POST(request: NextRequest) {
 if (request.headers.get("x-cron-secret") !== env.cronSecret()) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 const admin = createAdminClient();
 const { data: run } = await admin
 .from("job_runs")
 .insert({ job_type:"low-stock", status:"running"})
 .select("id")
 .single();

 // Items with a threshold set, at or below it.
 const { data: lowItems } = await admin
 .from("pantry_items")
 .select("household_id, name, quantity, low_stock_threshold")
 .not("low_stock_threshold","is", null);

 const byHousehold = new Map<string, string[]>();
 for (const item of (lowItems ?? []) as any[]) {
 if (item.low_stock_threshold == null) continue;
 if (Number(item.quantity) <= Number(item.low_stock_threshold)) {
 const list = byHousehold.get(item.household_id) ?? [];
 list.push(item.name);
 byHousehold.set(item.household_id, list);
 }
 }

 let notified = 0;
 for (const [householdId, names] of byHousehold) {
 await admin.from("notifications").insert({
 household_id: householdId,
 type:"low_stock",
 body:`Running low on: ${names.join(",")}.`,
 });
 notified++;
 }

 if (run) {
 await admin
 .from("job_runs")
 .update({ status:"completed", finished_at: new Date().toISOString(), detail: { notified } })
 .eq("id", run.id);
 }

 return NextResponse.json({ ok: true, notified });
}
