-- =====================================================================
-- sekaishi-anki: 統合マイグレーション (スキーマ全面再構築)
--
-- 前提   : データは未運用(空)。auth.users は触らない。
-- 実行先 : Supabase SQL Editor（または supabase db push）
-- 注意   : セクション0は旧オブジェクトを全削除する。
--          新規プロジェクトなら何も消えないだけなので、そのまま実行してよい。
-- =====================================================================


-- =====================================================================
-- 0. 旧オブジェクトの削除
-- =====================================================================
drop trigger if exists on_auth_user_created on auth.users;

drop view if exists public.wh_date_roles cascade;
drop view if exists public.my_chapter_stats cascade;
drop view if exists public.my_tag_stats cascade;

drop table if exists public.user_question_stats cascade;
drop table if exists public.review_items cascade;
drop table if exists public.field_stats cascade;
drop table if exists public.wh_periods cascade;
drop table if exists public.wh_submissions cascade;
drop table if exists public.wh_dates cascade;
drop table if exists public.wh_regions cascade;
drop table if exists public.wh_tags cascade;
drop table if exists public.wh_chapters cascade;
drop table if exists public.admin_users cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();
drop function if exists public.delete_user();
drop function if exists public.delete_own_account();
drop function if exists public.reset_own_stats();
drop function if exists public.record_quiz_result;
drop function if exists public.dismiss_review_item;
drop function if exists public.approve_submission;
drop function if exists public.reject_submission;
drop function if exists public.is_admin();
drop function if exists public.wh_dates_validate_tags();
drop function if exists public.wh_periods_validate();
drop function if exists public.wh_submissions_limit_pending();


-- =====================================================================
-- 1. マスター系: 章 / タグ
-- =====================================================================
create table public.wh_chapters (
  key   text primary key,
  label text not null,
  sort  integer not null default 0
);

insert into public.wh_chapters (key, label, sort) values
  ('ancient-mediterranean', '古代オリエント・地中海世界',               1),
  ('medieval-europe',       '中世ヨーロッパ',                           2),
  ('early-modern-europe',   '近代ヨーロッパ（大航海時代〜ウィーン会議）', 3),
  ('nineteenth-century',    '19世紀の世界（ナショナリズム中心）',        4),
  ('world-wars',            '2つの大戦',                                5),
  ('cold-war',              '冷戦',                                     6),
  ('contemporary',          '現代世界（冷戦後）',                        7),
  ('islam',                 'イスラーム',                               8),
  ('east-asia',             '東アジア（中国・朝鮮・モンゴル）王朝',       9),
  ('south-asia',            '南アジア（インド）王朝',                   10),
  ('southeast-asia',        '東南アジア王朝',                           11),
  ('japan',                 '日本史',                                   12);

create table public.wh_tags (
  key   text primary key,
  label text not null,
  sort  integer not null default 0
);

-- ※ 旧シードの内容に合わせて調整すること（on conflict で重複は無視）
insert into public.wh_tags (key, label, sort) values
  ('france',    'フランス',        1),
  ('britain',   'イギリス',        2),
  ('germany',   'ドイツ',          3),
  ('italy',     'イタリア',        4),
  ('spain',     'スペイン',        5),
  ('russia',    'ロシア',          6),
  ('usa',       'アメリカ',        7),
  ('china',     '中国',            8),
  ('korea',     '朝鮮',            9),
  ('mongol',    'モンゴル',       10),
  ('japan',     '日本',           11),
  ('india',     'インド',         12),
  ('ottoman',   'オスマン帝国',   13),
  ('persia',    'ペルシア',       14),
  ('rome',      'ローマ',         15),
  ('greece',    'ギリシア',       16),
  ('egypt',     'エジプト',       17),
  ('byzantium', 'ビザンツ帝国',   18),
  ('hre',       '神聖ローマ帝国', 19)
on conflict (key) do nothing;


