import { NextResponse, type NextRequest } from"next/server";
import { z } from"zod";
import { createClient } from"@/lib/supabase/server";

const Body = z.object({ name: z.string().min(1).max(80) });

// Create a household and make the caller its owner (atomic SECURITY DEFINER RPC).
export async function POST(request: NextRequest) {
 const supabase = await createClient();
 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return NextResponse.json({ error:"Unauthorized"}, { status: 401 });

 const parsed = Body.safeParse(await request.json().catch(() => null));
 if (!parsed.success) return NextResponse.json({ error:"Invalid body"}, { status: 400 });

 const { data, error } = await supabase.rpc("create_household", { p_name: parsed.data.name });
 if (error) return NextResponse.json({ error: error.message }, { status: 500 });

 return NextResponse.json({ id: data });
}
