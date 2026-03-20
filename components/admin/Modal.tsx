"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/admin/Button";

export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(237,227,216,0.76)] p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[34px] border border-[var(--color-line)] bg-[linear-gradient(180deg,rgba(242,232,221,0.98),rgba(252,245,237,0.94))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-5">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-[rgba(96,74,56,0.48)] uppercase">Detalle</div>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-paper)]">{title}</h2>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
