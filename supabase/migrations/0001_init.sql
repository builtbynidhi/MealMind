-- ============================================================================
-- MealMind — initial schema, vector store (pgvector), RAG search, and RLS
-- Run this in Supabase → SQL Editor (or `supabase db push` with the CLI).
-- ============================================================================

create extension if not exists vector;

-- ─── Identity ───────────────────────────────────────────────────────────────
-- Supabase manages auth.users; we extend it with a profile row.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- ─── Households + RBAC ───────────────────────────────────────────────────────
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create type public.household_role as enum ('owner', 'member');

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.household_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Membership checks as SECURITY DEFINER functions so RLS policies on other
-- tables can call them without recursing into household_members' own RLS.
create or replace function public.is_household_member(hid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

create or replace function public.is_household_owner(hid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid() and role = 'owner'
  );
$$;

-- ─── Pantry ──────────────────────────────────────────────────────────────────
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  quantity numeric not null default 0,
  unit text,
  low_stock_threshold numeric,
  updated_at timestamptz not null default now()
);
create index pantry_items_household_idx on public.pantry_items (household_id);

-- ─── Recipe knowledge base (the RAG corpus) ──────────────────────────────────
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  aisle text
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  cuisine text,
  dietary_tags text[] not null default '{}',
  servings int not null default 2,
  instructions text,
  source text,
  created_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity numeric,
  unit text,
  primary key (recipe_id, ingredient_id)
);

-- 384-dim because we embed with bge-small-en-v1.5. (Switch to halfvec(384)
-- + halfvec_cosine_ops if the corpus ever grows large enough to matter.)
create table public.recipe_embeddings (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  chunk_index int not null default 0,
  chunk_text text not null,
  embedding vector(384),
  primary key (recipe_id, chunk_index)
);
create index recipe_embeddings_hnsw_idx
  on public.recipe_embeddings using hnsw (embedding vector_cosine_ops);

-- ─── Meal plans ──────────────────────────────────────────────────────────────
create type public.plan_origin as enum ('user', 'cron');

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  week_start date not null,
  constraints_text text,
  generated_by public.plan_origin not null default 'user',
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create index meal_plans_household_idx on public.meal_plans (household_id);

create table public.meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  meal_type text not null,
  recipe_id uuid references public.recipes(id),
  servings int not null default 2
);
create index meal_plan_entries_plan_idx on public.meal_plan_entries (meal_plan_id);

-- ─── Grocery lists ───────────────────────────────────────────────────────────
create table public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  generated_at timestamptz not null default now()
);

create table public.grocery_list_items (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid not null references public.grocery_lists(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id),
  name text not null,
  quantity numeric,
  unit text,
  aisle text,
  is_checked boolean not null default false
);
create index grocery_list_items_list_idx on public.grocery_list_items (grocery_list_id);

-- ─── In-app notifications + cron observability ──────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  type text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_household_idx on public.notifications (household_id);

create table public.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  detail jsonb
);

-- ─── RAG retrieval function ──────────────────────────────────────────────────
-- Cosine similarity search over recipe embeddings, with optional dietary-tag
-- filtering and allergen/ingredient exclusion. Called by lib/rag.
create or replace function public.match_recipes(
  query_embedding vector(384),
  match_count int default 10,
  include_tags text[] default null,
  exclude_ingredient_names text[] default null
)
returns table (recipe_id uuid, title text, similarity float)
language sql stable as $$
  select r.id, r.title, 1 - (e.embedding <=> query_embedding) as similarity
  from recipe_embeddings e
  join recipes r on r.id = e.recipe_id
  where (include_tags is null or r.dietary_tags && include_tags)
    and (
      exclude_ingredient_names is null
      or not exists (
        select 1
        from recipe_ingredients ri
        join ingredients i on i.id = ri.ingredient_id
        where ri.recipe_id = r.id
          and i.normalized_name = any (exclude_ingredient_names)
      )
    )
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

