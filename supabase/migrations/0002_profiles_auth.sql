-- 認証機能のためのprofiles設定
-- 1. サインアップ時にauth.usersへ行が追加されたら、自動でprofilesにも行を作る
-- 2. profilesは「自分の行だけ見える・書ける」というRLSポリシーを設定する
--    （グループのメンバー同士でお互いの名前が見えるようにする範囲拡張は、グループ機能の実装時に行う）

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);
