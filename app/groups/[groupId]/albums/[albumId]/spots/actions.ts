"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

export async function createSpot(
  groupId: string,
  albumId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name");
  const visitedDate = formData.get("visitedDate");
  const memo = formData.get("memo");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "場所名を入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("spots")
    .select("id", { count: "exact", head: true })
    .eq("album_id", albumId);

  const { error } = await supabase.from("spots").insert({
    album_id: albumId,
    name: name.trim(),
    visited_date:
      typeof visitedDate === "string" && visitedDate ? visitedDate : null,
    memo: typeof memo === "string" && memo.trim() ? memo.trim() : null,
    order_index: count ?? 0,
  });

  if (error) {
    return { error: "しおりの追加に失敗しました。" };
  }

  redirect(`/groups/${groupId}/albums/${albumId}`);
}

export async function updateSpot(
  groupId: string,
  albumId: string,
  spotId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name");
  const visitedDate = formData.get("visitedDate");
  const memo = formData.get("memo");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "場所名を入力してください。" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("spots")
    .update({
      name: name.trim(),
      visited_date:
        typeof visitedDate === "string" && visitedDate ? visitedDate : null,
      memo: typeof memo === "string" && memo.trim() ? memo.trim() : null,
    })
    .eq("id", spotId);

  if (error) {
    return { error: "しおりの更新に失敗しました。" };
  }

  redirect(`/groups/${groupId}/albums/${albumId}`);
}
