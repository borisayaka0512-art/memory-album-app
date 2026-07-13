"use client";

import { useActionState } from "react";
import { joinGroupByInviteCode } from "./actions";

export function JoinByCodeForm() {
  const [state, action, pending] = useActionState(joinGroupByInviteCode, undefined);

  return (
    <form action={action} className="flex flex-col gap-2 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">招待コードをお持ちの方</span>
        <input
          name="code"
          type="text"
          placeholder="招待リンクまたはコードを貼り付け"
          className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 transition disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {pending ? "参加中..." : "参加する"}
      </button>
    </form>
  );
}
