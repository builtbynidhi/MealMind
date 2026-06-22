"use client";

import { useMemo, useState } from"react";
import { AnimatePresence, motion } from"framer-motion";
import { normalizeName } from"@/lib/domain/normalize";

export function ChipInput({
 value,
 onChange,
 suggestions = [],
 placeholder ="Type an ingredient and press Enter…",
}: {
 value: string[];
 onChange: (next: string[]) => void;
 suggestions?: string[];
 placeholder?: string;
}) {
 const [text, setText] = useState("");

 const has = useMemo(() => new Set(value.map((v) => normalizeName(v))), [value]);

 function add(raw: string) {
 const clean = raw.trim();
 if (!clean) return;
 const norm = normalizeName(clean);
 if (!norm || has.has(norm)) {
 setText("");
 return;
 }
 onChange([...value, clean.toLowerCase()]);
 setText("");
 }

 function remove(i: number) {
 onChange(value.filter((_, idx) => idx !== i));
 }

 const filtered = useMemo(() => {
 const q = normalizeName(text);
 if (!q) return [];
 return suggestions
 .filter((s) => normalizeName(s).includes(q) && !has.has(normalizeName(s)))
 .slice(0, 6);
 }, [text, suggestions, has]);

 return (
 <div className="relative">
 <div className="flex flex-wrap items-center gap-2 rounded-xl2 border border-ink-900/10 bg-white p-3 shadow-card focus-within:ring-2 focus-within:ring-brand-500/30">
 <AnimatePresence initial={false}>
 {value.map((v, i) => (
 <motion.span
 key={v + i}
 layout
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 className="chip"
 >
 {v}
 <button
 type="button"
 aria-label={`Remove ${v}`}
 onClick={() => remove(i)}
 className="ml-0.5 rounded-full text-brand-700/70 hover:text-brand-900"
 >
 ✕
 </button>
 </motion.span>
 ))}
 </AnimatePresence>
 <input
 value={text}
 onChange={(e) => setText(e.target.value)}
 onKeyDown={(e) => {
 if (e.key ==="Enter"|| e.key ===",") {
 e.preventDefault();
 add(text);
 } else if (e.key ==="Backspace"&& !text && value.length) {
 remove(value.length - 1);
 }
 }}
 placeholder={value.length ?"": placeholder}
 className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
 aria-label="Add ingredient"
 />
 </div>

 {filtered.length > 0 && (
 <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-ink-900/10 bg-white shadow-soft">
 {filtered.map((s) => (
 <button
 key={s}
 type="button"
 onMouseDown={(e) => {
 e.preventDefault();
 add(s);
 }}
 className="block w-full px-4 py-2 text-left text-sm hover:bg-brand-50"
 >
 {s}
 </button>
 ))}
 </div>
 )}
 </div>
 );
}
