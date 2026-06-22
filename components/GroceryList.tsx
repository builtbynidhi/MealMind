"use client";

import { useState } from"react";
import { createClient } from"@/lib/supabase/client";
import type { GroceryListItem } from"@/lib/db/types";

export default function GroceryList({ items: initial }: { items: GroceryListItem[] }) {
 const supabase = createClient();
 const [items, setItems] = useState<GroceryListItem[]>(initial);

 async function toggle(id: string, checked: boolean) {
 setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_checked: checked } : i)));
 await supabase.from("grocery_list_items").update({ is_checked: checked }).eq("id", id);
 }

 if (items.length === 0) {
 return <p className="text-sm text-ink-700/70">Everything you need is already in the pantry. 🎉</p>;
 }

 const byAisle = new Map<string, GroceryListItem[]>();
 for (const it of items) {
 const aisle = it.aisle ??"Other";
 const list = byAisle.get(aisle) ?? [];
 list.push(it);
 byAisle.set(aisle, list);
 }

 return (
 <div className="grid gap-5 sm:grid-cols-2">
 {[...byAisle.entries()].map(([aisle, list]) => (
 <div key={aisle} className="card">
 <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700/70">{aisle}</h3>
 <ul className="space-y-1.5">
 {list.map((it) => (
 <li key={it.id} className="flex items-center gap-2 text-sm">
 <input
 type="checkbox"
 className="h-4 w-4 accent-brand-600"
 checked={it.is_checked}
 onChange={(e) => toggle(it.id, e.target.checked)}
 />
 <span className={it.is_checked ?"text-ink-700/50 line-through":""}>
 {it.quantity != null ?`${it.quantity} ${it.unit ??""}`:""}
 {it.name}
 </span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 );
}
