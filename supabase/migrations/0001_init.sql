-- 思い出アルバムアプリ MVP 初期スキーマ
-- 設計ドキュメント（groups > albums > spots > photos の入れ子構造）に基づく8テーブル
-- RLS（行単位アクセス制御）は認証機能の実装時に別途設定する

-- profiles: Supabase Authのユーザー（auth.users）と1:1で対応するプロフィール情報
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- groups: 友人グループ（本棚の単位）
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- group_members: グループの所属メンバー
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- albums: 旅行の思い出アルバム（本棚に並ぶ「本」）
create table albums (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  title text not null,
  travel_date_start date not null,
  travel_date_end date,
  cover_image_url text,
  created_by uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- album_members: そのアルバム（旅行）に実際に参加したメンバー
create table album_members (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  unique (album_id, user_id)
);

-- spots: しおり（アルバム内の訪問地）
create table spots (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums (id) on delete cascade,
  name text not null,
  visited_date date,
  memo text,
  order_index int not null default 0
);

-- photos: 写真（アルバム直下、またはしおりに紐づく）
create table photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums (id) on delete cascade,
  spot_id uuid references spots (id) on delete set null,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- afterwords: あとがき（本の最後のページ、1人1アルバムにつき1件）
create table afterwords (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique (album_id, user_id)
);
