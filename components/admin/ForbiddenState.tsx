import Link from "next/link";

import { buttonStyles } from "@/components/admin/Button";
import { SignOutButton } from "@/components/admin/SignOutButton";

export function ForbiddenState({ email }: { email?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-[34px] border border-[var(--color-line)] bg-[linear-gradient(180deg,rgba(242,232,221,0.94),rgba(252,245,237,0.92))] p-8 text-center shadow-[0_36px_120px_rgba(0,0,0,0.42)] backdrop-blur">
        <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-[26px] border border-[rgba(242,127,127,0.32)] bg-[rgba(242,127,127,0.12)] text-2xl text-[var(--color-danger)]">
          403
        </div>
        <h1 className="mt-6 font-display text-5xl text-[var(--color-paper)]">Sin permisos</h1>
        <p className="mt-4 text-sm leading-7 text-[rgba(96,74,56,0.66)]">
          {email ? `${email} inició sesión,` : "Tu usuario"} pero no tiene acceso válido al panel.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/admin/login" className={buttonStyles({ variant: "secondary" })}>
            Ir al login
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
