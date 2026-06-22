import { redirect } from"next/navigation";
import Link from"next/link";
import Nav from"@/components/Nav";
import GeneratePlan from"@/components/GeneratePlan";
import { getActiveHousehold } from"@/lib/db/queries";
import { createClient } from"@/lib/supabase/server";

export default async function PlansPage() {
 const household = await getActiveHousehold();
 if (!household) redirect("/dashboard");

 const supabase = await createClient();
 const { data: plans } = await supabase
 .from("meal_plans")
 .select("id, week_start, generated_by")
 .eq("household_id", household.id)
 .order("created_at", { ascending: false });

 return (
 <>
 <Nav householdName={household.name} />
 <main className="mx-auto max-w-3xl px-4 py-8">
 <h1 className="mb-6 text-2xl font-bold">Meal plans</h1>

 {household.role ==="owner"? (
 <GeneratePlan householdId={household.id} />
 ) : (
 <p className="card text-sm text-ink-700">Only the household owner can generate plans.</p>
 )}

 <h2 className="mb-3 mt-8 text-lg font-semibold">History</h2>
 {plans && plans.length > 0 ? (
 <ul className="space-y-2">
 {plans.map((p) => (
 <li key={p.id}>
 <Link
 href={`/plans/${p.id}`}
 className="card flex items-center justify-between hover:border-brand-300"
 >
 <span>Week of {p.week_start}</span>
 <span className="text-xs uppercase text-ink-700/50">{p.generated_by}</span>
 </Link>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-ink-700/70">No plans yet — generate your first one above.</p>
 )}
 </main>
 </>
 );
}
