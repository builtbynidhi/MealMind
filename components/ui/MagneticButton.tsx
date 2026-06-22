"use client";

import Link from"next/link";
import { useRef } from"react";
import { motion, useMotionValue, useSpring, useReducedMotion } from"framer-motion";

// A button/link that subtly leans toward the cursor on hover (magnetic effect).
// Reduced-motion → no movement. Pass`href`for a link, or`onClick`for a button.
export function MagneticButton({
 href,
 onClick,
 children,
 className ="",
}: {
 href?: string;
 onClick?: () => void;
 children: React.ReactNode;
 className?: string;
}) {
 const reduce = useReducedMotion();
 const ref = useRef<HTMLDivElement>(null);
 const x = useMotionValue(0);
 const y = useMotionValue(0);
 const sx = useSpring(x, { stiffness: 200, damping: 12 });
 const sy = useSpring(y, { stiffness: 200, damping: 12 });

 function move(e: React.MouseEvent) {
 if (reduce || !ref.current) return;
 const r = ref.current.getBoundingClientRect();
 x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
 y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
 }
 function leave() {
 x.set(0);
 y.set(0);
 }

 return (
 <motion.div
 ref={ref}
 onMouseMove={move}
 onMouseLeave={leave}
 style={reduce ? undefined : { x: sx, y: sy }}
 className="inline-block"
 >
 {href ? (
 <Link href={href} className={className}>
 {children}
 </Link>
 ) : (
 <button onClick={onClick} className={className}>
 {children}
 </button>
 )}
 </motion.div>
 );
}
