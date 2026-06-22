"use client";

import { useState } from"react";
import { createClient } from"@/lib/supabase/client";
import { normalizeName } from"@/lib/domain/normalize";
import type { PantryItem } from"@/lib/db/types";

export default function PantryManager({
 householdId,
 initialItems,
}: {
 householdId: string;
 initialItems: PantryItem[];
}) {
 const supabase = createClient();
 const [items, setItems] = useState<PantryItem[]>(initialItems);
 const [name, setName] = useState("");
 const [qty, setQty] = useState("1");
 const [unit, setUnit] = useState("");
 const [threshold, setThreshold] = useState("");
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [voiceMsg, setVoiceMsg] = useState<string | null>(null);

 async function refetch() {
 const { data } = await supabase
 .from("pantry_items")
 .select("*")
 .eq("household_id", householdId)
 .order("name");
 setItems((data as PantryItem[]) ?? []);
 }

 async function addItem(e: React.FormEvent) {
 e.preventDefault();
 if (!name.trim()) return;
 setBusy(true);
 setError(null);
 const { error } = await supabase.from("pantry_items").insert({
 household_id: householdId,
 name: name.trim(),
 normalized_name: normalizeName(name),
 quantity: Number(qty) || 0,
 unit: unit.trim() || null,
 low_stock_threshold: threshold ? Number(threshold) : null,
 });
 setBusy(false);
 if (error) return setError(error.message);
 setName("");
 setQty("1");
 setUnit("");
 setThreshold("");
 refetch();
 }

 async function remove(id: string) {
 setItems((prev) => prev.filter((i) => i.id !== id));
 await supabase.from("pantry_items").delete().eq("id", id);
 }

 function startVoice() {
 const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
 if (!SR) {
 setVoiceMsg("Voice input needs a Chromium-based browser (Chrome/Edge). You can still type items.");
 return;
 }
 const rec = new SR();
 rec.lang ="en-US";
 rec.interimResults = false;
 rec.maxAlternatives = 1;
 setVoiceMsg("Listening… say e.g. “add 2 litres of milk”");
 rec.onresult = async (ev: any) => {
 const transcript = ev.results[0][0].transcript as string;
 setVoiceMsg(`Heard: “${transcript}” — updating…`);
 const res = await fetch("/api/pantry/voice", {
 method:"POST",
 headers: {"Content-Type":"application/json"},
 body: JSON.stringify({ householdId, transcript }),
 });
 const j = await res.json().catch(() => ({}));
 if (!res.ok) return setVoiceMsg(j.error ??"Voice update failed");
 setVoiceMsg(j.applied?.length ?`Done: ${j.applied.join(";")}`:`No changes detected from “${transcript}”`);
 refetch();
 };
 rec.onerror = (e: any) => setVoiceMsg(`Voice error: ${e.error}`);
 rec.start();
 }

 return (
 <div className="space-y-6">
 <form onSubmit={addItem} className="card grid grid-cols-2 gap-3 sm:grid-cols-5">
 <input className="input col-span-2"placeholder="Item (e.g. milk)"value={name} onChange={(e) => setName(e.target.value)} />
 <input className="input"type="number"step="any"placeholder="Qty"value={qty} onChange={(e) => setQty(e.target.value)} />
 <input className="input"placeholder="Unit"value={unit} onChange={(e) => setUnit(e.target.value)} />
 <input className="input"type="number"step="any"placeholder="Low at"title="Low-stock threshold"value={threshold} onChange={(e) => setThreshold(e.target.value)} />
 <div className="col-span-2 flex gap-2 sm:col-span-5">
 <button className="btn-primary"disabled={busy}>{busy ?"Adding…":"Add item"}</button>
 <button type="button"className="btn-ghost"onClick={startVoice}>🎙 Add by voice</button>
 </div>
 </form>

 {error && <p className="text-sm text-red-600">{error}</p>}
 {voiceMsg && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{voiceMsg}</p>}

 {items.length === 0 ? (
 <p className="text-sm text-ink-700/70">Your pantry is empty. Add a few staples above.</p>
 ) : (
 <ul className="divide-y divide-ink-900/10 rounded-xl border border-ink-900/10 bg-white">
 {items.map((item) => {
 const low = item.low_stock_threshold != null && item.quantity <= item.low_stock_threshold;
 return (
 <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
 <span>
 <span className="font-medium">{item.name}</span>{""}
 <span className="text-ink-700/70">
 {item.quantity} {item.unit ??""}
 </span>
 {low && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">low</span>}
 </span>
 <button className="text-ink-700/50 hover:text-red-600"onClick={() => remove(item.id)} aria-label="Remove">
 ✕
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </div>
 );
}
