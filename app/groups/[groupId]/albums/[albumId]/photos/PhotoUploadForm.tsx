"use client";

import { useActionState, useState } from "react";
import type { FormState } from "./actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";

export function PhotoUploadForm({
  action,
  spots,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  spots: { id: string; name: string }[];
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
        + 写真を追加
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-ink-muted">写真</span>
        <input
          name="files"
          type="file"
          accept="image/*"
          multiple
          required
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:text-accent-ink"
        />
      </label>

      {spots.length > 0 && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-ink-muted">しおり（任意）</span>
          <select
            name="spotId"
            defaultValue=""
            className="rounded-md border border-hairline bg-raised px-3 py-2 text-base text-ink outline-none focus:border-accent"
          >
            <option value="">アルバム全体</option>
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <Field
        label="キャプション（任意）"
        name="caption"
        type="text"
        placeholder="全ての写真に共通のコメント"
      />

      {state?.error && <ErrorText>{state.error}</ErrorText>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "アップロード中..." : "アップロードする"}
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
