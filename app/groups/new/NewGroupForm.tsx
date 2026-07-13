"use client";

import { useActionState } from "react";
import { createGroup } from "../actions";

export function NewGroupForm() {
  const [state, action, pending] = useActionState(createGroup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">グループ名</span>
        <input
          name="name"
          type="text"
          required
          placeholder="例: 大学の友人"
          className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "作成中..." : "作成する"}
      </button>
    </form>
  );
}