-- =====================================================================
-- 2. ユーザー系: profiles / admin_users
-- =====================================================================
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  username        text,                       -- 重複を許可（signup失敗を避ける）
  avatar_url      text,
  theme           text not null default 'system'
                  check (theme in ('light', 'dark', 'system')),
  total_answered  integer not null default 0 check (total_answered >= 0),
  total_correct   integer not null default 0 check (total_correct >= 0),
  streak_current  integer not null default 0 check (streak_current >= 0),
  streak_best     integer not null default 0 check (streak_best >= 0),
  last_played_at  date,
  rank_points     integer not null default 0 check (rank_points >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (total_correct <= total_answered)
);

create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);


-- =====================================================================
-- 3. 問題系: wh_dates / wh_submissions / wh_periods
-- =====================================================================
create table public.wh_dates (
  id           bigint generated always as identity primary key,
  year         integer not null check (year between -4000 and 2100),  -- 紀元前は負
  event        text    not null check (btrim(event) <> '' and char_length(event) <= 100),
  description  text    check (char_length(description) <= 500),
  chapter      text    not null references public.wh_chapters (key),
  tags         text[]  not null default '{}',
  theme        text    not null
               check (theme in ('politics_war', 'economy_society', 'religion', 'culture_science')),
  wiki_url     text,
  is_published boolean not null default true,
  created_by   uuid    references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 完全一致の重複を防ぐ（同年でも別の出来事は登録可）
create unique index wh_dates_year_event_uidx
  on public.wh_dates (year, lower(btrim(event)));
create index wh_dates_year_idx    on public.wh_dates (year);
create index wh_dates_chapter_idx on public.wh_dates (chapter);
create index wh_dates_tags_idx    on public.wh_dates using gin (tags);

create table public.wh_submissions (
  id            bigint generated always as identity primary key,
  user_id       uuid references public.profiles (id) on delete set null,
  year          integer not null check (year between -4000 and 2100),
  event         text    not null check (btrim(event) <> '' and char_length(event) <= 100),
  description   text    check (char_length(description) <= 500),
  wiki_url      text,
  status        text    not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  reviewed_by   uuid    references public.profiles (id) on delete set null,
  reviewed_at   timestamptz,
  published_id  bigint  references public.wh_dates (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index wh_submissions_status_idx on public.wh_submissions (status, created_at);
create index wh_submissions_user_idx   on public.wh_submissions (user_id);

-- 王朝・国家などの期間。年は持たず、wh_dates の2行（成立/滅亡）を参照する
create table public.wh_periods (
  id             bigint generated always as identity primary key,
  name           text not null check (btrim(name) <> ''),
  kind           text not null check (kind in ('dynasty', 'state', 'era')),
  start_event_id bigint not null unique references public.wh_dates (id) on delete restrict,
  end_event_id   bigint unique references public.wh_dates (id) on delete restrict, -- null = 存続中
  description    text,
  wiki_url       text,
  created_at     timestamptz not null default now(),
  check (end_event_id is null or start_event_id <> end_event_id)
);

-- 「どの問題がどの期間の端か」の逆引き
create view public.wh_date_roles with (security_invoker = true) as
  select start_event_id as event_id, id as period_id, 'start'::text as role
    from public.wh_periods
  union all
  select end_event_id, id, 'end'::text
    from public.wh_periods
   where end_event_id is not null;


-- =====================================================================
-- 4. 成績: user_question_stats（書き込みはRPCのみ）
-- =====================================================================
create table public.user_question_stats (
  user_id          uuid   not null references public.profiles (id) on delete cascade,
  question_id      bigint not null references public.wh_dates (id) on delete cascade,
  attempts         integer not null default 0 check (attempts >= 0),
  correct_count    integer not null default 0 check (correct_count >= 0),
  last_correct     boolean not null,
  last_answered_at timestamptz not null default now(),
  next_review_at   timestamptz,                -- 将来のSRS用
  primary key (user_id, question_id),
  check (correct_count <= attempts)
);

-- 復習キュー（直近で間違えている問題）用
create index user_question_stats_review_idx
  on public.user_question_stats (user_id, last_answered_at)
  where last_correct = false;

-- 章別 / タグ別の自分の成績
create view public.my_chapter_stats with (security_invoker = true) as
  select d.chapter,
         count(*)               as questions,
         sum(s.attempts)        as attempts,
         sum(s.correct_count)   as correct
    from public.user_question_stats s
    join public.wh_dates d on d.id = s.question_id
   where s.user_id = auth.uid()
   group by d.chapter;

create view public.my_tag_stats with (security_invoker = true) as
  select t.tag,
         count(*)               as questions,
         sum(s.attempts)        as attempts,
         sum(s.correct_count)   as correct
    from public.user_question_stats s
    join public.wh_dates d on d.id = s.question_id
   cross join lateral unnest(d.tags) as t(tag)
   where s.user_id = auth.uid()
   group by t.tag;


-- =====================================================================
-- 5. ヘルパー関数 / トリガー
-- =====================================================================
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger wh_dates_updated_at
  before update on public.wh_dates
  for each row execute function public.set_updated_at();

-- サインアップ時に profiles を自動作成
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- tags は wh_tags に存在するキーのみ許可
create function public.wh_dates_validate_tags()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
      from unnest(new.tags) as t(tag)
     where not exists (select 1 from public.wh_tags where key = t.tag)
  ) then
    raise exception 'unknown tag in tags: %', new.tags;
  end if;
  return new;
end;
$$;

create trigger wh_dates_validate_tags
  before insert or update of tags on public.wh_dates
  for each row execute function public.wh_dates_validate_tags();

-- 期間: 成立年 <= 滅亡年
create function public.wh_periods_validate()
returns trigger
language plpgsql
as $$
declare
  v_start integer;
  v_end   integer;
begin
  select year into v_start from public.wh_dates where id = new.start_event_id;
  if new.end_event_id is not null then
    select year into v_end from public.wh_dates where id = new.end_event_id;
    if v_end < v_start then
      raise exception 'period end (%) is earlier than start (%)', v_end, v_start;
    end if;
  end if;
  return new;
end;
$$;

create trigger wh_periods_validate
  before insert or update on public.wh_periods
  for each row execute function public.wh_periods_validate();

-- 提出の乱発防止: 未処理は1人20件まで
create function public.wh_submissions_limit_pending()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.wh_submissions
       where user_id = new.user_id and status = 'pending') >= 20 then
    raise exception 'too many pending submissions';
  end if;
  return new;
end;
$$;

create trigger wh_submissions_limit_pending
  before insert on public.wh_submissions
  for each row execute function public.wh_submissions_limit_pending();


-- =====================================================================
-- 6. RPC（ユーザー向け）
-- =====================================================================

-- 6-1. クイズ結果の記録
--   p_answers: [{"question_id": 123, "is_correct": true}, ...]
--   スコア・連続日数・ランクはサーバー側で計算する（行ロックで競合を防ぐ）
create function public.record_quiz_result(p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_today   date := (now() at time zone 'Asia/Tokyo')::date;
  v_total   integer;
  v_score   integer;
  v_p       public.profiles%rowtype;
  v_streak  integer;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) not between 1 and 200 then
    raise exception 'invalid answers';
  end if;

  -- 公開済みの問題に対する回答だけを数える
  select count(*), count(*) filter (where r.ok)
    into v_total, v_score
    from (
      select (e->>'question_id')::bigint as qid,
             (e->>'is_correct')::boolean as ok
        from jsonb_array_elements(p_answers) as e
    ) r
    join public.wh_dates d on d.id = r.qid and d.is_published;

  if v_total = 0 then
    return;
  end if;

  -- 問題ごとの成績を更新
  with raw as (
    select (e->>'question_id')::bigint as qid,
           (e->>'is_correct')::boolean as ok,
           ord
      from jsonb_array_elements(p_answers) with ordinality as t(e, ord)
  ),
  valid as (
    select r.*
      from raw r
      join public.wh_dates d on d.id = r.qid and d.is_published
  ),
  agg as (
    select qid,
           count(*)                           as n,
           count(*) filter (where ok)         as c,
           (array_agg(ok order by ord desc))[1] as last_ok
      from valid
     group by qid
  )
  insert into public.user_question_stats as s
         (user_id, question_id, attempts, correct_count, last_correct, last_answered_at)
  select v_uid, qid, n, c, last_ok, now()
    from agg
  on conflict (user_id, question_id) do update
     set attempts         = s.attempts + excluded.attempts,
         correct_count    = s.correct_count + excluded.correct_count,
         last_correct     = excluded.last_correct,
         last_answered_at = now();

  -- プロフィール集計
  select * into v_p from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'profile not found';
  end if;

  if v_p.last_played_at = v_today then
    v_streak := v_p.streak_current;
  elsif v_p.last_played_at = v_today - 1 then
    v_streak := v_p.streak_current + 1;
  else
    v_streak := 1;
  end if;

  update public.profiles
     set total_answered = total_answered + v_total,
         total_correct  = total_correct + v_score,
         streak_current = v_streak,
         streak_best    = greatest(streak_best, v_streak),
         last_played_at = v_today,
         rank_points    = rank_points + v_score * 10
   where id = v_uid;
end;
$$;

-- 6-2. 復習キューから手動で外す（= 正解扱いにする）
create function public.dismiss_review_item(p_question_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.user_question_stats
     set last_correct = true
   where user_id = auth.uid()
     and question_id = p_question_id;
$$;

-- 6-3. 学習データのリセット
create function public.reset_own_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  delete from public.user_question_stats where user_id = v_uid;

  update public.profiles
     set total_answered = 0,
         total_correct  = 0,
         streak_current = 0,
         streak_best    = 0,
         last_played_at = null,
         rank_points    = 0
   where id = v_uid;
end;
$$;

-- 6-4. アカウント削除（原子的）
--   承認済みの提出は user_id が null になって残り、未承認の提出は削除する
create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  delete from public.wh_submissions where user_id = v_uid and status = 'pending';
  delete from auth.users where id = v_uid;   -- profiles / stats / admin_users は cascade
end;
$$;


-- =====================================================================
-- 7. RPC（admin向け）
-- =====================================================================

-- 7-1. 承認: wh_dates へ登録し、提出を approved にする（1トランザクション）
--   年・出来事名・説明は承認時に上書きできる。
--   unique 制約に当たった場合は例外（重複）になる。
create function public.approve_submission(
  p_submission_id bigint,
  p_chapter       text,
  p_theme         text,
  p_tags          text[]  default '{}',
  p_year          integer default null,
  p_event         text    default null,
  p_description   text    default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  s    public.wh_submissions%rowtype;
  v_id bigint;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into s from public.wh_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'submission not found';
  end if;
  if s.status <> 'pending' then
    raise exception 'submission already reviewed';
  end if;

  insert into public.wh_dates
         (year, event, description, chapter, tags, theme, wiki_url, created_by)
  values (coalesce(p_year, s.year),
          coalesce(nullif(btrim(p_event), ''), s.event),
          coalesce(p_description, s.description),
          p_chapter,
          coalesce(p_tags, '{}'),
          p_theme,
          s.wiki_url,
          s.user_id)
  returning id into v_id;

  update public.wh_submissions
     set status       = 'approved',
         reviewed_by  = auth.uid(),
         reviewed_at  = now(),
         published_id = v_id
   where id = p_submission_id;

  return v_id;
end;
$$;

-- 7-2. 却下
create function public.reject_submission(p_submission_id bigint, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.wh_submissions
     set status        = 'rejected',
         reviewer_note = p_note,
         reviewed_by   = auth.uid(),
         reviewed_at   = now()
   where id = p_submission_id
     and status = 'pending';

  if not found then
    raise exception 'submission not found or already reviewed';
  end if;
end;
$$;


-- =====================================================================
-- 8. 関数の実行権限
-- =====================================================================
revoke all on function public.record_quiz_result(jsonb)                from public, anon;
revoke all on function public.dismiss_review_item(bigint)              from public, anon;
revoke all on function public.reset_own_stats()                        from public, anon;
revoke all on function public.delete_own_account()                     from public, anon;
revoke all on function public.approve_submission(bigint, text, text, text[], integer, text, text) from public, anon;
revoke all on function public.reject_submission(bigint, text)          from public, anon;

grant execute on function public.record_quiz_result(jsonb)             to authenticated;
grant execute on function public.dismiss_review_item(bigint)           to authenticated;
grant execute on function public.reset_own_stats()                     to authenticated;
grant execute on function public.delete_own_account()                  to authenticated;
grant execute on function public.approve_submission(bigint, text, text, text[], integer, text, text) to authenticated;
grant execute on function public.reject_submission(bigint, text)      to authenticated;

-- RLSのポリシーから呼ばれるため anon にも付与（未ログインなら false を返すだけ）
grant execute on function public.is_admin() to anon, authenticated;


-- =====================================================================
-- 9. Row Level Security
-- =====================================================================
alter table public.wh_chapters         enable row level security;
alter table public.wh_tags             enable row level security;
alter table public.profiles            enable row level security;
alter table public.admin_users         enable row level security;  -- ポリシーなし = 直接アクセス不可
alter table public.wh_dates            enable row level security;
alter table public.wh_submissions      enable row level security;
alter table public.wh_periods          enable row level security;
alter table public.user_question_stats enable row level security;

-- 章 / タグ: 誰でも読める。変更は admin のみ
create policy wh_chapters_select on public.wh_chapters for select using (true);
create policy wh_chapters_admin  on public.wh_chapters for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy wh_tags_select on public.wh_tags for select using (true);
create policy wh_tags_admin  on public.wh_tags for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 問題: 公開済みは誰でも読める。admin は全件。変更は admin のみ
create policy wh_dates_select on public.wh_dates for select
  using (is_published or (select public.is_admin()));
create policy wh_dates_admin_write on public.wh_dates for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 期間: 誰でも読める。変更は admin のみ
create policy wh_periods_select on public.wh_periods for select using (true);
create policy wh_periods_admin  on public.wh_periods for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 提出: 本人 or admin が閲覧。本人は pending のみ挿入。取り下げは本人の pending のみ
create policy wh_submissions_select on public.wh_submissions for select
  using (auth.uid() = user_id or (select public.is_admin()));
create policy wh_submissions_insert on public.wh_submissions for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewer_note is null
    and reviewed_by is null
    and reviewed_at is null
    and published_id is null
  );
create policy wh_submissions_update_admin on public.wh_submissions for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy wh_submissions_delete on public.wh_submissions for delete
  using ((auth.uid() = user_id and status = 'pending') or (select public.is_admin()));

-- プロフィール: 本人のみ。統計列は直接更新させない（列権限で制限）
create policy profiles_select on public.profiles for select using (auth.uid() = id);
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

revoke insert, update on public.profiles from authenticated, anon;
grant  insert (id, username)                              on public.profiles to authenticated;
grant  update (username, avatar_url, theme, updated_at)   on public.profiles to authenticated;

-- 成績: 本人の閲覧のみ。書き込みは RPC 経由（security definer）
create policy user_question_stats_select on public.user_question_stats for select
  using (auth.uid() = user_id);

grant select on public.wh_date_roles, public.my_chapter_stats, public.my_tag_stats to authenticated;


-- =====================================================================
-- 10. 最初の admin を登録（SQL Editor から手動で実行。<> を自分のIDに置換）
-- =====================================================================
-- insert into public.admin_users (user_id) values ('<your-auth-user-uuid>');