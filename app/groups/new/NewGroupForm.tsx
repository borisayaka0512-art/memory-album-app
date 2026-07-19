"use client";

import { useActionState } from "react";
import { createGroup } from "../actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function NewGroupForm() {
  const [state, action, pending] = useActionState(createGroup, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="グループ名"
        name="name"
        type="text"
        required
        placeholder="例: 大学の友人"
      />
      {state?.error && <ErrorText>{state.error}</ErrorText>}
      <Button type="submit" disabled={pending}>
        {pending ? "作成中..." : "作成する"}
      </Button>
    </form>
  );
}
