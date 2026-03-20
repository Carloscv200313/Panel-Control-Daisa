"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/admin/Button";
import { Field, Input } from "@/components/admin/Form";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo iniciar sesión.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[36px] border border-[var(--color-line)] bg-[linear-gradient(155deg,rgba(242,166,90,0.2),rgba(75,134,200,0.08),rgba(242,232,221,0.9))] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
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

        <section className="rounded-[36px] border border-[var(--color-line)] bg-[rgba(252,245,237,0.82)] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
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
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
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
