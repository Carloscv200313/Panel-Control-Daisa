import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function baseClassName(className?: string) {
  return [
    "w-full rounded-xl border border-[rgba(96,74,56,0.1)] bg-[rgba(255,255,255,0.84)] px-4 py-3 text-sm text-[var(--color-paper)] outline-none transition placeholder:text-[rgba(96,74,56,0.36)] focus:border-[rgba(242,166,90,0.45)] focus:ring-2 focus:ring-[rgba(242,166,90,0.12)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.84)] px-5 py-5 shadow-[0_12px_30px_rgba(85,63,44,0.05)]">
      <div className="border-b border-[rgba(96,74,56,0.08)] pb-4">
        <div className="text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.46)] uppercase">
          Sección
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-paper)]">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[rgba(96,74,56,0.62)]">{description}</p>
        ) : null}
      </div>
      <div className="space-y-5 pt-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-[11px] font-semibold tracking-[0.14em] text-[rgba(96,74,56,0.7)] uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-[rgba(96,74,56,0.5)]">{hint}</span> : null}
      {error ? <span className="block text-sm text-[var(--color-danger)]">{error}</span> : null}
    </label>
  );
}

export function Input(props: ComponentPropsWithoutRef<"input">) {
  const { className, ...rest } = props;
  return <input className={baseClassName(className)} {...rest} />;
}

export function Textarea(props: ComponentPropsWithoutRef<"textarea">) {
  const { className, ...rest } = props;
  return <textarea className={baseClassName(["min-h-32", className].filter(Boolean).join(" "))} {...rest} />;
}

export function Select(props: ComponentPropsWithoutRef<"select">) {
  const { className, ...rest } = props;
  return <select className={baseClassName(className)} {...rest} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-[rgba(96,74,56,0.1)] bg-[rgba(255,255,255,0.84)] px-4 py-3.5 text-left"
    >
      <div>
        <div className="text-sm font-semibold text-[var(--color-paper)]">{label}</div>
        <div className="mt-1 text-xs text-[rgba(96,74,56,0.54)]">
          {checked ? "Activo" : "Inactivo"}
        </div>
      </div>
      <span
        className={`relative inline-flex h-8 w-14 rounded-full transition ${
          checked ? "bg-[rgba(242,166,90,0.88)]" : "bg-[rgba(96,74,56,0.14)]"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-[var(--color-ink)] shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 pt-1">{children}</div>;
}
