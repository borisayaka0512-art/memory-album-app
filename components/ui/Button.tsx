export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const base =
    "rounded-md py-2.5 px-4 text-sm font-medium transition disabled:opacity-50";
  const variants = {
    primary: "bg-accent text-accent-ink hover:brightness-110",
    secondary:
      "border border-hairline bg-transparent text-ink hover:bg-accent-wash",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
