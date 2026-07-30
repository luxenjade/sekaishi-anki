-- User-facing tables for sekaishi-anki
-- Master tables (wh_dates, wh_regions) are defined in supabase.sql — do NOT recreate them here.

-- ============================================================
-- User profiles
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  quiz_mode text not null default 'event_to_year'
    check (quiz_mode in ('year_to_event', 'event_to_year')),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  total_answered integer not null default 0,
  total_correct integer not null default 0,
  streak_current integer not null default 0,
  streak_best integer not null default 0,
  last_played_at date,
  rank_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.field_stats (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete cascade not null,
  field text not null,
  answered integer not null default 0,
  correct integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, field)
);

create table if not exists public.review_items (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete cascade not null,
  question_id bigint references public.wh_dates (id) on delete cascade not null,
  added_at timestamptz not null default now(),
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  unique (user_id, question_id)
);

create table if not exists public.wh_submissions (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  year integer not null,
  year_end integer,
  event text not null,
  description text,
  region text[],
  field text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- updated_at helper
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.wh_dates enable row level security;
alter table public.wh_regions enable row level security;
alter table public.profiles enable row level security;
alter table public.field_stats enable row level security;
alter table public.review_items enable row level security;
alter table public.wh_submissions enable row level security;

-- Public read for existing master data
drop policy if exists "wh_dates_select_all" on public.wh_dates;
create policy "wh_dates_select_all" on public.wh_dates
  for select using (true);

drop policy if exists "wh_regions_select_all" on public.wh_regions;
create policy "wh_regions_select_all" on public.wh_regions
  for select using (true);

-- Profiles: owner only
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- Field stats: owner only
drop policy if exists "field_stats_select_own" on public.field_stats;
create policy "field_stats_select_own" on public.field_stats
  for select using (auth.uid() = user_id);

drop policy if exists "field_stats_insert_own" on public.field_stats;
create policy "field_stats_insert_own" on public.field_stats
  for insert with check (auth.uid() = user_id);

drop policy if exists "field_stats_update_own" on public.field_stats;
create policy "field_stats_update_own" on public.field_stats
  for update using (auth.uid() = user_id);

-- Review items: owner only
drop policy if exists "review_items_select_own" on public.review_items;
create policy "review_items_select_own" on public.review_items
  for select using (auth.uid() = user_id);

drop policy if exists "review_items_insert_own" on public.review_items;
create policy "review_items_insert_own" on public.review_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "review_items_update_own" on public.review_items;
create policy "review_items_update_own" on public.review_items
  for update using (auth.uid() = user_id);

drop policy if exists "review_items_delete_own" on public.review_items;
create policy "review_items_delete_own" on public.review_items
  for delete using (auth.uid() = user_id);

-- Submissions: owner read, authenticated insert
drop policy if exists "wh_submissions_select_own" on public.wh_submissions;
create policy "wh_submissions_select_own" on public.wh_submissions
  for select using (auth.uid() = user_id);

drop policy if exists "wh_submissions_insert_auth" on public.wh_submissions;
create policy "wh_submissions_insert_auth" on public.wh_submissions
  for insert with check (auth.uid() = user_id);

-- Allow authenticated users to delete their own auth record
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user() to authenticated;
