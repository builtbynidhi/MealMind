"use client";

import Link from"next/link";
import { Reveal } from"@/components/motion/Reveal";

const FEATURES = [
  {
    icon: "🍳",
    stat: "500+ recipes",
    title: "Cook from what you have",
    body: "Type onion, tomato, paneer -- instantly see every recipe you can make right now. No substitutions, no guesswork.",
    tag: "Zero waste",
  },
  {
    icon: "🛒",
    stat: "1-3 items away",
    title: "Near-miss recipes + shopping list",
    body: "Almost-there recipes show you exactly what's missing. One tap adds it to your grocery list -- nothing forgotten.",
    tag: "Smart shopping",
  },
  {
    icon: "⚖️",
    stat: "Auto-scales",
    title: "Exact portions for any crowd",
    body: "Cooking for 1 or 12? Every ingredient scales in grams and cups automatically. No mental math, no guessing.",
    tag: "Precise quantities",
  },
  {
    icon: "🌍",
    stat: "8 cuisines",
    title: "Veg, non-veg & every cuisine",
    body: "Indian, Italian, Chinese, Thai, Mexican, Continental and more. Filter by diet -- veg, non-veg, egg, or vegan.",
    tag: "Any diet",
  },
];

const STEPS = [
  {
    n: 1,
    emoji: "🥬",
    title: "Tell us what's in your kitchen",
    body: "Type ingredient names as chips -- onion, tomato, paneer, ginger. Add as many as you have. Takes under 30 seconds.",
    tip: "The more you add, the better your matches.",
  },
  {
    n: 2,
    emoji: "🎛️",
    title: "Set your diet & cuisine preference",
    body: "Choose veg, non-veg, or vegan. Pick a cuisine -- or leave it open to see everything. MealMind ranks by how many ingredients you already have.",
    tip: "Full-match recipes always appear first.",
  },
  {
    n: 3,
    emoji: "🍳",
    title: "Open a recipe & start cooking",
    body: "Pick any recipe, dial in the number of servings, and every quantity updates instantly. Step-by-step instructions, no ads, no clutter.",
    tip: "Print or save for offline use.",
  },
];

const STATS = [
  { value: "500+", label: "Recipes across 8 cuisines" },
  { value: "< 1 min", label: "From fridge to recipe" },
  { value: "0 waste", label: "Cook what you already own" },
  { value: "Free", label: "No account needed to try" },
];

export function FeatureGrid() {
  return (
    <section id="features" className="section py-24">
      {/* Stats bar */}
      <Reveal>
        <div className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-900/10 bg-ink-900/10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center bg-white px-4 py-6 text-center">
              <span className="text-2xl font-bold text-brand-600 sm:text-3xl">{s.value}</span>
              <span className="mt-1 text-xs text-ink-700/60">{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Everything you need. Nothing you don't.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-700/70">
          MealMind is built around one idea -- cook great food with exactly what you have at home.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="card group h-full transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-xl">
                  {f.icon}
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  {f.stat}
                </span>
              </div>
              <h3 className="font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-700/75">{f.body}</p>
              <div className="mt-4 border-t border-ink-900/[0.06] pt-3">
                <span className="text-xs font-medium text-brand-600">✓ {f.tag}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-ink-900/10 bg-cream-100 py-24">
      <div className="section">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            From fridge to plate in 3 steps
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-700/70">
            No sign-up needed. Open MealMind, add your ingredients, start cooking.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="card relative h-full overflow-hidden">
                {/* Step number watermark */}
                <span className="pointer-events-none absolute right-4 top-2 text-7xl font-black text-ink-900/[0.04] select-none">
                  {s.n}
                </span>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
                    {s.n}
                  </div>
                  <span className="text-2xl">{s.emoji}</span>
                </div>
                <h3 className="font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700/75">{s.body}</p>
                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2">
                  <span className="text-xs text-brand-600">💡</span>
                  <span className="text-xs text-brand-700">{s.tip}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const CTA_EMOJIS = [
 { e:"🍅", cls:"top-5 left-10 text-5xl rotate-12 opacity-[0.13]", delay:"0s"},
 { e:"🧅", cls:"top-6 right-20 text-4xl -rotate-6 opacity-[0.10]", delay:"1s"},
 { e:"🌶️", cls:"bottom-5 left-24 text-4xl rotate-6 opacity-[0.11]", delay:"0.5s"},
 { e:"🧀", cls:"bottom-6 right-16 text-5xl -rotate-12 opacity-[0.12]", delay:"1.5s"},
 { e:"🧄", cls:"top-1/2 left-6 text-3xl rotate-3 opacity-[0.08]", delay:"2s"},
 { e:"🫛", cls:"bottom-1/3 right-8 text-3xl -rotate-3 opacity-[0.09]", delay:"0.8s"},
 { e:"🥘", cls:"top-1/3 right-5 text-6xl opacity-[0.07]", delay:"1.3s"},
 { e:"🍋", cls:"bottom-1/4 left-16 text-3xl rotate-12 opacity-[0.09]", delay:"0.3s"},
];

export function CtaBand() {
 return (
 <section className="section py-24">
 <Reveal>
 <div
 className="relative overflow-hidden rounded-2xl px-8 py-20 text-center"
 style={{ background:"linear-gradient(135deg, #14532d 0%, #166534 35%, #18181b 100%)"}}
 >
 {/* Floating food emoji decorations */}
 {CTA_EMOJIS.map(({ e, cls, delay }) => (
 <span
 key={e + cls}
 aria-hidden
 className={`pointer-events-none absolute select-none animate-float ${cls}`}
 style={{ animationDelay: delay }}
 >
 {e}
 </span>
 ))}

 {/* Subtle top glow */}
 <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl"/>

 {/* Content */}
 <div className="relative z-10">
 <span className="mb-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
 Free to use · no card required
 </span>
 <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
 Open your fridge.<br />Start cooking.
 </h2>
 <p className="mx-auto mt-4 max-w-md text-base text-white/65">
 Enter what you have, get recipes in seconds -- no account needed.
 </p>
 <div className="mt-8 flex flex-wrap justify-center gap-3">
 <Link href="/recipes"className="btn bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-400">
 Find recipes →
 </Link>
 <Link href="/signup"className="btn border border-white/25 bg-white/10 px-6 py-3 text-base text-white backdrop-blur-sm hover:bg-white/20">
 Create free account
 </Link>
 </div>
 </div>
 </div>
 </Reveal>
 </section>
 );
}

export function Footer() {
  return (
    <footer className="border-t border-ink-900/10 py-8">
      <div className="section flex items-center justify-center">
        <p className="text-xs text-ink-700/50">© {new Date().getFullYear()} MealMind. Cook with what you have.</p>
      </div>
    </footer>
  );
}
