import { redirect, notFound } from"next/navigation";
import Nav from"@/components/Nav";
import PlanActions from"@/components/PlanActions";
import GroceryList from"@/components/GroceryList";
import { getActiveHousehold } from"@/lib/db/queries";
import { createClient } from"@/lib/supabase/server";
import type { GroceryListItem } from"@/lib/db/types";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MEAL_ORDER = ["breakfast","lunch","dinner","snack"];

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const household = await getActiveHousehold();
 if (!household) redirect("/dashboard");

 const supabase = await createClient();
 const { data: plan } = await supabase
 .from("meal_plans")
 .select("id, week_start, constraints_text")
 .eq("id", id)
 .maybeSingle();
 if (!plan) notFound();

 const { data: entries } = await supabase
 .from("meal_plan_entries")
 .select("day_of_week, meal_type, servings, recipes(id, title, cuisine)")
 .eq("meal_plan_id", id);

 const { data: list } = await supabase
 .from("grocery_lists")
 .select("id")
 .eq("meal_plan_id", id)
 .maybeSingle();

 let groceryItems: GroceryListItem[] = [];
 if (list) {
 const { data } = await supabase
 .from("grocery_list_items")
 .select("*")
 .eq("grocery_list_id", list.id)
 .order("aisle");
 groceryItems = (data as GroceryListItem[]) ?? [];
 }

 const byDay = new Map<number, any[]>();
 for (const e of (entries ?? []) as any[]) {
 const arr = byDay.get(e.day_of_week) ?? [];
 arr.push(e);
 byDay.set(e.day_of_week, arr);
 }

 const isOwner = household.role ==="owner";

 return (
 <>
 <Nav householdName={household.name} />
 <main className="mx-auto max-w-4xl px-4 py-8">
 <h1 className="text-2xl font-bold">Week of {plan.week_start}</h1>
 {plan.constraints_text && (
 <p className="mt-1 text-sm text-ink-700/70">Constraints: {plan.constraints_text}</p>
 )}

 <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {DAYS.map((label, day) => {
 const dayEntries = (byDay.get(day) ?? []).sort(
 (a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type),
 );
 if (dayEntries.length === 0) return null;
 return (
 <div key={day} className="card">
 <h3 className="mb-2 font-semibold">{label}</h3>
 <ul className="space-y-2 text-sm">
 {dayEntries.map((e, i) => (
 <li key={i}>
 <span className="block text-xs uppercase text-ink-700/50">{e.meal_type}</span>
 <span>{e.recipes?.title ??"—"}</span>
 </li>
 ))}
 </ul>
 </div>
 );
 })}
 </div>

 <section className="mt-10">
 <div className="mb-3 flex items-center justify-between">
 <h2 className="text-lg font-semibold">Grocery list</h2>
 {isOwner && <PlanActions mealPlanId={plan.id} hasList={!!list} />}
 </div>
 {list ? (
 <GroceryList items={groceryItems} />
 ) : (
 <p className="text-sm text-ink-700/70">
 No grocery list yet{isOwner ?"— generate one from this plan.":"."}
 </p>
 )}
 </section>
 </main>
 </>
 );
}
