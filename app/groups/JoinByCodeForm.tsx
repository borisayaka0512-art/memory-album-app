"use client";

import { useActionState } from "react";
import { joinGroupByInviteCode } from "./actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function JoinByCodeForm() {
  const [state, action, pending] = useActionState(joinGroupByInviteCode, undefined);

  return (
    <form
      action={action}
      className="flex flex-col gap-2 rounded-md border border-hairline bg-card p-4"
    >
      <Field
        label="招待コードをお持ちの方"
        name="code"
        type="text"
        placeholder="招待リンクまたはコードを貼り付け"
      />
      {state?.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" variant="secondary" disabled={pending} className="self-start px-4 py-1.5">
        {pending ? "参加中..." : "参加する"}
      </Button>
    </form>
  );
}
