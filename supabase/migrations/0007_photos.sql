-- 写真アップロード機能のためのStorageバケットとRLSポリシー
-- photosテーブル自体にはまだポリシーが無かったため、あわせて追加する。
-- ストレージのパスは `{album_id}/{ファイル名}` の形式とし、
-- 1階層目（album_id）を is_album_visible で判定してアクセス制御する。

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "photos_storage_select_group_member"
  on storage.objects for select
  using (
    bucket_id = 'photos'
    and public.is_album_visible(((storage.foldername(name))[1])::uuid, auth.uid())
  );

create policy "photos_storage_insert_group_member"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and public.is_album_visible(((storage.foldername(name))[1])::uuid, auth.uid())
  );

create policy "photos_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and owner = auth.uid()
  );

create policy "photos_select_group_member"
  on photos for select
  using (public.is_album_visible(album_id, auth.uid()));

create policy "photos_insert_group_member"
  on photos for insert
  with check (
    public.is_album_visible(album_id, auth.uid())
    and uploaded_by = auth.uid()
  );

create policy "photos_delete_own"
  on photos for delete
  using (uploaded_by = auth.uid());
