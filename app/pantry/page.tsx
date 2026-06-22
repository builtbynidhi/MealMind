import { redirect } from"next/navigation";
import Nav from"@/components/Nav";
import PantryManager from"@/components/PantryManager";
import { getActiveHousehold } from"@/lib/db/queries";
import { createClient } from"@/lib/supabase/server";
import type { PantryItem } from"@/lib/db/types";

export default async function PantryPage() {
 const household = await getActiveHousehold();
 if (!household) redirect("/dashboard");

 const supabase = await createClient();
 const { data: items } = await supabase
 .from("pantry_items")
 .select("*")
 .eq("household_id", household.id)
 .order("name");

 return (
 <>
 <Nav householdName={household.name} />
 <main className="mx-auto max-w-3xl px-4 py-8">
 <h1 className="mb-1 text-2xl font-bold">Pantry</h1>
 <p className="mb-6 text-sm text-ink-700/70">
 Add items by typing or by voice. The grocery list checks against what&apos;s here.
 </p>
 <PantryManager householdId={household.id} initialItems={(items as PantryItem[]) ?? []} />
 </main>
 </>
 );
}
