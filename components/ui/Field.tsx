export function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <input
        name={name}
        type={type}
        className="rounded-md border border-hairline bg-raised px-3 py-2 text-base text-ink outline-none focus:border-accent"
        {...props}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  ...props
}: {
  label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <textarea
        name={name}
        className="rounded-md border border-hairline bg-raised px-3 py-2 text-base text-ink outline-none focus:border-accent"
        {...props}
      />
    </label>
  );
}
