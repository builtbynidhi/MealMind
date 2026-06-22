import { createClient } from"@/lib/supabase/server";
import type { Household, HouseholdMember, HouseholdRole } from"@/lib/db/types";

// Shared, RLS-respecting data access used by Server Components and route handlers.

/** The current authenticated user, or null. */
export async function getCurrentUser() {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();
 return user;
}

/** Households the current user belongs to, with their role. */
export async function getMyHouseholds(): Promise<(Household & { role: HouseholdRole })[]> {
 const supabase = await createClient();
 const { data, error } = await supabase
 .from("household_members")
 .select("role, households(*)")
 .order("joined_at", { ascending: true });

 if (error) throw error;

 return (data ?? []).map((row: any) => ({ ...row.households, role: row.role }));
}

/** The user's"active"household (first one) — null if they have none yet. */
export async function getActiveHousehold(): Promise<(Household & { role: HouseholdRole }) | null> {
 const households = await getMyHouseholds();
 return households[0] ?? null;
}

/** Throws unless the current user has the required role in the household. */
export async function requireRole(householdId: string, role: HouseholdRole) {
 const supabase = await createClient();
 const { data, error } = await supabase
 .from("household_members")
 .select("role")
 .eq("household_id", householdId)
 .maybeSingle<Pick<HouseholdMember,"role">>();

 if (error) throw error;
 if (!data) throw new Error("Not a member of this household");
 if (role ==="owner"&& data.role !=="owner") {
 throw new Error("Owner role required");
 }
 return data.role;
}
