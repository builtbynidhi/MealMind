"use client";

import { motion } from"framer-motion";

// Static, CSS-only fallback for mobile / low-end / reduced-motion / loading.
export function HeroPoster() {
 const blobs = [
 { c:"bg-brand-400", x:"20%", y:"30%", s:"h-28 w-28", d: 0 },
 { c:"bg-accent-400", x:"60%", y:"18%", s:"h-20 w-20", d: 0.4 },
 { c:"bg-brand-600", x:"70%", y:"55%", s:"h-24 w-24", d: 0.8 },
 { c:"bg-accent-500", x:"32%", y:"62%", s:"h-16 w-16", d: 1.2 },
 ];
 return (
 <div aria-hidden className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl3">
 <div className="absolute inset-0 bg-hero-radial"/>
 {blobs.map((b, i) => (
 <motion.div
 key={i}
 className={`absolute rounded-full ${b.c} ${b.s} opacity-80 shadow-glow`}
 style={{ left: b.x, top: b.y }}
 animate={{ y: [0, -14, 0] }}
 transition={{ duration: 5, delay: b.d, repeat: Infinity, ease:"easeInOut"}}
 />
 ))}
 <div className="absolute inset-0 flex items-center justify-center text-7xl">🥗</div>
 </div>
 );
}
