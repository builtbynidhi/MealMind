"use client";

import { useEffect, useState } from"react";
import { animate, useReducedMotion } from"framer-motion";

// Animated integer count-up. Respects reduced-motion (jumps straight to value).
export function CountUp({ value, className }: { value: number; className?: string }) {
 const [n, setN] = useState(0);
 const reduce = useReducedMotion();

 useEffect(() => {
 if (reduce) {
 setN(value);
 return;
 }
 const controls = animate(0, value, {
 duration: 0.8,
 ease:"easeOut",
 onUpdate: (v) => setN(Math.round(v)),
 });
 return () => controls.stop();
 }, [value, reduce]);

 return <span className={className}>{n}</span>;
}
