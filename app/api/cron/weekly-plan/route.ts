import { NextResponse, type NextRequest } from"next/server";
import { createAdminClient } from"@/lib/supabase/admin";
import { generatePlanForHousehold, upcomingSunday } from"@/lib/plans/generate";
import { env } from"@/lib/env";

export const runtime ="nodejs";
export const maxDuration = 60;

// Triggered weekly (Sunday) by cron-job.org / Cloudflare Workers Cron.
// Auth is a shared secret header, NOT a user session.
// Processes a bounded batch per run and self-records to job_runs (the scheduler's
// own logs are volatile, so the DB is the system of record). For many households,
// move generation behind a queue (the"fire-2xx-then-async"pattern).
export async function POST(request: NextRequest) {
 if (request.headers.get("x-cron-secret") !== env.cronSecret()) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 const admin = createAdminClient();
 const weekStart = upcomingSunday();
 const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);

 const { data: run } = await admin
 .from("job_runs")
 .insert({ job_type:"weekly-plan", status:"running"})
 .select("id")
 .single();

 // Households that don't already have a plan for the upcoming week.
 const { data: households } = await admin.from("households").select("id").limit(limit);

 let created = 0;
 const errors: string[] = [];
 for (const h of households ?? []) {
 try {
 const { data: existing } = await admin
 .from("meal_plans")
 .select("id")
 .eq("household_id", h.id)
 .eq("week_start", weekStart)
 .maybeSingle();
 if (existing) continue;

 await generatePlanForHousehold(admin, {
 householdId: h.id,
 weekStart,
 origin:"cron",
 lite: true, // Flash-Lite for batch
 });
 await admin.from("notifications").insert({
 household_id: h.id,
 type:"plan_ready",
 body:`Your meal plan for the week of ${weekStart} is ready.`,
 });
 created++;
 } catch (err: any) {
 errors.push(`${h.id}: ${err?.message ??"error"}`);
 }
 }

 if (run) {
 await admin
 .from("job_runs")
 .update({
 status: errors.length ?"completed_with_errors":"completed",
 finished_at: new Date().toISOString(),
 detail: { weekStart, created, errors },
 })
 .eq("id", run.id);
 }

 return NextResponse.json({ ok: true, weekStart, created, errors });
}
