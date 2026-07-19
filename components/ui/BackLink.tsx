import Link from "next/link";
import type { ComponentProps } from "react";

export function BackLink(props: ComponentProps<typeof Link>) {
  return (
    <Link className="text-sm text-ink-muted hover:text-accent" {...props} />
  );
}
