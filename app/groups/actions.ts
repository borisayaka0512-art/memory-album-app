"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

export async function createGroup(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "グループ名を入力してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name: name.trim(), created_by: user.id })
    .select("id")
    .single();

  if (groupError || !group) {
    return { error: "グループの作成に失敗しました。" };
  }

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id });

  if (memberError) {
    return { error: "グループの作成に失敗しました。" };
  }

  redirect(`/groups/${group.id}/members`);
}

export async function removeMember(groupId: string, userId: string) {
  const supabase = await createClient();
  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  revalidatePath(`/groups/${groupId}/members`);
}

// 招待リンク全体（https://.../invite/xxxx）が貼り付けられても、
// コードだけが入力されても、どちらでも参加できるようにする。
function extractInviteCode(raw: string): string {
  const trimmed = raw.trim();
  const segments = trimmed.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? trimmed;
}

export async function joinGroupByInviteCode(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawCode = formData.get("code");

  if (typeof rawCode !== "string" || !rawCode.trim()) {
    return { error: "招待コードまたは招待リンクを入力してください。" };
  }

  const code = extractInviteCode(rawCode);

  const supabase = await createClient();
  const { data: groupId, error } = await supabase.rpc(
    "join_group_by_invite_code",
    { _code: code },
  );

  if (error || !groupId) {
    return {
      error: "参加できませんでした。招待リンクが無効になっている可能性があります。",
    };
  }

  redirect(`/groups/${groupId}/members`);
}
