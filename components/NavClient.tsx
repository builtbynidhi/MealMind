"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SignOutButton from "@/components/SignOutButton";

export function NavClient({
  authed,
  householdName,
}: {
  authed: boolean;
  householdName?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="section flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-base shadow-glow">🥗</span>
          <span className="font-display">MealMind</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 md:flex">
          <Link href="/recipes" className="hover:text-brand-700">Recipe Maker</Link>
          <Link href="/recipes/browse" className="hover:text-brand-700">Browse</Link>
          <Link href="/recipes/favorites" className="hover:text-brand-700">Saved</Link>
          {authed ? (
            <>
              <Link href="/dashboard" className="hover:text-brand-700">Dashboard</Link>
              <Link href="/pantry" className="hover:text-brand-700">Pantry</Link>
              <Link href="/plans" className="hover:text-brand-700">Plans</Link>
            </>
          ) : (
            <>
              <Link href="/#how" className="hover:text-brand-700">How it works</Link>
              <Link href="/#features" className="hover:text-brand-700">Features</Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <>
              {householdName && <span className="text-sm text-ink-700/70">{householdName}</span>}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/signup" className="btn-primary">Sign up free</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-lg p-2 text-ink-800"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-6 bg-ink-900" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink-900" />
          <span className="mt-1.5 block h-0.5 w-6 bg-ink-900" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass overflow-hidden md:hidden"
          >
            <div className="section flex flex-col gap-3 py-4 text-sm font-medium">
              <Link href="/recipes" onClick={() => setOpen(false)}>Recipe Maker</Link>
              <Link href="/recipes/browse" onClick={() => setOpen(false)}>Browse</Link>
              <Link href="/recipes/favorites" onClick={() => setOpen(false)}>Saved</Link>
              {authed ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                  <Link href="/pantry" onClick={() => setOpen(false)}>Pantry</Link>
                  <Link href="/plans" onClick={() => setOpen(false)}>Plans</Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
                  <Link href="/signup" className="btn-primary w-full" onClick={() => setOpen(false)}>
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
