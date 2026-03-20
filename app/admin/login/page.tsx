import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminLoginPage() {
  const access = await requireAdmin();

  if (access.status === "authorized" || access.status === "forbidden") {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
