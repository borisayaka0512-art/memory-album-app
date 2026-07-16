"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

export function AfterwordForm({
  action,
  defaultContent,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultContent: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="content"
        rows={4}
        required
        defaultValue={defaultContent}
        placeholder="旅を振り返って、一言残そう"
        className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "保存中..." : defaultContent ? "書き直す" : "投稿する"}
      </button>
    </form>
  );
}
