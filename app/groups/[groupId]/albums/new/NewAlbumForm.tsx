"use client";

import { useActionState, useState } from "react";
import { createAlbum, type FormState } from "../actions";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/ErrorText";
import { SPINE_COLORS } from "@/lib/bookColors";

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
  const [coverColor, setCoverColor] = useState(SPINE_COLORS[0].value);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="タイトル"
        name="title"
        type="text"
        required
        placeholder="例: 沖縄旅行 2026"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Field
            label="旅行開始日"
            name="travelDateStart"
            type="date"
            required
          />
        </div>
        <div className="flex-1">
          <Field label="旅行終了日（任意）" name="travelDateEnd" type="date" />
        </div>
      </div>

      <fieldset className="flex flex-col gap-1.5 text-sm">
        <legend className="mb-1 text-ink-muted">本の色</legend>
        <input type="hidden" name="coverColor" value={coverColor} />
        <div className="flex gap-2">
          {SPINE_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              aria-label={color.label}
              onClick={() => setCoverColor(color.value)}
              className={`h-8 w-8 rounded-full transition ${
                coverColor === color.value
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-paper"
                  : ""
              }`}
              style={{ background: color.value }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5 text-sm">
        <legend className="mb-1 text-ink-muted">参加メンバー</legend>
        {members.map((member) => (
          <label key={member.userId} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="memberIds"
              value={member.userId}
              defaultChecked={member.userId === currentUserId}
              disabled={member.userId === currentUserId}
              className="accent-accent"
            />
            <span>
              {member.displayName}
              {member.userId === currentUserId && "（自分）"}
            </span>
          </label>
        ))}
      </fieldset>

      {state?.error && <ErrorText>{state.error}</ErrorText>}

      <Button type="submit" disabled={pending}>
        {pending ? "作成中..." : "作成する"}
      </Button>
    </form>
  );
}
