"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
} | undefined;

// next はログイン後の遷移先。"/"始まりの相対パス以外は無視する
// （外部サイトへ飛ばされるオープンリダイレクトを防ぐため）。
function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNextPath(formData.get("next"));

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: `ログインに失敗しました（${error.message}）` };
  }

  redirect(next);
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const displayName = formData.get("displayName");
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safeNextPath(formData.get("next"));

  if (
    typeof displayName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !displayName ||
    !email ||
    !password
  ) {
    return { error: "すべての項目を入力してください。" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で入力してください。" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: `登録に失敗しました（${error.message}）` };
  }

  if (!data.session) {
    return {
      error:
        "確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。",
    };
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
