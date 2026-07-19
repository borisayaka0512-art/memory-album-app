import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinButton } from "./JoinButton";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${code}`);
  }

  const { data: groups } = await supabase.rpc(
    "get_group_preview_by_invite_code",
    { _code: code },
  );
  const group = groups?.[0];

  if (!group) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-ink-muted">この招待リンクは無効です。</p>
        <Link href="/groups" className="text-sm text-accent underline">
          グループ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-ink-muted">「{group.name}」に参加しますか？</p>
      <JoinButton code={code} />
    </div>
  );
}
