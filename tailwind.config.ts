import type { Config } from"tailwindcss";

export default {
 content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
 theme: {
 extend: {
 colors: {
 // Fresh herb green — the brand anchor.
 brand: {
 50:"#f0fdf4",
 100:"#dcfce7",
 200:"#bbf7d0",
 300:"#86efac",
 400:"#4ade80",
 500:"#22c55e",
 600:"#16a34a",
 700:"#15803d",
 800:"#166534",
 900:"#14532d",
 },
 // Warm terracotta/amber accent for CTAs and highlights.
 accent: {
 50:"#fff7ed",
 100:"#ffedd5",
 200:"#fed7aa",
 300:"#fdba74",
 400:"#fb923c",
 500:"#f97316",
 600:"#ea580c",
 700:"#c2410c",
 },
 // Clean, professional neutral surfaces + ink (cool zinc).
 cream: {
 50:"#fafafa",
 100:"#f4f4f5",
 200:"#e4e4e7",
 },
 ink: {
 700:"#3f3f46",
 800:"#27272a",
 900:"#18181b",
 },
 },
 fontFamily: {
 sans: ["var(--font-inter)","ui-sans-serif","system-ui","sans-serif"],
 display: ["var(--font-display)","var(--font-inter)","ui-sans-serif","sans-serif"],
 },
 borderRadius: {
 xl2:"1.25rem",
 xl3:"1.75rem",
 },
 boxShadow: {
 soft:"0 8px 30px rgba(28,25,23,0.06)",
 card:"0 4px 24px rgba(28,25,23,0.07)",
 glow:"0 14px 44px -12px rgba(22,163,74,0.45)",
"glow-accent":"0 14px 44px -12px rgba(249,115,22,0.45)",
 },
 backgroundImage: {
"hero-radial":
"radial-gradient(1200px 600px at 70% -10%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(900px 500px at 10% 10%, rgba(249,115,22,0.12), transparent 55%)",
"brand-gradient":"linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)",
"accent-gradient":"linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
 },
 keyframes: {
 float: {
"0%,100%": { transform:"translateY(0)"},
"50%": { transform:"translateY(-10px)"},
 },
"fade-up": {
"0%": { opacity:"0", transform:"translateY(16px)"},
"100%": { opacity:"1", transform:"translateY(0)"},
 },
 shimmer: {
"100%": { transform:"translateX(100%)"},
 },
 aurora: {
"0%": { transform:"translate(0,0) scale(1)"},
"50%": { transform:"translate(4%,6%) scale(1.18)"},
"100%": { transform:"translate(-4%,-3%) scale(1.05)"},
 },
"gradient-x": {
"0%,100%": { backgroundPosition:"0% 50%"},
"50%": { backgroundPosition:"100% 50%"},
 },
 },
 animation: {
 float:"float 6s ease-in-out infinite",
"fade-up":"fade-up 0.6s ease-out both",
 shimmer:"shimmer 1.5s infinite",
 aurora:"aurora 22s ease-in-out infinite alternate",
"gradient-x":"gradient-x 6s ease infinite",
 },
 },
 },
 plugins: [],
} satisfies Config;
