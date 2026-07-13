import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BookshelfPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id, name")
    .eq("id", groupId)
    .single();

  if (!group) {
    notFound();
  }

  const { data: albums } = await supabase
    .from("albums")
    .select("id, title, travel_date_start, travel_date_end")
    .eq("group_id", groupId)
    .order("travel_date_start", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/groups" className="text-sm text-zinc-500 dark:text-zinc-400">
          ← グループ一覧に戻る
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{group.name}</h1>
          <Link
            href={`/groups/${groupId}/members`}
            className="text-sm text-zinc-500 underline dark:text-zinc-400"
          >
            メンバー管理
          </Link>
        </div>
      </div>

      <Link
        href={`/groups/${groupId}/albums/new`}
        className="rounded-md bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        + 新しいアルバムを作る
      </Link>

      {albums && albums.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {albums.map((album) => (
            <li key={album.id}>
              <Link
                href={`/groups/${groupId}/albums/${album.id}`}
                className="block rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <p className="text-sm font-medium">{album.title}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateRange(album.travel_date_start, album.travel_date_end)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだアルバムがありません。
        </p>
      )}
    </div>
  );
}

function formatDateRange(start: string, end: string | null) {
  if (!end || end === start) {
    return start;
  }
  return `${start} 〜 ${end}`;
}
