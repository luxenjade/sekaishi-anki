INSERT INTO
  public.admin_users (user_id)
SELECT
  id
FROM
  auth.users
WHERE
  email = 'あなたのメールアドレス';
