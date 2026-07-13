-- 本棚・アルバム機能のためのRLSポリシー
-- 「そのアルバムが属するグループのメンバーかどうか」を判定する関数を用意し、
-- albums / album_members のポリシーで使い回す。

create function public.is_album_visible(_album_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from albums a
    where a.id = _album_id and public.is_group_member(a.group_id, _user_id)
  );
$$;

create policy "albums_select_group_member"
  on albums for select
  using (public.is_group_member(group_id, auth.uid()));

create policy "albums_insert_group_member"
  on albums for insert
  with check (public.is_group_member(group_id, auth.uid()) and created_by = auth.uid());

create policy "album_members_select_group_member"
  on album_members for select
  using (public.is_album_visible(album_id, auth.uid()));

create policy "album_members_insert_group_member"
  on album_members for insert
  with check (public.is_album_visible(album_id, auth.uid()));