-- ─── Atomic "create household + make me owner" RPC ───────────────────────────
-- Avoids a chicken-and-egg RLS problem on first insert.
create or replace function public.create_household(p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into households (name, created_by) values (p_name, auth.uid())
  returning id into new_id;
  insert into household_members (household_id, user_id, role)
  values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.households           enable row level security;
alter table public.household_members    enable row level security;
alter table public.pantry_items         enable row level security;
alter table public.ingredients          enable row level security;
alter table public.recipes              enable row level security;
alter table public.recipe_ingredients   enable row level security;
alter table public.recipe_embeddings    enable row level security;
alter table public.meal_plans           enable row level security;
alter table public.meal_plan_entries    enable row level security;
alter table public.grocery_lists        enable row level security;
alter table public.grocery_list_items   enable row level security;
alter table public.notifications        enable row level security;
alter table public.job_runs             enable row level security;

-- profiles: each user sees/edits only their own
create policy "profiles self select" on public.profiles for select using (id = auth.uid());
create policy "profiles self insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());

-- households: members read; creator inserts; owners update
create policy "household member select" on public.households for select using (public.is_household_member(id));
create policy "household insert" on public.households for insert with check (created_by = auth.uid());
create policy "household owner update" on public.households for update using (public.is_household_owner(id));

-- household_members: members read roster; self-join as first member or owner adds others
create policy "members select" on public.household_members for select using (public.is_household_member(household_id));
create policy "members insert" on public.household_members for insert
  with check (user_id = auth.uid() or public.is_household_owner(household_id));
create policy "members owner update" on public.household_members for update using (public.is_household_owner(household_id));
create policy "members owner delete" on public.household_members for delete using (public.is_household_owner(household_id));

-- pantry: any household member can read + manage (shared chore)
create policy "pantry select" on public.pantry_items for select using (public.is_household_member(household_id));
create policy "pantry write" on public.pantry_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

-- recipe KB: readable by any authenticated user; writes happen via service role (indexer) which bypasses RLS
create policy "recipes select" on public.recipes for select using (auth.role() = 'authenticated');
create policy "ingredients select" on public.ingredients for select using (auth.role() = 'authenticated');
create policy "recipe_ingredients select" on public.recipe_ingredients for select using (auth.role() = 'authenticated');
create policy "recipe_embeddings select" on public.recipe_embeddings for select using (auth.role() = 'authenticated');

-- meal plans: members read; owners write
create policy "plans member select" on public.meal_plans for select using (public.is_household_member(household_id));
create policy "plans owner write" on public.meal_plans for all
  using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

create policy "plan entries member select" on public.meal_plan_entries for select using (
  exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_household_member(p.household_id))
);
create policy "plan entries owner write" on public.meal_plan_entries for all
  using (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_household_owner(p.household_id)))
  with check (exists (select 1 from public.meal_plans p where p.id = meal_plan_id and public.is_household_owner(p.household_id)));

-- grocery: members read + manage (check off items)
create policy "grocery member select" on public.grocery_lists for select using (public.is_household_member(household_id));
create policy "grocery owner write" on public.grocery_lists for all
  using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

create policy "grocery items member select" on public.grocery_list_items for select using (
  exists (select 1 from public.grocery_lists g where g.id = grocery_list_id and public.is_household_member(g.household_id))
);
create policy "grocery items member write" on public.grocery_list_items for all
  using (exists (select 1 from public.grocery_lists g where g.id = grocery_list_id and public.is_household_member(g.household_id)))
  with check (exists (select 1 from public.grocery_lists g where g.id = grocery_list_id and public.is_household_member(g.household_id)));

-- notifications: members read + mark read
create policy "notifications member select" on public.notifications for select using (public.is_household_member(household_id));
create policy "notifications member update" on public.notifications for update using (public.is_household_member(household_id));

-- job_runs: RLS on, no policies → only the service role (cron) can touch it.

-- ─── Auto-create a profile row when a new auth user signs up ─────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
