-- wh_submissions への空文字・過大投稿を防ぐガードレール。
-- クライアント側（SubmitTab.tsx / AuthContext.submitEvent）でも同様の
-- バリデーションを行っているが、直接APIを叩かれるケースに備えて
-- DB側にも同じ制約を置く（多層防御）。
ALTER TABLE public.wh_submissions
ADD CONSTRAINT wh_submissions_event_not_blank CHECK (char_length(trim(event)) > 0);

ALTER TABLE public.wh_submissions
ADD CONSTRAINT wh_submissions_event_max_length CHECK (char_length(event) <= 300);

ALTER TABLE public.wh_submissions
ADD CONSTRAINT wh_submissions_description_max_length CHECK (
  description IS NULL
  OR char_length(description) <= 2000
);
