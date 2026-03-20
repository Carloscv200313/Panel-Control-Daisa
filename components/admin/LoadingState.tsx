export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.8)] p-6 shadow-[0_10px_26px_rgba(85,63,44,0.04)]">
      <div className="flex items-center gap-4">
        <span className="relative inline-flex h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(242,166,90,0.45)]" />
          <span className="relative rounded-full bg-[var(--color-highlight)] h-4 w-4" />
        </span>
        <div>
          <div className="text-xs font-semibold tracking-[0.18em] text-[rgba(96,74,56,0.5)] uppercase">Procesando</div>
          <div className="mt-1 text-sm text-[rgba(96,74,56,0.72)]">{label}</div>
        </div>
      </div>
    </div>
  );
}
