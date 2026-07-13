import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { removeMember } from "../../actions";
import { InviteLink } from "./InviteLink";

export default async function MembersPage({
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
    .select("id, name, invite_code")
    .eq("id", groupId)
    .single();

  if (!group) {
    notFound();
  }

  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(display_name)")
    .eq("group_id", groupId);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Link href="/groups" className="text-sm text-zinc-500 dark:text-zinc-400">
          ← グループ一覧に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{group.name}</h1>
      </div>

      <InviteLink code={group.invite_code} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メンバー
        </h2>
        <ul className="flex flex-col gap-2">
          {members?.map((member) => (
            <li
              key={member.user_id}
              className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
            >
              <span>
                {(member.profiles as unknown as { display_name: string } | null)
                  ?.display_name ?? "(不明なユーザー)"}
              </span>
              {member.user_id !== user.id && (
                <form action={removeMember.bind(null, groupId, member.user_id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    削除
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
