"use client";

import { useEffect, useState } from"react";

// Light/dark toggle. Persists to localStorage; the no-flash script in layout.tsx
// applies the saved/system theme before paint.
export function ThemeToggle() {
 const [dark, setDark] = useState(false);

 useEffect(() => {
 setDark(document.documentElement.classList.contains("dark"));
 }, []);

 function toggle() {
 const next = !document.documentElement.classList.contains("dark");
 document.documentElement.classList.toggle("dark", next);
 try {
 localStorage.setItem("mealmind:theme", next ?"dark":"light");
 } catch {}
 setDark(next);
 }

 return (
 <button
 onClick={toggle}
 aria-label={dark ?"Switch to light mode":"Switch to dark mode"}
 className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 bg-white/70 text-base transition hover:bg-white"
 >
 {dark ?"☀️":"🌙"}
 </button>
 );
}
