import type { ReactNode } from "react";

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "danger" | "neutral" | "info";
  children: ReactNode;
}) {
  const palette = {
    success: "border-[rgba(115,201,145,0.32)] bg-[rgba(115,201,145,0.12)] text-[var(--color-success)]",
    danger: "border-[rgba(242,127,127,0.32)] bg-[rgba(242,127,127,0.12)] text-[var(--color-danger)]",
    neutral: "border-[rgba(96,74,56,0.12)] bg-[rgba(96,74,56,0.06)] text-[rgba(96,74,56,0.74)]",
    info: "border-[rgba(75,134,200,0.32)] bg-[rgba(75,134,200,0.12)] text-[var(--color-info)]",
  }[tone];

  return (
    <span
      className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase ${palette}`}
    >
      {children}
    </span>
  );
}
