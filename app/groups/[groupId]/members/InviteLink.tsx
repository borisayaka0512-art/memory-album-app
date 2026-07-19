"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function InviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-md border border-hairline bg-card p-4 text-sm">
      <p className="mb-3 text-ink-muted">
        このリンクを友達に送ると、グループに参加できます。
      </p>
      <Button type="button" onClick={handleCopy} className="px-3 py-1.5 text-xs">
        {copied ? "コピーしました" : "招待リンクをコピー"}
      </Button>
    </div>
  );
}
