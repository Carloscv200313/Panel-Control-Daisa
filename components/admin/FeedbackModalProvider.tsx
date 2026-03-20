"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/admin/Button";

type FeedbackTone = "loading" | "success" | "warning" | "error";

interface FeedbackOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface FeedbackState extends FeedbackOptions {
  tone: FeedbackTone;
  open: boolean;
}

interface FeedbackContextValue {
  showLoading: (options: FeedbackOptions) => void;
  showSuccess: (options: FeedbackOptions) => Promise<void>;
  showError: (options: FeedbackOptions) => Promise<void>;
  showWarning: (options: FeedbackOptions) => Promise<boolean>;
  close: () => void;
}

const FeedbackModalContext = createContext<FeedbackContextValue | null>(null);

const INITIAL_STATE: FeedbackState = {
  open: false,
  tone: "loading",
  title: "",
  description: "",
  confirmLabel: "",
  cancelLabel: "",
};

function FeedbackIcon({ tone }: { tone: FeedbackTone }) {
  const palette = {
    loading: "bg-[rgba(75,134,200,0.12)] text-[var(--color-info)]",
    success: "bg-[rgba(47,143,89,0.12)] text-[var(--color-success)]",
    warning: "bg-[rgba(229,161,91,0.16)] text-[var(--color-highlight-strong)]",
    error: "bg-[rgba(207,101,102,0.14)] text-[var(--color-danger)]",
  }[tone];

  return (
    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${palette}`}>
      {tone === "loading" ? (
        <span className="relative inline-flex h-6 w-6">
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-25" />
          <span className="absolute inset-[5px] rounded-full border-2 border-current border-t-transparent animate-spin" />
        </span>
      ) : null}
      {tone === "success" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 13 4 4L19 7" />
        </svg>
      ) : null}
      {tone === "warning" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        </svg>
      ) : null}
      {tone === "error" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ) : null}
    </div>
  );
}

export function FeedbackModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FeedbackState>(INITIAL_STATE);
  const [warningResolver, setWarningResolver] = useState<((value: boolean) => void) | null>(null);
  const [dismissResolver, setDismissResolver] = useState<(() => void) | null>(null);

  const close = useCallback(() => {
    if (warningResolver) {
      warningResolver(false);
      setWarningResolver(null);
    }
    if (dismissResolver) {
      dismissResolver();
      setDismissResolver(null);
    }
    setState(INITIAL_STATE);
  }, [dismissResolver, warningResolver]);

  const showLoading = useCallback((options: FeedbackOptions) => {
    setWarningResolver(null);
    setDismissResolver(null);
    setState({
      open: true,
      tone: "loading",
      confirmLabel: options.confirmLabel ?? "",
      cancelLabel: "",
      ...options,
    });
  }, []);

  const showSuccess = useCallback((options: FeedbackOptions) => {
    setWarningResolver(null);
    return new Promise<void>((resolve) => {
      setDismissResolver(() => resolve);
      setState({
        open: true,
        tone: "success",
        confirmLabel: options.confirmLabel ?? "Entendido",
        cancelLabel: "",
        ...options,
      });
    });
  }, []);

  const showError = useCallback((options: FeedbackOptions) => {
    setWarningResolver(null);
    return new Promise<void>((resolve) => {
      setDismissResolver(() => resolve);
      setState({
        open: true,
        tone: "error",
        confirmLabel: options.confirmLabel ?? "Cerrar",
        cancelLabel: "",
        ...options,
      });
    });
  }, []);

  const showWarning = useCallback((options: FeedbackOptions) => {
    setDismissResolver(null);
    setState({
      open: true,
      tone: "warning",
      confirmLabel: options.confirmLabel ?? "Continuar",
      cancelLabel: options.cancelLabel ?? "Cancelar",
      ...options,
    });

    return new Promise<boolean>((resolve) => {
      setWarningResolver(() => resolve);
    });
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      showLoading,
      showSuccess,
      showError,
      showWarning,
      close,
    }),
    [close, showError, showLoading, showSuccess, showWarning],
  );

  const dismissible = state.tone !== "loading";

  return (
    <FeedbackModalContext.Provider value={value}>
      {children}

      {state.open ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(37,30,24,0.32)] p-4 backdrop-blur-sm"
          onClick={dismissible ? close : undefined}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,252,247,0.98)] p-6 shadow-[0_26px_90px_rgba(30,24,20,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <FeedbackIcon tone={state.tone} />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-[rgba(96,74,56,0.48)] uppercase">
                  {state.tone === "loading"
                    ? "Procesando"
                    : state.tone === "success"
                      ? "Éxito"
                      : state.tone === "warning"
                        ? "Advertencia"
                        : "Error"}
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-paper)]">
                  {state.title}
                </h3>
                {state.description ? (
                  <p className="mt-3 text-sm leading-6 text-[rgba(96,74,56,0.66)]">{state.description}</p>
                ) : null}
              </div>
            </div>

            {state.tone === "loading" ? (
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[rgba(96,74,56,0.08)]">
                <div className="h-full w-1/3 animate-[feedback-progress_1.2s_ease-in-out_infinite] rounded-full bg-[var(--color-highlight-strong)]" />
              </div>
            ) : null}

            {state.tone === "warning" ? (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    warningResolver?.(false);
                    setWarningResolver(null);
                    setDismissResolver(null);
                    setState(INITIAL_STATE);
                  }}
                >
                  {state.cancelLabel || "Cancelar"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    warningResolver?.(true);
                    setWarningResolver(null);
                    setDismissResolver(null);
                    setState(INITIAL_STATE);
                  }}
                >
                  {state.confirmLabel || "Continuar"}
                </Button>
              </div>
            ) : null}

            {state.tone === "success" || state.tone === "error" ? (
              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={close}>
                  {state.confirmLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </FeedbackModalContext.Provider>
  );
}

export function useFeedbackModal() {
  const context = useContext(FeedbackModalContext);

  if (!context) {
    throw new Error("useFeedbackModal must be used within FeedbackModalProvider.");
  }

  return context;
}
