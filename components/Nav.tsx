import { getCurrentUser } from"@/lib/db/queries";
import { NavClient } from"@/components/NavClient";

// Server wrapper: resolves auth state, then renders the client nav. The
//`householdName`prop contract is preserved so existing authed pages need no
// changes (they pass it; public pages omit it).
export default async function Nav({ householdName }: { householdName?: string }) {
 const user = await getCurrentUser();
 return <NavClient authed={!!user} householdName={householdName} />;
}
