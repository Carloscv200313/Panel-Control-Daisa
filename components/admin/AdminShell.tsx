"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { SignOutButton } from "@/components/admin/SignOutButton";
import { ADMIN_NAV } from "@/lib/admin/constants";

function NavIcon({ href }: { href: string }) {
  const iconClass = "h-[18px] w-[18px]";
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: iconClass,
    viewBox: "0 0 24 24",
  };

  switch (href) {
    case "/admin/dashboard":
      return (
        <svg {...common}>
          <path d="M4 13h7V4H4z" />
          <path d="M13 20h7v-9h-7z" />
          <path d="M13 11h7V4h-7z" />
          <path d="M4 20h7v-5H4z" />
        </svg>
      );
    case "/admin/products":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 7.2 12 11.4l7.5-4.2z" />
          <path d="M4.5 7.2V16.8L12 21l7.5-4.2V7.2" />
          <path d="M12 11.4V21" />
        </svg>
      );
    case "/admin/pricing":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M16.5 7.5c0-1.9-1.8-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.3 11 12 11s4.5 1.6 4.5 3.5S14.7 18 12 18s-4.5-1.6-4.5-3.5" />
        </svg>
      );
    case "/admin/orders":
      return (
        <svg {...common}>
          <path d="M8 7V4h8v3" />
          <path d="M5 7h14l-1 13H6z" />
          <path d="M9.5 11.5h5" />
        </svg>
      );
    case "/admin/customers":
      return (
        <svg {...common}>
          <path d="M16 19a4 4 0 0 0-8 0" />
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 19a3 3 0 0 1 3-3" />
          <path d="M19 19a3 3 0 0 0-3-3" />
        </svg>
      );
    case "/admin/settings":
      return (
        <svg {...common}>
          <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.7a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0L4.3 17.9a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3.5a1 1 0 0 1-1-1v-1.7a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4L5.5 4.8a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.7a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v1.7a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6z" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminShell({
  businessName,
  logoUrl,
  children,
}: {
  businessName?: string;
  logoUrl?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = (
    <>
      <div className="shrink-0 flex flex-col gap-2 items-center justify-center border-b border-[rgba(96,74,56,0.08)] pt-6 pb-2">
        <div className="relative h-24 w-full">
          <Image
            src={logoUrl ?? "/logo.png"}
            alt={`Logo de ${businessName ?? "Daiza"}`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-5">
        <nav className="grid grid-cols-1 gap-1.5">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition ${active
                  ? "bg-[rgba(242,166,90,0.12)] text-[var(--color-paper)]"
                  : "text-[rgba(96,74,56,0.72)] hover:bg-[rgba(96,74,56,0.04)] hover:text-[var(--color-paper)]"
                  }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full transition ${active ? "bg-[var(--color-highlight-strong)]" : "bg-transparent"
                    }`}
                />
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${active
                    ? "border-[rgba(242,166,90,0.28)] bg-[rgba(255,250,244,0.9)] text-[var(--color-highlight-strong)]"
                    : "border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.72)] text-[rgba(96,74,56,0.56)]"
                    }`}
                >
                  <NavIcon href={item.href} />
                </span>
                <span className="truncate text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="shrink-0 border-t border-[rgba(96,74,56,0.08)] px-4 py-4">
        <SignOutButton />
      </div>
    </>
  );

  return (
    <div>
      <div className="grid min-h-[calc(100vh-2rem)] gap-5 p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div
          className={`fixed inset-0 z-40 bg-[rgba(45,36,29,0.24)] backdrop-blur-sm transition lg:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          className={`fixed inset-y-4 left-4 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(82vw,300px)] flex-col overflow-hidden rounded-[28px] border border-[rgba(96,74,56,0.1)] bg-[rgba(255,252,247,0.96)] shadow-[0_24px_60px_rgba(85,63,44,0.16)] backdrop-blur transition duration-300 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
        >
          <div className="flex items-center justify-between border-b border-[rgba(96,74,56,0.08)] px-4 py-3 lg:hidden">
            <div className="text-sm font-semibold text-[var(--color-paper)]">Menú</div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.76)] text-[rgba(96,74,56,0.64)]"
              aria-label="Cerrar menú"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col">{navigation}</div>
        </aside>

        <aside className="hidden rounded-[28px] border border-[rgba(96,74,56,0.1)] bg-[rgba(255,252,247,0.92)] shadow-[0_18px_48px_rgba(85,63,44,0.08)] backdrop-blur lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
          <div className="flex w-full flex-col">{navigation}</div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between rounded-[20px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,252,247,0.92)] px-4 py-3 shadow-[0_12px_32px_rgba(85,63,44,0.05)] lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center gap-3 rounded-xl border border-[rgba(96,74,56,0.08)] bg-[rgba(255,255,255,0.82)] px-3 py-2 text-sm font-medium text-[var(--color-paper)]"
              aria-label="Abrir navegación"
              aria-expanded={mobileMenuOpen}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
              {businessName ?? "Daiza"}
            </button>
          </div>

          <main className="min-h-[calc(100vh-10rem)] space-y-5 rounded-[24px] border border-[rgba(96,74,56,0.08)] bg-[rgba(255,252,247,0.92)] p-5 shadow-[0_18px_46px_rgba(85,63,44,0.06)] lg:p-6">
            {children}
          </main>
        </section>
      </div>
    </div>
  );
}
