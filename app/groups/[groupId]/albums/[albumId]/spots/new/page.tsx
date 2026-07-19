import { createSpot } from "../actions";
import { SpotForm } from "../SpotForm";
import { BackLink } from "@/components/ui/BackLink";

export default async function NewSpotPage({
  params,
}: {
  params: Promise<{ groupId: string; albumId: string }>;
}) {
  const { groupId, albumId } = await params;
  const boundAction = createSpot.bind(null, groupId, albumId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <BackLink href={`/groups/${groupId}/albums/${albumId}`}>
          ← アルバムに戻る
        </BackLink>
        <h1 className="mt-2 text-xl">しおりを追加</h1>
      </div>
      <SpotForm action={boundAction} submitLabel="追加する" />
    </div>
  );
}
