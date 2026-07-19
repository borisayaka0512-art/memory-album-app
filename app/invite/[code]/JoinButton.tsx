"use client";

import { useActionState } from "react";
import { joinGroupByInviteCode } from "@/app/groups/actions";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function JoinButton({ code }: { code: string }) {
  const [state, action, pending] = useActionState(joinGroupByInviteCode, undefined);

  return (
    <form action={action} className="flex flex-col items-center gap-3">
      <input type="hidden" name="code" value={code} />
      {state?.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" disabled={pending} className="px-5">
        {pending ? "参加中..." : "参加する"}
      </Button>
    </form>
  );
}
