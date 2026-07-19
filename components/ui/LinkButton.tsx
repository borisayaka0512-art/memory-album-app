import Link from "next/link";
import type { ComponentProps } from "react";

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
}) {
  const base =
    "block rounded-md py-2.5 px-4 text-center text-sm font-medium transition";
  const variants = {
    primary: "bg-accent text-accent-ink hover:brightness-110",
    secondary:
      "border border-hairline bg-transparent text-ink hover:bg-accent-wash",
  };

  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
