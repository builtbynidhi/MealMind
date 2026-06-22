"use client";

import { Suspense, useState } from"react";
import Link from"next/link";
import { useRouter, useSearchParams } from"next/navigation";
import { createClient } from"@/lib/supabase/client";

function LoginForm() {
 const router = useRouter();
 const params = useSearchParams();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 const supabase = createClient();
 const { error } = await supabase.auth.signInWithPassword({ email, password });
 setLoading(false);
 if (error) return setError(error.message);
 router.push(params.get("next") ??"/dashboard");
 router.refresh();
 }

 return (
 <>
 <Link href="/"className="mb-4 inline-flex items-center gap-2 text-2xl font-extrabold text-ink-900">
 <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-base shadow-glow">🥗</span>
 <span className="font-display">MealMind</span>
 </Link>
 <h1 className="mb-1 text-3xl font-bold text-ink-900">Welcome back</h1>
 <p className="mb-6 text-sm text-ink-700/70">Sign in to save plans, pantry &amp; favourites.</p>
 <form onSubmit={onSubmit} className="card space-y-4">
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
 required
 />
 </div>
 {error && <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{error}</p>}
 <button className="btn-primary w-full"disabled={loading}>
 {loading ?"Signing in…":"Sign in"}
 </button>
 </form>
 <p className="mt-4 text-center text-sm text-ink-700/70">
 No account?{""}
 <Link href="/signup"className="font-medium text-brand-700 hover:underline">
 Create one
 </Link>
 </p>
 </>
 );
}

export default function LoginPage() {
 return (
 <main className="flex min-h-screen items-center justify-center px-4">
 <div className="w-full max-w-md">
 <Suspense fallback={<p className="text-sm text-ink-700/50">Loading…</p>}>
 <LoginForm />
 </Suspense>
 </div>
 </main>
 );
}
