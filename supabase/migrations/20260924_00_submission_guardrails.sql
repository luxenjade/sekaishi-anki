-- wh_submissions への空文字・過大投稿を防ぐガードレール。
-- クライアント側（SubmitTab.tsx / AuthContext.submitEvent）でも同様の
-- バリデーションを行っているが、直接APIを叩かれるケースに備えて
-- DB側にも同じ制約を置く（多層防御）。

alter table public.wh_submissions
  add constraint wh_submissions_event_not_blank
  check (char_length(trim(event)) > 0);

alter table public.wh_submissions
  add constraint wh_submissions_event_max_length
  check (char_length(event) <= 300);

alter table public.wh_submissions
  add constraint wh_submissions_description_max_length
  check (description is null or char_length(description) <= 2000);