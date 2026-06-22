"use client";

import { useState } from"react";
import Link from"next/link";
import { useRouter } from"next/navigation";
import { createClient } from"@/lib/supabase/client";

export default function SignupPage() {
 const router = useRouter();
 const [displayName, setDisplayName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [message, setMessage] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 const supabase = createClient();
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: { display_name: displayName },
 emailRedirectTo:`${location.origin}/auth/callback`,
 },
 });
 setLoading(false);
 if (error) return setError(error.message);
 if (data.session) {
 router.push("/dashboard");
 router.refresh();
 } else {
 setMessage("Check your email to confirm your account, then sign in.");
 }
 }

 return (
 <main className="flex min-h-screen items-center justify-center px-4">
 <div className="w-full max-w-md">
 <Link href="/"className="mb-4 inline-flex items-center gap-2 text-2xl font-extrabold text-ink-900">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base shadow-glow">🥗</span>
 <span className="font-display">MealMind</span>
 </Link>
 <h1 className="mb-1 text-3xl font-bold text-ink-900">Create your account</h1>
 <p className="mb-6 text-sm text-ink-700/70">Save plans, pantry &amp; favourites — free.</p>
 <form onSubmit={onSubmit} className="card space-y-4">
 <div>
 <label className="mb-1 block text-sm font-medium">Name</label>
 <input className="input"value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
 </div>
 <div>
 <label className="mb-1 block text-sm font-medium">Email</label>
 <input className="input"type="email"value={email} onChange={(e) => setEmail(e.target.value)} required />
 </div>
 <div>
 <label className="mb-1 block text-sm font-medium">Password</label>
 <input
 className="input"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 minLength={6}
 required
 />
 </div>
 {error && <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</p>}
 {message && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{message}</p>}
 <button className="btn-primary w-full"disabled={loading}>
 {loading ?"Creating…":"Create account"}
 </button>
 </form>
 <p className="mt-4 text-center text-sm text-ink-700/70">
 Already have an account?{""}
 <Link href="/login"className="font-medium text-brand-700 hover:underline">
 Sign in
 </Link>
 </p>
 </div>
 </main>
 );
}
