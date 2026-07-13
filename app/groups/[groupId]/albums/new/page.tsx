import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewAlbumForm } from "./NewAlbumForm";

export default async function NewAlbumPage({
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
    .select("id")
    .eq("id", groupId)
    .single();

  if (!group) {
    notFound();
  }

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id, profiles(display_name)")
    .eq("group_id", groupId);

  const members = (memberRows ?? []).map((row) => ({
    userId: row.user_id as string,
    displayName:
      (row.profiles as unknown as { display_name: string } | null)
        ?.display_name ?? "(不明なユーザー)",
  }));

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <Link
          href={`/groups/${groupId}`}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          ← 本棚に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold">新しいアルバムを作る</h1>
      </div>
      <NewAlbumForm groupId={groupId} members={members} currentUserId={user.id} />
    </div>
  );
}
