import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uploadPhotos, deletePhoto } from "./photos/actions";
import { PhotoUploadForm } from "./photos/PhotoUploadForm";
import { upsertAfterword } from "./afterwords/actions";
import { AfterwordForm } from "./afterwords/AfterwordForm";

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

  const { data: photoRows } = await supabase
    .from("photos")
    .select("id, storage_path, caption, spot_id, uploaded_by")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });

  const signedUrls = photoRows && photoRows.length > 0
    ? await supabase.storage
        .from("photos")
        .createSignedUrls(
          photoRows.map((photo) => photo.storage_path),
          3600,
        )
    : { data: [] };

  const photos = (photoRows ?? []).map((photo, index) => ({
    ...photo,
    signedUrl: signedUrls.data?.[index]?.signedUrl ?? null,
  }));

  const uploadPhotosAction = uploadPhotos.bind(null, groupId, albumId);

  const { data: afterwordRows } = await supabase
    .from("afterwords")
    .select("id, user_id, content, updated_at, profiles(display_name)")
    .eq("album_id", albumId)
    .order("created_at", { ascending: true });

  const afterwords = (afterwordRows ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    content: row.content as string,
    displayName:
      (row.profiles as unknown as { display_name: string } | null)
        ?.display_name ?? "(不明なユーザー)",
  }));

  const myAfterword = afterwords.find((a) => a.userId === user.id);
  const upsertAfterwordAction = upsertAfterword.bind(null, groupId, albumId);

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

      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          写真
        </h2>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="flex flex-col gap-1.5 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
              >
                {photo.signedUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.signedUrl}
                    alt={photo.caption ?? ""}
                    className="aspect-square w-full object-cover"
                  />
                )}
                {photo.caption && (
                  <p className="px-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {photo.caption}
                  </p>
                )}
                {photo.uploaded_by === user.id && (
                  <form
                    action={deletePhoto.bind(
                      null,
                      groupId,
                      albumId,
                      photo.id,
                      photo.storage_path,
                    )}
                    className="px-2 pb-2"
                  >
                    <button
                      type="submit"
                      className="text-xs text-red-600 underline dark:text-red-400"
                    >
                      削除
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            まだ写真がありません。
          </p>
        )}

        <div className="mt-4">
          <PhotoUploadForm
            action={uploadPhotosAction}
            spots={(spots ?? []).map((spot) => ({
              id: spot.id,
              name: spot.name,
            }))}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          あとがき
        </h2>
        {afterwords.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-2">
            {afterwords.map((afterword) => (
              <li
                key={afterword.id}
                className="rounded-md border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {afterword.displayName}
                </p>
                <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {afterword.content}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            まだあとがきがありません。
          </p>
        )}

        <AfterwordForm
          action={upsertAfterwordAction}
          defaultContent={myAfterword?.content ?? ""}
        />
      </div>
    </div>
  );
}
