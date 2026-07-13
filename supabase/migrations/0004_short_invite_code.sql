-- 招待コードをUUID（36文字）から、手入力しやすい8文字の英数字コードに変更する

drop function if exists public.get_group_preview_by_invite_code(uuid);
drop function if exists public.join_group_by_invite_code(uuid);

alter table groups alter column invite_code drop default;
alter table groups alter column invite_code type text using invite_code::text;
alter table groups alter column invite_code set default encode(gen_random_bytes(4), 'hex');

update groups set invite_code = encode(gen_random_bytes(4), 'hex');

create function public.get_group_preview_by_invite_code(_code text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select id, name from groups where invite_code = _code;
$$;

create function public.join_group_by_invite_code(_code text)
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

revoke execute on function public.get_group_preview_by_invite_code(text) from public;
grant execute on function public.get_group_preview_by_invite_code(text) to authenticated;

revoke execute on function public.join_group_by_invite_code(text) from public;
grant execute on function public.join_group_by_invite_code(text) to authenticated;
