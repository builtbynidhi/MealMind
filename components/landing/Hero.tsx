"use client";

import Link from"next/link";
import { useRef } from"react";
import { motion } from"framer-motion";
import { useGSAP } from"@gsap/react";
import gsap from"gsap";
import { recipeArt } from"@/lib/recipes/art";

gsap.registerPlugin(useGSAP);

const fadeUp = {
 hidden: { opacity: 0, y: 14 },
 show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Hero() {
 return (
 <section className="relative overflow-hidden border-b border-ink-900/[0.06]">
 <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"/>
 <div className="section grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
 <div>
 <motion.p custom={0} variants={fadeUp} initial="hidden"animate="show"className="text-sm font-semibold uppercase tracking-widest text-brand-700">
 Smart recipes · zero waste
 </motion.p>
 <motion.h1 custom={1} variants={fadeUp} initial="hidden"animate="show"className="mt-4 text-5xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-6xl">
 Cook with what you{""}
 <span className="text-brand-600">already have</span>.
 </motion.h1>
 <motion.p custom={2} variants={fadeUp} initial="hidden"animate="show"className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
 Enter the ingredients in your kitchen and instantly see recipes you can make right now —
 plus near-misses that need just a few items. Scale portions for any number of people, in
 grams and cups. Indian, Italian, Chinese &amp; more — veg &amp; non-veg.
 </motion.p>
 <motion.div custom={3} variants={fadeUp} initial="hidden"animate="show"className="mt-8 flex flex-wrap gap-3">
 <Link href="/recipes"className="btn-primary px-6 py-3 text-base">Find recipes</Link>
 <Link href="/recipes/browse"className="btn-ghost px-6 py-3 text-base">Browse all recipes</Link>
 </motion.div>
 <motion.p custom={4} variants={fadeUp} initial="hidden"animate="show"className="mt-4 text-sm text-ink-700/60">
 Free to use · no sign-up required
 </motion.p>
 </div>

 <motion.div
 initial={{ opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
 >
 <ProductPreview />
 </motion.div>
 </div>
 </section>
 );
}

const DEMO_HAVE = ["onion","tomato","paneer","ginger"];

// Two groups of 4 — cycle through them on every loop
const DEMO_GROUPS = [
 [
 { name:"Paneer Bhurji", cuisine:"Indian", id:"paneer-bhurji", ready: true, missing: [] },
 { name:"Tomato Egg Stir Fry", cuisine:"Chinese", id:"tomato-egg", ready: true, missing: [] },
 { name:"Ginger Tomato Soup", cuisine:"Continental", id:"ginger-soup", ready: true, missing: [] },
 { name:"Shahi Paneer", cuisine:"Indian", id:"shahi-paneer", ready: false, missing: ["cream","cashew"] },
 ],
 [
 { name:"Tomato Shorba", cuisine:"Indian", id:"tomato-shorba", ready: true, missing: [] },
 { name:"Tomato Basil Pasta", cuisine:"Italian", id:"tomato-pasta", ready: false, missing: ["pasta","basil"] },
 { name:"Paneer Fried Rice", cuisine:"Chinese", id:"paneer-rice", ready: false, missing: ["rice","soy sauce"] },
 { name:"Aloo Tomato Sabzi", cuisine:"Indian", id:"aloo-sabzi", ready: true, missing: [] },
 ],
];

const SCAN_STEPS = ["Checking Indian recipes…","Scanning all cuisines…","Found matches ✓"];

// Per-row DOM refs for direct content swapping
type RowDOMRefs = {
 root: HTMLDivElement | null;
 art: HTMLDivElement | null;
 name: HTMLParagraphElement | null;
 cuisine: HTMLParagraphElement | null;
 badge: HTMLSpanElement | null;
};

function makeRowRefs(): RowDOMRefs { return { root: null, art: null, name: null, cuisine: null, badge: null }; }

function ProductPreview() {
 const containerRef = useRef<HTMLDivElement>(null);
 const chipEls = useRef<(HTMLSpanElement | null)[]>([]);
 const rowRefs = useRef<RowDOMRefs[]>([0,1,2,3].map(makeRowRefs));
 const scanEl = useRef<HTMLParagraphElement>(null);
 const foundEl = useRef<HTMLDivElement>(null);
 const scanTextEl = useRef<HTMLSpanElement>(null);
 const groupIdx = useRef(0);

 // Swap row DOM content to a new group without React re-render
 function applyGroup(idx: number) {
 const group = DEMO_GROUPS[idx];
 rowRefs.current.forEach((refs, i) => {
 const r = group[i];
 if (!r || !refs.root) return;
 const art = recipeArt({ id: r.id, title: r.name, cuisine: r.cuisine });
 if (refs.art) { refs.art.style.background = art.background; refs.art.textContent = art.emoji; }
 if (refs.name) refs.name.textContent = r.name;
 if (refs.cuisine) refs.cuisine.textContent = r.cuisine;
 if (refs.badge) {
 if (r.ready) {
 refs.badge.textContent ="✓ Ready";
 refs.badge.className ="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-600/20";
 } else {
 refs.badge.textContent =`+${r.missing.length} items`;
 refs.badge.className ="shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-bold text-accent-700 ring-1 ring-inset ring-accent-600/20";
 }
 }
 });
 }

 useGSAP(() => {
 const chips = chipEls.current.filter(Boolean) as HTMLSpanElement[];
 const rows = rowRefs.current.map(r => r.root).filter(Boolean) as HTMLDivElement[];

 // Seed initial content
 applyGroup(0);

 const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

 // Reset all elements at the top of every cycle
 tl.set(chips, { scale: 0.5, opacity: 0, y: 0 });
 tl.set(rows, { x: 20, opacity: 0, y: 0 });
 tl.set(scanEl.current, { opacity: 0, y: 4 });
 tl.set(foundEl.current, { opacity: 0, y: 4 });

 // 1. Chips bounce in
 tl.to(chips, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1, ease:"back.out(2.2)"});

 // 2. Scan steps
 SCAN_STEPS.forEach((text, i) => {
 if (i === 0) tl.to(scanEl.current, { opacity: 1, y: 0, duration: 0.25 });
 tl.call(() => { if (scanTextEl.current) scanTextEl.current.textContent = text; });
 tl.to({}, { duration: 0.55 });
 });
 tl.to(scanEl.current, { opacity: 0, y: -4, duration: 0.2 });

 // 3. Found label
 tl.to(foundEl.current, { opacity: 1, y: 0, duration: 0.3 });

 // 4. Rows slide in
 tl.to(rows, { x: 0, opacity: 1, duration: 0.38, stagger: 0.1, ease:"power3.out"},"-=0.1");

 // 5. Hold
 tl.to({}, { duration: 3.6 });

 // 6. Fade rows + found out
 tl.to([foundEl.current, ...rows], { opacity: 0, y: -6, duration: 0.3, stagger: 0.05, ease:"power2.in"});

 // 7. Swap to next group (happens while everything is invisible)
 tl.call(() => {
 groupIdx.current = (groupIdx.current + 1) % DEMO_GROUPS.length;
 applyGroup(groupIdx.current);
 });

 tl.to({}, { duration: 0.2 });

 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, { scope: containerRef });

 // Render 4 placeholder rows — content is swapped by applyGroup()
 const initialGroup = DEMO_GROUPS[0];

 return (
 <div
 ref={containerRef}
 className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)]"
 >
 {/* Ingredient header */}
 <div className="border-b border-ink-900/[0.06] bg-cream-50 px-5 py-4">
 <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-700/50">
 What&apos;s in your kitchen?
 </p>
 <div className="mt-2.5 flex flex-wrap gap-2">
 {DEMO_HAVE.map((item, i) => (
 <span
 key={item}
 ref={(el) => { chipEls.current[i] = el; }}
 className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-600/20"
 >
 {item}
 </span>
 ))}
 </div>
 </div>

 {/* Results body */}
 <div className="px-5 py-4">
 {/* Scanning indicator */}
 <p ref={scanEl} className="mb-3 flex items-center gap-2 text-sm text-ink-700/70">
 <span className="flex gap-0.5">
 {[0,1,2].map((i) => (
 <span key={i} className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500"style={{ animationDelay:`${i * 0.15}s`}} />
 ))}
 </span>
 <span ref={scanTextEl}>Scanning recipes…</span>
 </p>

 {/* Found label */}
 <div ref={foundEl} className="mb-3 flex items-center justify-between">
 <span className="text-sm font-semibold text-ink-800">4 recipes found</span>
 <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
 Indian · Chinese · Italian
 </span>
 </div>

 {/* 4 fixed rows — content swapped per cycle */}
 <div className="space-y-2">
 {initialGroup.map((r, i) => {
 const art = recipeArt({ id: r.id, title: r.name, cuisine: r.cuisine });
 return (
 <div
 key={i}
 ref={(el) => { rowRefs.current[i].root = el; }}
 className="flex items-center gap-3 rounded-xl border border-ink-900/[0.06] bg-cream-50/60 p-2.5"
 >
 <div
 ref={(el) => { rowRefs.current[i].art = el; }}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl shadow-sm"
 style={{ background: art.background }}
 >
 {art.emoji}
 </div>
 <div className="min-w-0 flex-1">
 <p ref={(el) => { rowRefs.current[i].name = el; }} className="truncate text-sm font-semibold text-ink-900">{r.name}</p>
 <p ref={(el) => { rowRefs.current[i].cuisine = el; }} className="truncate text-xs text-ink-700/55">{r.cuisine}</p>
 </div>
 <span
 ref={(el) => { rowRefs.current[i].badge = el; }}
 className={r.ready
 ?"shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-600/20"
 :"shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-bold text-accent-700 ring-1 ring-inset ring-accent-600/20"
 }
 >
 {r.ready ?"✓ Ready":`+${r.missing.length} items`}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
}
