export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-hairline bg-card px-4 py-3 shadow-card ${className}`}
      {...props}
    />
  );
}
