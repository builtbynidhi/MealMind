// Decide whether to mount the heavy 3D hero or fall back to a static poster.
// Conservative: only enable on capable, motion-tolerant, wide-enough devices.
export function canRender3D(): boolean {
 if (typeof window ==="undefined") return false;
 try {
 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
 if (window.innerWidth < 768) return false;
 const cores = (navigator as any).hardwareConcurrency ?? 4;
 if (cores < 4) return false;
 const mem = (navigator as any).deviceMemory;
 if (typeof mem ==="number"&& mem < 4) return false;
 // WebGL probe
 const canvas = document.createElement("canvas");
 const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
 return !!gl;
 } catch {
 return false;
 }
}
