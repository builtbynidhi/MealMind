"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";

export default function CreateHousehold() {
 const router = useRouter();
 const [name, setName] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function create(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 const res = await fetch("/api/household", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ name }),
 });
 setLoading(false);
 if (!res.ok) {
 const j = await res.json().catch(() => ({}));
 return setError(j.error ??"Failed to create household");
 }
 router.refresh();
 }

 return (
 <form onSubmit={create} className="card max-w-md space-y-4">
 <div>
 <label className="mb-1 block text-sm font-medium">Household name</label>
 <input
 className="input"
 placeholder="e.g. The Singh Kitchen"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 />
 </div>
 {error && <p className="text-sm text-red-600">{error}</p>}
 <button className="btn-primary"disabled={loading}>
 {loading ?"Creating…":"Create household"}
 </button>
 </form>
 );
}
