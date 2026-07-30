create table public.wh_dates (
id bigint generated always as identity not null,
year integer null,
date_type text not null default 'year'::text,
full_date date null,
event text not null,
description text null,
region text[] null default '{}'::text[],
field text null,
memo text null,
wiki_score smallint null,
created_at timestamp with time zone null default now(),
updated_at timestamp with time zone null default now(),
year_end integer null,
record_type text not null default 'event'::text,
wiki_url text null,
constraint wh_dates_pkey primary key (id),
constraint wh_dates_date_type_check check (
(
date_type = any (array['year'::text, 'full'::text, 'circa'::text])
)
),
constraint wh_dates_field_check check (
(
field = any (
array[
'政治'::text,
'経済'::text,
'文化・宗教'::text,
'社会'::text,
'外交・戦争'::text
]
)
)
),
constraint wh_dates_record_type_check check (
(
record_type = any (
array['event'::text, 'period'::text, 'person'::text]
)
)
),
constraint wh_dates_wiki_score_check check (
(
(wiki_score >= 1)
and (wiki_score <= 5)
)
)
) TABLESPACE pg_default;

create table public.wh_regions (
  key text not null,
  label text not null,
  sort integer null default 0,
  constraint wh_regions_pkey primary key (key)
) TABLESPACE pg_default;