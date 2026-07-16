-- あとがき機能のためのRLSポリシー
-- albums/spots/photosと同様、そのアルバムが属するグループのメンバーだけが
-- あとがきを見る・書けるようにする。更新は自分が書いたものだけ。

create policy "afterwords_select_group_member"
  on afterwords for select
  using (public.is_album_visible(album_id, auth.uid()));

create policy "afterwords_insert_group_member"
  on afterwords for insert
  with check (
    public.is_album_visible(album_id, auth.uid())
    and user_id = auth.uid()
  );

create policy "afterwords_update_own"
  on afterwords for update
  using (user_id = auth.uid());
