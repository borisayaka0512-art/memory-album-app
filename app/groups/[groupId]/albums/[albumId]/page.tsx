import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uploadPhotos, deletePhoto } from "./photos/actions";
import { PhotoUploadForm } from "./photos/PhotoUploadForm";
import { upsertAfterword } from "./afterwords/actions";
import { AfterwordForm } from "./afterwords/AfterwordForm";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";

type Photo = {
  id: string;
  storage_path: string;
  caption: string | null;
  spot_id: string | null;
  uploaded_by: string;
  signedUrl: string | null;
};

function PhotoStrip({
  photos,
  groupId,
  albumId,
  userId,
}: {
  photos: Photo[];
  groupId: string;
  albumId: string;
  userId: string;
}) {
  if (photos.length === 0) return null;
  return (
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
      {photos.map((photo) => (
        <li
          key={photo.id}
          className="flex w-[calc(50%-0.375rem)] flex-none snap-start flex-col gap-1.5 overflow-hidden rounded-md border border-hairline bg-card shadow-card"
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
            <p className="px-2 text-xs text-ink-muted">{photo.caption}</p>
          )}
          {photo.uploaded_by === userId && (
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
              <button type="submit" className="text-xs text-accent underline">
                削除
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

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

  const userId = user.id;

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

  const photos: Photo[] = (photoRows ?? []).map((photo, index) => ({
    ...photo,
    signedUrl: signedUrls.data?.[index]?.signedUrl ?? null,
  }));

  const photosBySpot = new Map<string, Photo[]>();
  const albumWidePhotos: Photo[] = [];
  for (const photo of photos) {
    if (photo.spot_id) {
      const list = photosBySpot.get(photo.spot_id) ?? [];
      list.push(photo);
      photosBySpot.set(photo.spot_id, list);
    } else {
      albumWidePhotos.push(photo);
    }
  }

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
        <BackLink href={`/groups/${groupId}`}>← 本棚に戻る</BackLink>
        <h1 className="mt-2 text-xl">{album.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {album.travel_date_end && album.travel_date_end !== album.travel_date_start
            ? `${album.travel_date_start} 〜 ${album.travel_date_end}`
            : album.travel_date_start}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">参加メンバー:</span>
        {members.map((member) => (
          <span
            key={member.userId}
            className="rounded-full bg-accent-wash px-2.5 py-0.5 text-ink-muted"
          >
            {member.displayName}
          </span>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-muted">しおり</h2>
          <Link
            href={`/groups/${groupId}/albums/${albumId}/spots/new`}
            className="text-sm text-accent underline"
          >
            + しおりを追加
          </Link>
        </div>
        {spots && spots.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {spots.map((spot) => (
              <li key={spot.id}>
                <Card className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{spot.name}</p>
                    <Link
                      href={`/groups/${groupId}/albums/${albumId}/spots/${spot.id}/edit`}
                      className="text-xs text-ink-muted underline hover:text-accent"
                    >
                      編集
                    </Link>
                  </div>
                  {spot.visited_date && (
                    <p className="mt-1 text-xs text-ink-muted">
                      {spot.visited_date}
                    </p>
                  )}
                  {spot.memo && (
                    <p className="mt-1 text-sm text-ink-muted">{spot.memo}</p>
                  )}
                  <div className="mt-3">
                    <PhotoStrip
                      photos={photosBySpot.get(spot.id) ?? []}
                      groupId={groupId}
                      albumId={albumId}
                      userId={userId}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">まだしおりがありません。</p>
        )}
      </div>

      {albumWidePhotos.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-medium text-ink-muted">
            アルバム全体の写真
          </h2>
          <PhotoStrip
            photos={albumWidePhotos}
            groupId={groupId}
            albumId={albumId}
            userId={userId}
          />
        </div>
      )}

      <PhotoUploadForm
        action={uploadPhotosAction}
        spots={(spots ?? []).map((spot) => ({
          id: spot.id,
          name: spot.name,
        }))}
      />

      <div>
        <h2 className="mb-2 text-sm font-medium text-ink-muted">あとがき</h2>
        {afterwords.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-2">
            {afterwords.map((afterword) => (
              <li key={afterword.id}>
                <Card className="text-sm">
                  <p className="mb-1 text-xs font-medium text-ink-muted">
                    {afterword.displayName}
                  </p>
                  <p className="whitespace-pre-wrap">{afterword.content}</p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-ink-muted">
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
