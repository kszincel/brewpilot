-- Brewpilot Supabase schema
-- Run this in Supabase SQL editor after creating the project

-- User preferences (extends auth.users)
create table public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  grinder_id text not null default 'fellow-ode-2',
  grinder_custom_name text,
  grinder_min integer,
  grinder_max integer,
  grinder_unit text check (grinder_unit in ('number', 'clicks')),
  default_brew_method text not null default 'v60',
  locale text not null default 'pl' check (locale in ('pl', 'en')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coffee library
create table public.coffees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  roaster text,
  origin text,
  process text,
  roast text,
  notes text[] default '{}',
  grind numeric not null,
  grind_range numeric[] default '{}',
  final_grind numeric,
  brew_temp numeric,
  dose numeric,
  water numeric,
  time_target text,
  brew_method text not null,
  grinder_id text not null,
  reasoning text,
  technique text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Corrections/feedback history per coffee
create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  coffee_id uuid not null references public.coffees(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feedback text not null,
  adjustment numeric not null,
  new_grind numeric not null,
  new_brew_temp numeric,
  diagnosis text,
  tip text,
  updated_technique text,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.user_preferences enable row level security;
alter table public.coffees enable row level security;
alter table public.corrections enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select using (auth.uid() = id);
create policy "Users can insert own preferences"
  on public.user_preferences for insert with check (auth.uid() = id);
create policy "Users can update own preferences"
  on public.user_preferences for update using (auth.uid() = id);

create policy "Users can read own coffees"
  on public.coffees for select using (auth.uid() = user_id);
create policy "Users can insert own coffees"
  on public.coffees for insert with check (auth.uid() = user_id);
create policy "Users can update own coffees"
  on public.coffees for update using (auth.uid() = user_id);
create policy "Users can delete own coffees"
  on public.coffees for delete using (auth.uid() = user_id);

create policy "Users can read own corrections"
  on public.corrections for select using (auth.uid() = user_id);
create policy "Users can insert own corrections"
  on public.corrections for insert with check (auth.uid() = user_id);

-- Indexes
create index idx_coffees_user_id on public.coffees(user_id);
create index idx_corrections_coffee_id on public.corrections(coffee_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger coffees_updated_at
  before update on public.coffees
  for each row execute function update_updated_at();

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function update_updated_at();
