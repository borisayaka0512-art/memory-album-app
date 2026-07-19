"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SPINE_COLORS } from "@/lib/bookColors";

export type FormState = { error?: string } | undefined;

export async function createAlbum(
  groupId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = formData.get("title");
  const travelDateStart = formData.get("travelDateStart");
  const travelDateEnd = formData.get("travelDateEnd");
  const memberIds = formData.getAll("memberIds").filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );
  const coverColor = formData.get("coverColor");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "タイトルを入力してください。" };
  }

  if (typeof travelDateStart !== "string" || !travelDateStart) {
    return { error: "旅行開始日を選択してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: album, error: albumError } = await supabase
    .from("albums")
    .insert({
      group_id: groupId,
      title: title.trim(),
      travel_date_start: travelDateStart,
      travel_date_end:
        typeof travelDateEnd === "string" && travelDateEnd ? travelDateEnd : null,
      cover_color:
        typeof coverColor === "string" &&
        SPINE_COLORS.some((c) => c.value === coverColor)
          ? coverColor
          : null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (albumError || !album) {
    return { error: "アルバムの作成に失敗しました。" };
  }

  const participantIds = Array.from(new Set([user.id, ...memberIds]));

  const { error: memberError } = await supabase.from("album_members").insert(
    participantIds.map((userId) => ({ album_id: album.id, user_id: userId })),
  );

  if (memberError) {
    return { error: "アルバムの作成に失敗しました。" };
  }

  redirect(`/groups/${groupId}/albums/${album.id}`);
}
