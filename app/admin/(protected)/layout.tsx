import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { ForbiddenState } from "@/components/admin/ForbiddenState";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await requireAdmin();

  if (access.status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (access.status === "forbidden") {
    return <ForbiddenState email={access.user?.email} />;
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return (
    <AdminShell
      businessName={settings?.business_name ?? "Daiza"}
      logoUrl={settings?.admin_logo_url ?? null}
    >
      {children}
    </AdminShell>
  );
}
