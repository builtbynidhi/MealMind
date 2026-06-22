"use client";

import { motion } from"framer-motion";

// Wraps every route; re-mounts on navigation so each page animates in.
export default function Template({ children }: { children: React.ReactNode }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
 >
 {children}
 </motion.div>
 );
}
