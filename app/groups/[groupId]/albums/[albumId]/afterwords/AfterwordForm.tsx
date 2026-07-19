"use client";

import { useActionState, useState } from "react";
import type { FormState } from "./actions";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function AfterwordForm({
  action,
  defaultContent,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultContent: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-accent underline"
      >
        {defaultContent ? "あとがきを書き直す" : "+ あとがきを書く"}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="content"
        rows={4}
        required
        defaultValue={defaultContent}
        placeholder="旅を振り返って、一言残そう"
        className="rounded-md border border-hairline bg-raised px-3 py-2 text-base text-ink outline-none focus:border-accent"
      />

      {state?.error && <ErrorText>{state.error}</ErrorText>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "保存中..." : defaultContent ? "書き直す" : "投稿する"}
        </Button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm text-ink-muted underline"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
