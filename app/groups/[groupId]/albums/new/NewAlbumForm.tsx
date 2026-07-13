"use client";

import { useActionState } from "react";
import { createAlbum, type FormState } from "../actions";

type Member = { userId: string; displayName: string };

export function NewAlbumForm({
  groupId,
  members,
  currentUserId,
}: {
  groupId: string;
  members: Member[];
  currentUserId: string;
}) {
  const boundAction = createAlbum.bind(null, groupId);
  const [state, action, pending] = useActionState<FormState, FormData>(
    boundAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">タイトル</span>
        <input
          name="title"
          type="text"
          required
          placeholder="例: 沖縄旅行 2026"
          className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">旅行開始日</span>
          <input
            name="travelDateStart"
            type="date"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">旅行終了日（任意）</span>
          <input
            name="travelDateEnd"
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1.5 text-sm">
        <legend className="mb-1 text-zinc-700 dark:text-zinc-300">
          参加メンバー
        </legend>
        {members.map((member) => (
          <label key={member.userId} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="memberIds"
              value={member.userId}
              defaultChecked={member.userId === currentUserId}
              disabled={member.userId === currentUserId}
            />
            <span>
              {member.displayName}
              {member.userId === currentUserId && "（自分）"}
            </span>
          </label>
        ))}
      </fieldset>

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
