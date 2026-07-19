import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSpot } from "../../actions";
import { SpotForm } from "../../SpotForm";
import { BackLink } from "@/components/ui/BackLink";

export default async function EditSpotPage({
  params,
}: {
  params: Promise<{ groupId: string; albumId: string; spotId: string }>;
}) {
  const { groupId, albumId, spotId } = await params;
  const supabase = await createClient();

  const { data: spot } = await supabase
    .from("spots")
    .select("id, name, visited_date, memo")
    .eq("id", spotId)
    .single();

  if (!spot) {
    notFound();
  }

  const boundAction = updateSpot.bind(null, groupId, albumId, spotId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div>
        <BackLink href={`/groups/${groupId}/albums/${albumId}`}>
          ← アルバムに戻る
        </BackLink>
        <h1 className="mt-2 text-xl">しおりを編集</h1>
      </div>
      <SpotForm
        action={boundAction}
        submitLabel="保存する"
        defaultValues={{
          name: spot.name,
          visitedDate: spot.visited_date,
          memo: spot.memo,
        }}
      />
    </div>
  );
}
