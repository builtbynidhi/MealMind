"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";

export default function GeneratePlan({ householdId }: { householdId: string }) {
 const router = useRouter();
 const [constraints, setConstraints] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function generate(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 const res = await fetch("/api/plans/generate", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ householdId, constraints }),
 });
 const j = await res.json().catch(() => ({}));
 setLoading(false);
 if (!res.ok) return setError(j.error ??"Failed to generate plan");
 router.push(`/plans/${j.planId}`);
 }

 return (
 <form onSubmit={generate} className="card space-y-3">
 <label className="block text-sm font-medium">Describe your week — diet, allergies, cuisines, preferences</label>
 <textarea
 className="input min-h-[90px]"
 placeholder="e.g. vegetarian, high protein, no peanuts, prefer Indian and Mediterranean"
 value={constraints}
 onChange={(e) => setConstraints(e.target.value)}
 />
 {error && <p className="text-sm text-red-600">{error}</p>}
 <button className="btn-primary"disabled={loading}>
 {loading ?"Generating plan… (a few seconds)":"Generate 7-day plan"}
 </button>
 </form>
 );
}
