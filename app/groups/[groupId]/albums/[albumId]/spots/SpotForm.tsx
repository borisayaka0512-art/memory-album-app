"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";
import { Field, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function SpotForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: { name: string; visitedDate: string | null; memo: string | null };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="場所名"
        name="name"
        type="text"
        required
        defaultValue={defaultValues?.name}
        placeholder="例: 太宰府天満宮"
      />

      <Field
        label="訪問日（任意）"
        name="visitedDate"
        type="date"
        defaultValue={defaultValues?.visitedDate ?? undefined}
      />

      <TextAreaField
        label="メモ（任意）"
        name="memo"
        rows={4}
        defaultValue={defaultValues?.memo ?? undefined}
        placeholder="そのときの出来事や気持ちなど"
      />

      {state?.error && <ErrorText>{state.error}</ErrorText>}

      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
