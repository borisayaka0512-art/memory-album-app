import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { JoinByCodeForm } from "./JoinByCodeForm";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">グループ一覧</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-zinc-500 underline dark:text-zinc-400"
          >
            ログアウト
          </button>
        </form>
      </div>

      <Link
        href="/groups/new"
        className="rounded-md bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        + 新しいグループを作る
      </Link>

      <JoinByCodeForm />

      {groups && groups.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block rounded-md border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          まだグループがありません。
        </p>
      )}
    </div>
  );
}
