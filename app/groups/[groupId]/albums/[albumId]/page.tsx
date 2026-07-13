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

  const { data: spots } = await supabase
    .from("spots")
    .select("id, name, visited_date, memo")
    .eq("album_id", albumId)
    .order("order_index", { ascending: true });

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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            しおり
          </h2>
          <Link
            href={`/groups/${groupId}/albums/${albumId}/spots/new`}
            className="text-sm text-zinc-500 underline dark:text-zinc-400"
          >
            + しおりを追加
          </Link>
        </div>
        {spots && spots.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {spots.map((spot) => (
              <li
                key={spot.id}
                className="rounded-md border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{spot.name}</p>
                  <Link
                    href={`/groups/${groupId}/albums/${albumId}/spots/${spot.id}/edit`}
                    className="text-xs text-zinc-500 underline dark:text-zinc-400"
                  >
                    編集
                  </Link>
                </div>
                {spot.visited_date && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {spot.visited_date}
                  </p>
                )}
                {spot.memo && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {spot.memo}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだしおりがありません。
          </p>
        )}
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        写真・あとがきは次のステップで実装予定です。
      </p>
    </div>
  );
}
