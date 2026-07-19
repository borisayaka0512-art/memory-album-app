import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { JoinByCodeForm } from "./JoinByCodeForm";
import { LinkButton } from "@/components/ui/LinkButton";
import { Card } from "@/components/ui/Card";

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
        <h1 className="text-xl">グループ一覧</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-ink-muted underline hover:text-accent"
          >
            ログアウト
          </button>
        </form>
      </div>

      <LinkButton href="/groups/new">+ 新しいグループを作る</LinkButton>

      <JoinByCodeForm />

      {groups && groups.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/groups/${group.id}`} className="block">
                <Card className="text-sm hover:border-accent">{group.name}</Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">まだグループがありません。</p>
      )}
    </div>
  );
}
