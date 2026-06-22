"use client";

import { useReducedMotion } from"framer-motion";

// A living, drifting gradient-mesh ("aurora") rendered fixed behind all content.
// Pure CSS animation (cheap, GPU-friendly). Reduced-motion → static blobs.
export function AuroraBackground() {
 const reduce = useReducedMotion();
 const anim = reduce ?"":"animate-aurora";

 return (
 <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
 {/* base wash */}
 <div className="absolute inset-0 bg-cream-50"/>
 {/* drifting color blobs */}
 <div className={`absolute -left-[10%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full blur-3xl opacity-50 ${anim}`}
 style={{ background:"radial-gradient(circle at 30% 30%, #22c55e, transparent 60%)", animationDelay:"0s"}} />
 <div className={`absolute right-[-15%] top-[5%] h-[50vmax] w-[50vmax] rounded-full blur-3xl opacity-45 ${anim}`}
 style={{ background:"radial-gradient(circle at 50% 50%, #f97316, transparent 60%)", animationDelay:"-6s"}} />
 <div className={`absolute bottom-[-20%] left-[20%] h-[55vmax] w-[55vmax] rounded-full blur-3xl opacity-40 ${anim}`}
 style={{ background:"radial-gradient(circle at 50% 50%, #14b8a6, transparent 60%)", animationDelay:"-12s"}} />
 <div className={`absolute bottom-[0%] right-[10%] h-[40vmax] w-[40vmax] rounded-full blur-3xl opacity-35 ${anim}`}
 style={{ background:"radial-gradient(circle at 50% 50%, #a78bfa, transparent 60%)", animationDelay:"-18s"}} />
 {/* subtle grain/vignette for depth */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06))]"/>
 </div>
 );
}
