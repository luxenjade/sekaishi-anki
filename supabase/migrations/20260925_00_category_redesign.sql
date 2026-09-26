-- カテゴリー再設計（2026-09）
--
-- 変更点:
-- 1. wh_dates / wh_submissions に chapter（新12分類）・tags（国・主体タグ配列）列を追加
-- 2. wh_tags テーブルを新設し、主要な国・主体タグを正規化（表記ゆれ防止）
-- 3. wh_dates.field / wh_submissions.field の CHECK 制約を、日本語ラベルから
--    英語キー（politics_war / economy_society / religion / culture_science）へ移行
--    （既存データがあれば先に値を変換してから制約を付け替える）
-- 4. region 列・wh_regions テーブルは撤去せず残す（chapterと意味が衝突していた
--    問題があるため、アプリ側からは読み書きしなくなる。物理的な DROP は
--    実データへの影響を確認してから別マイグレーションで行うこと）
-- ============================================================
-- 1. wh_dates: chapter / tags 列の追加
-- ============================================================
ALTER TABLE public.wh_dates
ADD COLUMN IF NOT EXISTS chapter text,
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 既存行の暫定バックフィル（あくまで叩き台。region からの機械的な推測なので、
-- 正確な章分類は個別にレビュー・修正すること）。
-- 新規に追加する行は最初から正しい chapter を入れる想定なので、
-- このUPDATEは「今この瞬間に存在する行」にしか効かない。
UPDATE public.wh_dates
SET
  chapter = CASE
    WHEN region @> ARRAY['east-asia'] THEN '東アジア（中国・朝鮮・モンゴル）王朝'
    WHEN region @> ARRAY['south-asia'] THEN '南アジア（インド）王朝'
    WHEN region @> ARRAY['middle-east'] THEN 'イスラーム'
    WHEN region @> ARRAY['europe'] THEN '中世ヨーロッパ'
    ELSE '分類保留（要相談）'
  END
WHERE
  chapter IS NULL;

CREATE INDEX if NOT EXISTS wh_dates_chapter_idx ON public.wh_dates (chapter);

CREATE INDEX if NOT EXISTS wh_dates_tags_idx ON public.wh_dates USING gin (tags);

-- ============================================================
-- 2. wh_tags: 正規化タグテーブル（wh_regions と同じパターン）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wh_tags (
  key text PRIMARY KEY,
  label text NOT NULL,
  sort integer DEFAULT 0
);

ALTER TABLE public.wh_tags enable ROW level security;

DROP POLICY if EXISTS "wh_tags_select_all" ON public.wh_tags;

CREATE POLICY "wh_tags_select_all" ON public.wh_tags FOR
SELECT
  USING (TRUE);

INSERT INTO
  public.wh_tags (key, label, sort)
VALUES
  ('china', '中国', 1),
  ('japan', '日本', 2),
  ('korea', '朝鮮・韓国', 3),
  ('mongolia', 'モンゴル', 4),
  ('india', 'インド', 5),
  ('ottoman', 'オスマン帝国', 6),
  ('persia', 'ペルシア', 7),
  ('egypt', 'エジプト', 8),
  ('greece', 'ギリシア', 9),
  ('rome', 'ローマ', 10),
  ('france', 'フランス', 11),
  ('germany', 'ドイツ', 12),
  ('uk', 'イギリス', 13),
  ('spain', 'スペイン', 14),
  ('portugal', 'ポルトガル', 15),
  ('italy', 'イタリア', 16),
  ('austria', 'オーストリア', 17),
  ('russia', 'ロシア・ソ連', 18),
  ('usa', 'アメリカ合衆国', 19)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. field 制約を英語キーへ移行
-- ============================================================
-- 既存の日本語データを新しい英語キーへ変換
UPDATE public.wh_dates
SET
  field = CASE field
    WHEN '政治' THEN 'politics_war'
    WHEN '外交・戦争' THEN 'politics_war'
    WHEN '経済' THEN 'economy_society'
    WHEN '社会' THEN 'economy_society'
    WHEN '文化・宗教' THEN 'culture_science'
    ELSE field
  END
WHERE
  field IS NOT NULL;

-- 「文化・宗教」は旧分類では1つだったが、新分類では religion と
-- culture_science に分かれる。機械的に culture_science へ寄せたため、
-- 実際には宗教寄りの行を手動で religion に直す必要がある（レビュー要）。
ALTER TABLE public.wh_dates
DROP CONSTRAINT if EXISTS wh_dates_field_check;

ALTER TABLE public.wh_dates
ADD CONSTRAINT wh_dates_field_check CHECK (
  field IS NULL
  OR field = ANY (
    ARRAY[
      'politics_war',
      'economy_society',
      'religion',
      'culture_science'
    ]
  )
);

-- ============================================================
-- 4. wh_submissions: chapter / tags 列の追加、field 制約の移行
-- ============================================================
ALTER TABLE public.wh_submissions
ADD COLUMN IF NOT EXISTS chapter text,
ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.wh_submissions
SET
  field = CASE field
    WHEN '政治' THEN 'politics_war'
    WHEN '外交・戦争' THEN 'politics_war'
    WHEN '経済' THEN 'economy_society'
    WHEN '社会' THEN 'economy_society'
    WHEN '文化・宗教' THEN 'culture_science'
    ELSE field
  END
WHERE
  field IS NOT NULL;

ALTER TABLE public.wh_submissions
DROP CONSTRAINT if EXISTS wh_submissions_field_check;

ALTER TABLE public.wh_submissions
ADD CONSTRAINT wh_submissions_field_check CHECK (
  field IS NULL
  OR field = ANY (
    ARRAY[
      'politics_war',
      'economy_society',
      'religion',
      'culture_science'
    ]
  )
);
