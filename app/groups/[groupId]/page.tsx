import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/ui/BackLink";
import { LinkButton } from "@/components/ui/LinkButton";
import { spineColorFor, spineWidthFor, spineHeightFor } from "@/lib/bookColors";

const BOX_FINISH =
  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15)), var(--shelf-wood-dark)";

const BOOKS_PER_SHELF = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

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
    .select("id, title, travel_date_start, travel_date_end, cover_color")
    .eq("group_id", groupId)
    .order("travel_date_start", { ascending: false });

  const shelves = chunk(albums ?? [], BOOKS_PER_SHELF);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <BackLink href="/groups">← グループ一覧に戻る</BackLink>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl">{group.name}</h1>
          <Link
            href={`/groups/${groupId}/members`}
            className="text-sm text-ink-muted underline hover:text-accent"
          >
            メンバー管理
          </Link>
        </div>
      </div>

      <LinkButton href={`/groups/${groupId}/albums/new`}>
        + 新しいアルバムを作る
      </LinkButton>

      {shelves.length > 0 ? (
        <div
          className="rounded-lg p-2 shadow-card"
          style={{ background: BOX_FINISH }}
        >
          <div className="flex flex-col gap-2">
            {shelves.map((shelfAlbums, i) => (
              <div key={i}>
                <div
                  className="flex items-end gap-1 rounded-[2px] p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]"
                  style={{ background: "var(--card)", minHeight: "10.5rem" }}
                >
                  {shelfAlbums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/groups/${groupId}/albums/${album.id}`}
                      title={album.title}
                      className="flex shrink-0 items-center justify-center self-end rounded-[2px] py-2 shadow-[inset_2px_0_0_rgba(255,255,255,0.15),inset_-3px_0_4px_rgba(0,0,0,0.2)] transition hover:-translate-y-1"
                      style={{
                        background: spineColorFor(album.id, album.cover_color),
                        width: spineWidthFor(album.id),
                        height: spineHeightFor(album.id),
                      }}
                    >
                      <div className="flex max-h-full flex-col items-center gap-0.5 overflow-hidden">
                        {[...album.title].slice(0, 9).map((char, i) => (
                          <span
                            key={i}
                            className="text-xs leading-none text-white"
                          >
                            {char}
                          </span>
                        ))}
                        {[...album.title].length > 9 && (
                          <span className="text-xs leading-none text-white">
                            …
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {i < shelves.length - 1 && (
                  <div
                    className="mt-2 h-3 rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)]"
                    style={{ background: BOX_FINISH }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-hairline py-10">
          <p className="text-sm text-ink-muted">
            本棚はまだ空っぽです。最初のアルバムを作りましょう。
          </p>
        </div>
      )}
    </div>
  );
}
