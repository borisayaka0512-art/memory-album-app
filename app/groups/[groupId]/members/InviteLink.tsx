"use client";

import { useState } from "react";

export function InviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <p className="mb-3 text-zinc-600 dark:text-zinc-400">
        このリンクを友達に送ると、グループに参加できます。
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        {copied ? "コピーしました" : "招待リンクをコピー"}
      </button>
    </div>
  );
}
