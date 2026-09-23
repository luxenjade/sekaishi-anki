-- User-facing tables for sekaishi-anki
-- Master tables (wh_dates, wh_regions) are defined in supabase.sql — do NOT recreate them here.
-- ============================================================
-- User profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  quiz_mode text NOT NULL DEFAULT 'event_to_year' CHECK (quiz_mode IN ('year_to_event', 'event_to_year')),
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  total_answered integer NOT NULL DEFAULT 0,
  total_correct integer NOT NULL DEFAULT 0,
  streak_current integer NOT NULL DEFAULT 0,
  streak_best integer NOT NULL DEFAULT 0,
  last_played_at date,
  rank_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.field_stats (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
  field text NOT NULL,
  answered integer NOT NULL DEFAULT 0,
  correct integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, field)
);

CREATE TABLE IF NOT EXISTS public.review_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL,
  question_id bigint REFERENCES public.wh_dates (id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  review_count integer NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz,
  UNIQUE (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.wh_submissions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  YEAR integer NOT NULL,
  year_end integer,
  event text NOT NULL,
  description text,
  region TEXT[],
  field text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user () returns trigger language plpgsql security definer
SET
  search_path = public AS $$
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

DROP TRIGGER if EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();

-- ============================================================
-- updated_at helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at () returns trigger language plpgsql AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER if EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.wh_dates enable ROW level security;

ALTER TABLE public.wh_regions enable ROW level security;

ALTER TABLE public.profiles enable ROW level security;

ALTER TABLE public.field_stats enable ROW level security;

ALTER TABLE public.review_items enable ROW level security;

ALTER TABLE public.wh_submissions enable ROW level security;

-- Public read for existing master data
DROP POLICY if EXISTS "wh_dates_select_all" ON public.wh_dates;

CREATE POLICY "wh_dates_select_all" ON public.wh_dates FOR
SELECT
  USING (TRUE);

DROP POLICY if EXISTS "wh_regions_select_all" ON public.wh_regions;

CREATE POLICY "wh_regions_select_all" ON public.wh_regions FOR
SELECT
  USING (TRUE);

-- Profiles: owner only
DROP POLICY if EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR
SELECT
  USING (auth.uid () = id);

DROP POLICY if EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own" ON public.profiles FOR insert
WITH
  CHECK (auth.uid () = id);

DROP POLICY if EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
  USING (auth.uid () = id);

DROP POLICY if EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_delete_own" ON public.profiles FOR delete USING (auth.uid () = id);

-- Field stats: owner only
DROP POLICY if EXISTS "field_stats_select_own" ON public.field_stats;

CREATE POLICY "field_stats_select_own" ON public.field_stats FOR
SELECT
  USING (auth.uid () = user_id);

DROP POLICY if EXISTS "field_stats_insert_own" ON public.field_stats;

CREATE POLICY "field_stats_insert_own" ON public.field_stats FOR insert
WITH
  CHECK (auth.uid () = user_id);

DROP POLICY if EXISTS "field_stats_update_own" ON public.field_stats;

CREATE POLICY "field_stats_update_own" ON public.field_stats
FOR UPDATE
  USING (auth.uid () = user_id);

-- Review items: owner only
DROP POLICY if EXISTS "review_items_select_own" ON public.review_items;

CREATE POLICY "review_items_select_own" ON public.review_items FOR
SELECT
  USING (auth.uid () = user_id);

DROP POLICY if EXISTS "review_items_insert_own" ON public.review_items;

CREATE POLICY "review_items_insert_own" ON public.review_items FOR insert
WITH
  CHECK (auth.uid () = user_id);

DROP POLICY if EXISTS "review_items_update_own" ON public.review_items;

CREATE POLICY "review_items_update_own" ON public.review_items
FOR UPDATE
  USING (auth.uid () = user_id);

DROP POLICY if EXISTS "review_items_delete_own" ON public.review_items;

CREATE POLICY "review_items_delete_own" ON public.review_items FOR delete USING (auth.uid () = user_id);

-- Submissions: owner read, authenticated insert
DROP POLICY if EXISTS "wh_submissions_select_own" ON public.wh_submissions;

CREATE POLICY "wh_submissions_select_own" ON public.wh_submissions FOR
SELECT
  USING (auth.uid () = user_id);

DROP POLICY if EXISTS "wh_submissions_insert_auth" ON public.wh_submissions;

CREATE POLICY "wh_submissions_insert_auth" ON public.wh_submissions FOR insert
WITH
  CHECK (auth.uid () = user_id);

-- Allow authenticated users to delete their own auth record
CREATE OR REPLACE FUNCTION public.delete_user () returns void language plpgsql security definer
SET
  search_path = public AS $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

GRANT
EXECUTE ON function public.delete_user () TO authenticated;
