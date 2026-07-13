-- グループ機能（グループ作成・招待リンク・メンバー管理）のための拡張
--
-- 招待は「招待リンク／コード方式」を採用: groups.invite_code を知っている人だけが
-- そのグループの情報を見て参加できる。招待コードでの検索・参加はSECURITY DEFINER関数
-- 経由にすることで、テーブルのSELECTポリシー自体は緩めずに済むようにしている。

alter table groups
  add column invite_code uuid not null default gen_random_uuid() unique;

-- 「このユーザーはこのグループのメンバーか」を判定する関数。
-- SECURITY DEFINERでRLSをバイパスして判定することで、
-- group_membersテーブル自身を参照するポリシーでの無限再帰を避けている。
create function public.is_group_member(_group_id uuid, _user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from group_members
    where group_id = _group_id and user_id = _user_id
  );
$$;

-- groups: メンバーか作成者だけが見える。作成は誰でも（自分をcreated_byにする場合のみ）。
create policy "groups_select_member"
  on groups for select
  using (public.is_group_member(id, auth.uid()) or created_by = auth.uid());

create policy "groups_insert_self"
  on groups for insert
  with check (created_by = auth.uid());

-- group_members: 同じグループのメンバー同士は互いに見える。
create policy "group_members_select_same_group"
  on group_members for select
  using (public.is_group_member(group_id, auth.uid()));

-- 追加できるのは「すでにそのグループのメンバー（招待する側）」、
-- または「そのグループの作成者が自分自身を最初のメンバーとして追加する」場合のみ。
create policy "group_members_insert"
  on group_members for insert
  with check (
    public.is_group_member(group_id, auth.uid())
    or (
      user_id = auth.uid()
      and exists (select 1 from groups g where g.id = group_id and g.created_by = auth.uid())
    )
  );

create policy "group_members_delete_same_group"
  on group_members for delete
  using (public.is_group_member(group_id, auth.uid()));

-- profiles: 同じグループに所属するメンバー同士は、お互いの表示名が見えるようにする。
create policy "profiles_select_group_members"
  on profiles for select
  using (
    exists (
      select 1 from group_members gm1
      join group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid() and gm2.user_id = profiles.id
    )
  );

-- 招待リンクを開いた人（まだメンバーではない）が、コードだけでグループ名を確認できるようにする関数。
create function public.get_group_preview_by_invite_code(_code uuid)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select id, name from groups where invite_code = _code;
$$;

-- 招待コードでグループに参加する関数。コードが正しい場合のみ、呼び出したユーザーを
-- group_membersに追加する。
create function public.join_group_by_invite_code(_code uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _group_id uuid;
begin
  select id into _group_id from groups where invite_code = _code;

  if _group_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into group_members (group_id, user_id)
  values (_group_id, auth.uid())
  on conflict (group_id, user_id) do nothing;

  return _group_id;
end;
$$;

revoke execute on function public.get_group_preview_by_invite_code(uuid) from public;
grant execute on function public.get_group_preview_by_invite_code(uuid) to authenticated;

revoke execute on function public.join_group_by_invite_code(uuid) from public;
grant execute on function public.join_group_by_invite_code(uuid) to authenticated;
