import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[rgba(96,74,56,0.12)] bg-[rgba(255,255,255,0.72)] p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-5 h-px w-16 bg-[linear-gradient(90deg,transparent,rgba(242,166,90,0.8),transparent)]" />
        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-paper)]">{title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[rgba(96,74,56,0.62)]">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
