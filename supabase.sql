CREATE TABLE public.wh_dates (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  YEAR integer NULL,
  date_type text NOT NULL DEFAULT 'year'::text,
  full_date date NULL,
  event text NOT NULL,
  description text NULL,
  region TEXT[] NULL DEFAULT '{}'::TEXT[],
  field text NULL,
  memo text NULL,
  wiki_score smallint NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  year_end integer NULL,
  record_type text NOT NULL DEFAULT 'event'::text,
  wiki_url text NULL,
  CONSTRAINT wh_dates_pkey PRIMARY KEY (id),
  CONSTRAINT wh_dates_date_type_check CHECK (
    (
      date_type = ANY (ARRAY['year'::text, 'full'::text, 'circa'::text])
    )
  ),
  CONSTRAINT wh_dates_field_check CHECK (
    (
      field = ANY (
        ARRAY[
          '政治'::text,
          '経済'::text,
          '文化・宗教'::text,
          '社会'::text,
          '外交・戦争'::text
        ]
      )
    )
  ),
  CONSTRAINT wh_dates_record_type_check CHECK (
    (
      record_type = ANY (
        ARRAY['event'::text, 'period'::text, 'person'::text]
      )
    )
  ),
  CONSTRAINT wh_dates_wiki_score_check CHECK (
    (
      (wiki_score >= 1)
      AND (wiki_score <= 5)
    )
  )
) TABLESPACE pg_default;

CREATE TABLE public.wh_regions (
  key text NOT NULL,
  label text NOT NULL,
  sort integer NULL DEFAULT 0,
  CONSTRAINT wh_regions_pkey PRIMARY KEY (key)
) TABLESPACE pg_default;
