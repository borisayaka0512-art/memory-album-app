"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

export async function upsertAfterword(
  groupId: string,
  albumId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const content = formData.get("content");

  if (typeof content !== "string" || !content.trim()) {
    return { error: "あとがきを入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("afterwords")
    .select("id")
    .eq("album_id", albumId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("afterwords")
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    : await supabase.from("afterwords").insert({
        album_id: albumId,
        user_id: user.id,
        content: content.trim(),
      });

  if (error) {
    return { error: "あとがきの保存に失敗しました。" };
  }

  redirect(`/groups/${groupId}/albums/${albumId}`);
}
