import Link from"next/link";
import Nav from"@/components/Nav";
import CreateHousehold from"@/components/CreateHousehold";
import { getActiveHousehold } from"@/lib/db/queries";
import { createClient } from"@/lib/supabase/server";

export default async function Dashboard() {
 const household = await getActiveHousehold();

 if (!household) {
 return (
 <>
 <Nav />
 <main className="mx-auto max-w-5xl px-4 py-10">
 <h1 className="mb-2 text-2xl font-bold">Welcome 👋</h1>
 <p className="mb-6 max-w-prose text-ink-700/80">
 Create a household to get started. It groups your pantry and meal plans, and you can invite
 members (you&apos;ll be the owner).
 </p>
 <CreateHousehold />
 </main>
 </>
 );
 }

 const supabase = await createClient();
 const [{ data: latestPlan }, { data: notifications }, { count: pantryCount }] = await Promise.all([
 supabase
 .from("meal_plans")
 .select("id, week_start")
 .eq("household_id", household.id)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle(),
 supabase
 .from("notifications")
 .select("id, body, created_at")
 .eq("household_id", household.id)
 .order("created_at", { ascending: false })
 .limit(5),
 supabase
 .from("pantry_items")
 .select("id", { count:"exact", head: true })
 .eq("household_id", household.id),
 ]);

 return (
 <>
 <Nav householdName={household.name} />
 <main className="mx-auto max-w-5xl px-4 py-8">
 <h1 className="mb-6 text-2xl font-bold">{household.name}</h1>

 <div className="grid gap-4 sm:grid-cols-3">
 <Link href="/pantry"className="card hover:border-brand-300">
 <p className="text-sm text-ink-700/60">Pantry</p>
 <p className="mt-1 text-2xl font-semibold">{pantryCount ?? 0} items</p>
 <p className="mt-2 text-sm text-brand-600">Manage →</p>
 </Link>
 <Link href="/plans"className="card hover:border-brand-300">
 <p className="text-sm text-ink-700/60">This week&apos;s plan</p>
 <p className="mt-1 text-2xl font-semibold">{latestPlan ? latestPlan.week_start :"None yet"}</p>
 <p className="mt-2 text-sm text-brand-600">{latestPlan ?"View →":"Generate →"}</p>
 </Link>
 <div className="card">
 <p className="text-sm text-ink-700/60">Your role</p>
 <p className="mt-1 text-2xl font-semibold capitalize">{household.role}</p>
 <p className="mt-2 text-sm text-ink-700/50">
 {household.role ==="owner"?"Can generate plans":"Can view & suggest"}
 </p>
 </div>
 </div>

 <section className="mt-8">
 <h2 className="mb-3 text-lg font-semibold">Notifications</h2>
 {notifications && notifications.length > 0 ? (
 <ul className="space-y-2">
 {notifications.map((n) => (
 <li key={n.id} className="card py-3 text-sm">
 {n.body}
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-ink-700/60">Nothing yet — low-stock and plan-ready alerts show up here.</p>
 )}
 </section>
 </main>
 </>
 );
}
