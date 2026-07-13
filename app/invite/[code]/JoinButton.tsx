"use client";

import { useActionState } from "react";
import { joinGroupByInviteCode } from "@/app/groups/actions";

export function JoinButton({ code }: { code: string }) {
  const [state, action, pending] = useActionState(joinGroupByInviteCode, undefined);

  return (
    <form action={action} className="flex flex-col items-center gap-3">
      <input type="hidden" name="code" value={code} />
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "参加中..." : "参加する"}
      </button>
    </form>
  );
}
