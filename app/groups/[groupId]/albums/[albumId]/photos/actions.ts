"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

export async function uploadPhotos(
  groupId: string,
  albumId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const spotId = formData.get("spotId");
  const caption = formData.get("caption");

  if (files.length === 0) {
    return { error: "写真を選択してください。" };
  }

  if (files.some((file) => !file.type.startsWith("image/"))) {
    return { error: "画像ファイルのみアップロードできます。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const uploadedPaths: string[] = [];

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : undefined;
    const path = `${albumId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      await supabase.storage.from("photos").remove(uploadedPaths);
      return { error: "写真のアップロードに失敗しました。" };
    }
    uploadedPaths.push(path);

    const { error: insertError } = await supabase.from("photos").insert({
      album_id: albumId,
      spot_id: typeof spotId === "string" && spotId ? spotId : null,
      storage_path: path,
      caption:
        typeof caption === "string" && caption.trim() ? caption.trim() : null,
      uploaded_by: user.id,
    });

    if (insertError) {
      await supabase.storage.from("photos").remove(uploadedPaths);
      return { error: "写真の登録に失敗しました。" };
    }
  }

  redirect(`/groups/${groupId}/albums/${albumId}`);
}

export async function deletePhoto(
  groupId: string,
  albumId: string,
  photoId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("photos").delete().eq("id", photoId);
  await supabase.storage.from("photos").remove([storagePath]);

  redirect(`/groups/${groupId}/albums/${albumId}`);
}
