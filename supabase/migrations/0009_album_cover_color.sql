-- 本棚で表示する本の背表紙の色を、作成時にユーザーが選べるようにする
-- nullの場合は今まで通りalbum.idから自動で色を決める（既存アルバムとの互換性のため）

alter table albums add column cover_color text;
