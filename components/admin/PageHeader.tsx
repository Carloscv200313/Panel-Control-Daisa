import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.82)] px-6 py-5 shadow-[0_12px_32px_rgba(85,63,44,0.05)]">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[rgba(96,74,56,0.52)] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-highlight-strong)]" />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] text-[var(--color-paper)] sm:text-[34px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(96,74,56,0.64)] sm:text-[15px]">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="rounded-2xl border border-[rgba(96,74,56,0.08)] bg-[rgba(248,239,229,0.52)] p-2.5">
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
