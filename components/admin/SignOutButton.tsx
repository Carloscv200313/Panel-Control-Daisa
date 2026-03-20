"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/admin/Button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full justify-between"
      onClick={handleSignOut}
      disabled={loading}
    >
      <span>{loading ? "Saliendo..." : "Cerrar sesión"}</span>
    </Button>
  );
}
