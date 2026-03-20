import type { Metadata } from "next";

import { FeedbackModalProvider } from "@/components/admin/FeedbackModalProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Daiza Admin",
  description: "Panel administrativo para catálogo y pedidos Daiza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--color-ink)] text-[var(--color-paper)] antialiased">
        <FeedbackModalProvider>{children}</FeedbackModalProvider>
      </body>
    </html>
  );
}
