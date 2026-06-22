# MealMind — AI Meal Planner & Grocery Automator

Generate personalized weekly meal plans from a plain-English description of your
diet, grounded in a real recipe knowledge base (RAG, so it doesn't invent
recipes), and get an auto-built grocery list grouped by aisle — with **voice**
pantry updates and **scheduled** weekly planning. Built to run **100% free**.

## The stack (all free-forever tiers)

| Concern | Tech |
|---|---|
| Web app + API | Next.js (App Router, TypeScript) |
| DB + Auth + Vector store | Supabase (Postgres + pgvector + GoTrue Auth, RLS) |
| LLM | Google Gemini 2.5 Flash → Groq (Llama 3.3 70B) failover |
| Embeddings | `bge-small-en-v1.5` via Transformers.js — local, $0/call |
| Voice | Browser Web Speech API → server LLM parse |
| Scheduled jobs | cron-job.org / Cloudflare Workers Cron → secret-protected routes |
| Object storage | Cloudflare R2 (optional; for uploads) |
| Hosting | Cloudflare (OpenNext) — commercial-OK & free |

---

## 1. Create the free accounts (only you can do this)

1. **Supabase** → https://supabase.com → new project. From **Project Settings → API** copy:
   - Project URL, `anon` public key, and `service_role` secret key.
2. **Google AI Studio** → https://aistudio.google.com → **Get API key** (free Gemini key).
3. *(Recommended)* **Groq** → https://console.groq.com → API key (free LLM failover).

## 2. Configure & install

```bash
cp .env.example .env.local      # then fill in the keys from step 1
npm install
```

## 3. Create the database

Open Supabase → **SQL Editor**, paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.
This creates every table, the pgvector store, the RAG search function, and all
Row-Level Security policies.

## 4. Seed the recipe knowledge base

```bash
npm run setup    # seeds ~18 recipes, then embeds them locally with bge-small
```

(First run downloads the ~30 MB embedding model once.)

## 5. Run it

```bash
npm run dev      # http://localhost:3000
```

Sign up → create a household → add a few pantry items (type or 🎙 voice) →
**Plans → Generate** with something like *"vegetarian, high protein, no peanuts,
prefer Indian and Mediterranean"* → open the plan → **Generate grocery list**.

---

## Scheduled jobs (free)

Two secret-protected endpoints:

- `POST /api/cron/weekly-plan` — generates next week's plan for each household (Sundays).
- `POST /api/cron/low-stock` — nightly low-stock notifications.

Wire them on [cron-job.org](https://cron-job.org) (or Cloudflare Workers Cron):
set the URL, method `POST`, and add a request header
`x-cron-secret: <your CRON_SECRET from .env.local>`. The routes return `2xx`
immediately and record each run in the `job_runs` table (so a missed run is
always visible in your own DB, not just the scheduler's volatile logs).

## Deploy

- **Cloudflare (recommended, commercial-OK + free):** add `@opennextjs/cloudflare`
  and deploy the Worker/Pages build; set the same env vars as secrets. Heavy work
  (embeddings/LLM) is network I/O, so it stays within Worker limits — but the
  in-process `bge-small` embedder can't run in a Worker, so use **Cloudflare
  Workers AI's BGE model** for query-embedding in that target (same 384-dim model).
- **Netlify Free** — easier Next.js DX, also commercial-OK; good fallback.
- **Render / Fly / Oracle Cloud VM** — use the included `Dockerfile`.
- ⚠️ **Vercel Hobby is non-commercial only** — fine for a private/demo deploy, not a real product.

> Keep at least one cron job hitting the DB weekly so the free Supabase project
> doesn't pause after 7 idle days.

---

## Architecture

```
app/            Next.js routes + UI (auth, dashboard, pantry, plans, grocery)
  api/          route handlers (household, plans/generate, grocery/generate,
                pantry/voice, cron/*)
lib/
  supabase/     browser / server / admin clients + session middleware
  db/           types + RLS-respecting query helpers
  llm/          Gemini→Groq provider, prompts, PII pseudonymizer, injection guard
  rag/          bge-small embeddings + pgvector retrieval
  domain/       pure logic: plan validation, grocery diff, normalization
  plans/        the end-to-end RAG plan-generation pipeline
indexer/        seed-recipes + build-embeddings scripts
supabase/migrations/  schema + RLS + vector search function
```

**RAG flow:** free-text constraints → (PII-scrubbed, injection-guarded) → Gemini
parses filters → pgvector retrieves matching recipes → Gemini assembles a 7-day
plan **using only retrieved recipe IDs** → validator drops any hallucinated ID →
persisted. Grocery list = plan ingredients (scaled by servings) − pantry, grouped by aisle.

## Free-tier fine print (the honest catches)

- **Gemini free tier trains on prompts** → the app pseudonymizes free text before every call; never send raw PII. For a no-training guarantee, enable Cloud Billing (paid) later.
- **Gemini quotas can change / no SLA** → Groq is wired as automatic failover.
- **Supabase Free**: 500 MB DB, pauses after 7 idle days (cron keep-alive handles it), 50k MAU.
- **cron-job.org**: 30 s timeout (routes return fast + work async) and no SLA (runs self-record to `job_runs`).

## Security

- All multi-tenant access is enforced by Postgres **Row-Level Security** (household owner/member).
- The `service_role` key is server-only (indexer + cron); never shipped to the client.
- The dietary-constraint box is treated as untrusted input (prompt-injection guard).
