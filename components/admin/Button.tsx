import type { ComponentPropsWithoutRef } from "react";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  className?: string;
}) {
  const palette = {
    primary:
      "border-[rgba(242,166,90,0.5)] bg-[linear-gradient(180deg,rgba(242,166,90,0.98),rgba(227,146,70,0.94))] text-[var(--color-ink)] shadow-[0_18px_34px_rgba(242,166,90,0.18)] hover:-translate-y-px hover:shadow-[0_24px_42px_rgba(242,166,90,0.24)]",
    secondary:
      "border-[var(--color-line)] bg-[rgba(96,74,56,0.06)] text-[var(--color-paper)] hover:-translate-y-px hover:border-[rgba(242,166,90,0.36)] hover:bg-[rgba(96,74,56,0.1)]",
    ghost:
      "border-transparent bg-transparent text-[rgba(96,74,56,0.76)] hover:bg-[rgba(96,74,56,0.05)] hover:text-[var(--color-paper)]",
    danger:
      "border-[rgba(242,127,127,0.34)] bg-[rgba(242,127,127,0.12)] text-[var(--color-danger)] hover:-translate-y-px hover:border-[rgba(242,127,127,0.56)] hover:bg-[rgba(242,127,127,0.18)]",
  }[variant];

  const dimension = {
    md: "h-11 px-5 text-sm",
    sm: "h-9 px-3.5 text-xs",
  }[size];

  return [
    "inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold tracking-[0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
    dimension,
    palette,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
}) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
