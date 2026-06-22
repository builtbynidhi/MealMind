"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";

export default function PlanActions({ mealPlanId, hasList }: { mealPlanId: string; hasList: boolean }) {
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function generate() {
 setLoading(true);
 setError(null);
 const res = await fetch("/api/grocery/generate", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ mealPlanId }),
 });
 setLoading(false);
 if (!res.ok) {
 const j = await res.json().catch(() => ({}));
 return setError(j.error ??"Failed");
 }
 router.refresh();
 }

 return (
 <div className="flex items-center gap-2">
 {error && <span className="text-sm text-red-600">{error}</span>}
 <button className="btn-ghost"onClick={generate} disabled={loading}>
 {loading ?"Building…": hasList ?"Rebuild list":"Generate grocery list"}
 </button>
 </div>
 );
}
