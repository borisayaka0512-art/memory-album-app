import { NewGroupForm } from "./NewGroupForm";
import { BackLink } from "@/components/ui/BackLink";

export default function NewGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <BackLink href="/groups">← グループ一覧に戻る</BackLink>
        <h1 className="mt-2 text-xl">新しいグループを作る</h1>
      </div>
      <NewGroupForm />
    </div>
  );
}
