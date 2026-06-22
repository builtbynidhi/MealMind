"use client";

import { useEffect, useState } from"react";
import { AnimatePresence, motion, useReducedMotion } from"framer-motion";

const EMOJIS = ["🎉","🥳","🍅","🥕","🧅","✨","🌶️","🧄"];

// A brief confetti-style burst from the top, triggered whenever`trigger`
// changes to a new positive number. Decorative + reduced-motion aware.
export function Celebrate({ trigger }: { trigger: number }) {
 const [burstKey, setBurstKey] = useState(0);
 const reduce = useReducedMotion();

 useEffect(() => {
 if (trigger > 0 && !reduce) setBurstKey((k) => k + 1);
 }, [trigger, reduce]);

 const pieces = Array.from({ length: 14 }, (_, i) => i);

 return (
 <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex justify-center overflow-hidden">
 <AnimatePresence>
 {burstKey > 0 && (
 <motion.div key={burstKey} className="relative h-0 w-full max-w-3xl">
 {pieces.map((i) => {
 const left = (i / pieces.length) * 100;
 const drift = (i % 2 === 0 ? 1 : -1) * (20 + (i * 13) % 60);
 return (
 <motion.span
 key={i}
 className="absolute top-0 text-xl"
 style={{ left:`${left}%`}}
 initial={{ y: -20, opacity: 0, rotate: 0 }}
 animate={{ y: 320, x: drift, opacity: [0, 1, 1, 0], rotate: 360 }}
 transition={{ duration: 1.4, ease:"easeOut", delay: (i % 5) * 0.05 }}
 >
 {EMOJIS[i % EMOJIS.length]}
 </motion.span>
 );
 })}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
