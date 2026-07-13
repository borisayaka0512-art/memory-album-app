import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ groupId: string; albumId: string }>;
}) {
  const { groupId, albumId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: album } = await supabase
    .from("albums")
    .select("id, title, travel_date_start, travel_date_end")
    .eq("id", albumId)
    .single();

  if (!album) {
    notFound();
  }

  const { data: memberRows } = await supabase
    .from("album_members")
    .select("user_id, profiles(display_name)")
    .eq("album_id", albumId);

  const members = (memberRows ?? []).map((row) => ({
    userId: row.user_id as string,
    displayName:
      (row.profiles as unknown as { display_name: string } | null)
        ?.display_name ?? "(不明なユーザー)",
  }));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link
          href={`/groups/${groupId}`}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          ← 本棚に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{album.title}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {album.travel_date_end && album.travel_date_end !== album.travel_date_start
            ? `${album.travel_date_start} 〜 ${album.travel_date_end}`
            : album.travel_date_start}
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          参加メンバー
        </h2>
        <ul className="flex flex-col gap-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="rounded-md border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
            >
              {member.displayName}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        しおり・写真・あとがきは次のステップで実装予定です。
      </p>
    </div>
  );
}
