"use client";

import { useActionState, useState } from "react";
import { login, signup } from "./actions";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, undefined);
  const [signupState, signupAction, signupPending] = useActionState(signup, undefined);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          新規登録
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="flex flex-col gap-4">
          <Field label="メールアドレス" name="email" type="email" />
          <Field label="パスワード" name="password" type="password" />
          {loginState?.error && <ErrorMessage message={loginState.error} />}
          <SubmitButton pending={loginPending} label="ログイン" />
        </form>
      ) : (
        <form action={signupAction} className="flex flex-col gap-4">
          <Field label="表示名" name="displayName" type="text" />
          <Field label="メールアドレス" name="email" type="email" />
          <Field label="パスワード（8文字以上）" name="password" type="password" />
          {signupState?.error && <ErrorMessage message={signupState.error} />}
          <SubmitButton pending={signupPending} label="登録する" />
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type,
}: {
  label: string;
  name: string;
  type: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="text-sm text-red-600 dark:text-red-400">{message}</p>;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}
