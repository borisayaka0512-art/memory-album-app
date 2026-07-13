import Link from "next/link";
import { NewGroupForm } from "./NewGroupForm";

export default function NewGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <Link href="/groups" className="text-sm text-zinc-500 dark:text-zinc-400">
          ← グループ一覧に戻る
        </Link>
        <h1 className="mt-2 text-xl font-semibold">新しいグループを作る</h1>
      </div>
      <NewGroupForm />
    </div>
  );
}
