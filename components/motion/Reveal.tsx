"use client";

import { motion } from"framer-motion";

// Fade-up on scroll-into-view. Reused across landing sections and result grids.
export function Reveal({
 children,
 delay = 0,
 className,
}: {
 children: React.ReactNode;
 delay?: number;
 className?: string;
}) {
 return (
 <motion.div
 className={className}
 initial={{ opacity: 0, y: 18 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:"-60px"}}
 transition={{ duration: 0.5, delay, ease:"easeOut"}}
 >
 {children}
 </motion.div>
 );
}

// Stagger container + item for grids.
export const staggerParent = {
 hidden: {},
 show: { transition: { staggerChildren: 0.06 } },
};
export const staggerItem = {
 hidden: { opacity: 0, y: 16 },
 show: { opacity: 1, y: 0, transition: { duration: 0.4, ease:"easeOut"} },
};
