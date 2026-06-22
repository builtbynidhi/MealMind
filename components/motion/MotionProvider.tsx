"use client";

import { MotionConfig } from"framer-motion";

// App-wide motion defaults; respects the user's reduced-motion preference.
export function MotionProvider({ children }: { children: React.ReactNode }) {
 return (
 <MotionConfig reducedMotion="user"transition={{ type:"spring", stiffness: 260, damping: 30 }}>
 {children}
 </MotionConfig>
 );
}
