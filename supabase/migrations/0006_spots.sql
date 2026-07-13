-- しおり機能のためのRLSポリシー
-- albums/album_membersと同様、そのアルバムが属するグループのメンバーだけが
-- しおりを見る・追加する・編集できるようにする。

create policy "spots_select_group_member"
  on spots for select
  using (public.is_album_visible(album_id, auth.uid()));

create policy "spots_insert_group_member"
  on spots for insert
  with check (public.is_album_visible(album_id, auth.uid()));

create policy "spots_update_group_member"
  on spots for update
  using (public.is_album_visible(album_id, auth.uid()));
