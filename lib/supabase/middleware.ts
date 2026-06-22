import { createServerClient } from"@supabase/ssr";
import { NextResponse, type NextRequest } from"next/server";

// Refreshes the auth session on every request and guards the authenticated area.
export async function updateSession(request: NextRequest) {
 let response = NextResponse.next({ request });

 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll() {
 return request.cookies.getAll();
 },
 setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
 cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
 response = NextResponse.next({ request });
 cookiesToSet.forEach(({ name, value, options }) =>
 response.cookies.set(name, value, options),
 );
 },
 },
 },
 );

 const {
 data: { user },
 } = await supabase.auth.getUser();

 const { pathname } = request.nextUrl;
 const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
 const isPublic =
 isAuthRoute ||
 pathname ==="/"||
 pathname.startsWith("/recipes") || // public recipe-maker + recipe detail
 pathname.startsWith("/api/recipes") || // public cook-from / detail / recommend
 pathname.startsWith("/api/cron"); // cron auth is via shared secret, not session

 // Not signed in and trying to reach a protected page → send to login.
 if (!user && !isPublic) {
 const url = request.nextUrl.clone();
 url.pathname ="/login";
 url.searchParams.set("next", pathname);
 return NextResponse.redirect(url);
 }

 // Already signed in and on an auth page → send to the dashboard.
 if (user && isAuthRoute) {
 const url = request.nextUrl.clone();
 url.pathname ="/dashboard";
 return NextResponse.redirect(url);
 }

 return response;
}
