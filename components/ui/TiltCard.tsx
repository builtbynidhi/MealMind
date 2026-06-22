"use client";

import { useRef } from"react";
import {
 motion,
 useMotionValue,
 useSpring,
 useTransform,
 useMotionTemplate,
 useReducedMotion,
} from"framer-motion";

// Pointer-driven 3D tilt + a glossy spotlight that follows the cursor.
// Reduced-motion → flat (no tilt/glow). Wrap any card content.
export function TiltCard({
 children,
 className ="",
 max = 8,
}: {
 children: React.ReactNode;
 className?: string;
 max?: number;
}) {
 const reduce = useReducedMotion();
 const ref = useRef<HTMLDivElement>(null);
 const mx = useMotionValue(0.5);
 const my = useMotionValue(0.5);
 const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 150, damping: 15 });
 const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 150, damping: 15 });
 const gx = useTransform(mx, (v) =>`${v * 100}%`);
 const gy = useTransform(my, (v) =>`${v * 100}%`);
 const glow = useMotionTemplate`radial-gradient(200px circle at ${gx} ${gy}, rgba(255,255,255,0.28), transparent 60%)`;

 function onMove(e: React.MouseEvent) {
 if (reduce || !ref.current) return;
 const r = ref.current.getBoundingClientRect();
 mx.set((e.clientX - r.left) / r.width);
 my.set((e.clientY - r.top) / r.height);
 }
 function onLeave() {
 mx.set(0.5);
 my.set(0.5);
 }

 return (
 <motion.div
 ref={ref}
 onMouseMove={onMove}
 onMouseLeave={onLeave}
 whileHover={reduce ? undefined : { y: -6 }}
 style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900, transformStyle:"preserve-3d"}}
 className={`relative ${className}`}
 >
 {children}
 {!reduce && (
 <motion.div
 aria-hidden
 className="pointer-events-none absolute inset-0 z-10 rounded-xl2 mix-blend-soft-light"
 style={{ background: glow }}
 />
 )}
 </motion.div>
 );
}
