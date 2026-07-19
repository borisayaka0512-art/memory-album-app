"use client";

import { useActionState, useState } from "react";
import { login, signup } from "./actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function AuthForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, undefined);
  const [signupState, signupAction, signupPending] = useActionState(signup, undefined);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex rounded-lg border border-hairline bg-card p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "login"
              ? "bg-accent text-accent-ink"
              : "text-ink-muted"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-accent text-accent-ink"
              : "text-ink-muted"
          }`}
        >
          新規登録
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          <Field
            label="メールアドレス"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <Field
            label="パスワード"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {loginState?.error && <ErrorText>{loginState.error}</ErrorText>}
          <Button type="submit" disabled={loginPending}>
            {loginPending ? "処理中..." : "ログイン"}
          </Button>
        </form>
      ) : (
        <form action={signupAction} className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          <Field label="表示名" name="displayName" type="text" required />
          <Field
            label="メールアドレス"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <Field
            label="パスワード（8文字以上）"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {signupState?.error && <ErrorText>{signupState.error}</ErrorText>}
          <Button type="submit" disabled={signupPending}>
            {signupPending ? "処理中..." : "登録する"}
          </Button>
        </form>
      )}
    </div>
  );
}
