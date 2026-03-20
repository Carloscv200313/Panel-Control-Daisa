"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/admin/Button";
import { useFeedbackModal } from "@/components/admin/FeedbackModalProvider";
import { Field, Input } from "@/components/admin/Form";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const feedback = useFeedbackModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      feedback.showLoading({
        title: "Verificando acceso",
        description: "Estamos validando tus credenciales de administrador.",
      });
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      feedback.close();
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión.";
      setError(message);
      feedback.close();
      await feedback.showError({
        title: "Credenciales inválidas",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="hidden rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(155deg,rgba(242,166,90,0.2),rgba(75,134,200,0.08),rgba(242,232,221,0.9))] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10 lg:block">
          <div className="text-xs font-semibold tracking-[0.24em] text-[rgba(96,74,56,0.6)] uppercase">
            Daiza / Panel interno
          </div>
          <h1 className="mt-4 max-w-xl font-display text-5xl leading-none text-[var(--color-paper)] sm:text-6xl">
            Catálogo, precios y pedidos con control real.
          </h1>
          <p className="mt-5 max-w-xl text-base text-[rgba(96,74,56,0.7)]">
            Accede con Supabase Auth. El ingreso final queda limitado a usuarios registrados en
            `public.admin_users`.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["RLS", "Autorización apoyada en políticas activas del esquema."],
              ["Multimedia", "Subidas directas firmadas para promociones e imágenes."],
              ["MVP", "Pantallas listas para operar desde el mismo proyecto."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[24px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.45)] p-4">
                <div className="text-sm font-semibold text-[var(--color-paper)]">{title}</div>
                <div className="mt-2 text-sm text-[rgba(96,74,56,0.6)]">{text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.9)] p-6 shadow-[0_24px_120px_rgba(0,0,0,0.18)] backdrop-blur sm:p-8 lg:rounded-[36px] lg:p-10 lg:shadow-[0_24px_120px_rgba(0,0,0,0.35)]">
          <div className="text-xs font-semibold tracking-[0.24em] text-[rgba(96,74,56,0.6)] uppercase">
            Acceso administrador
          </div>
          <h2 className="mt-3 font-display text-4xl text-[var(--color-paper)]">Iniciar sesión</h2>
          <p className="mt-3 text-sm text-[rgba(96,74,56,0.65)]">
            Si el usuario autentica pero no pertenece a `admin_users`, el panel mostrará “sin permisos”.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Field label="Correo" error={error ? undefined : undefined}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="admin@daiza.pe"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Contraseña">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[rgba(96,74,56,0.58)] transition hover:text-[var(--color-paper)]"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                      <path d="M9.4 5.5A10.7 10.7 0 0 1 12 5.2c5.2 0 9.3 4.1 10 6.8a11.8 11.8 0 0 1-3.7 4.9" />
                      <path d="M6.6 6.7A12 12 0 0 0 2 12c.7 2.7 4.8 6.8 10 6.8 1.5 0 2.9-.3 4.2-.8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </Field>
            {error ? <div className="text-sm text-[var(--color-danger)]">{error}</div> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar al panel"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
