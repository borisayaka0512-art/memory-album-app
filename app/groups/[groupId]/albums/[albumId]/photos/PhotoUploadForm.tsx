"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

export function PhotoUploadForm({
  action,
  spots,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  spots: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">写真</span>
        <input
          name="files"
          type="file"
          accept="image/*"
          multiple
          required
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-900"
        />
      </label>

      {spots.length > 0 && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">
            しおり（任意）
          </span>
          <select
            name="spotId"
            defaultValue=""
            className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
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

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">
          キャプション（任意）
        </span>
        <input
          name="caption"
          type="text"
          placeholder="全ての写真に共通のコメント"
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
        {pending ? "アップロード中..." : "アップロードする"}
      </button>
    </form>
  );
}
