import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AdminAccessStatus = "authorized" | "forbidden" | "unauthenticated";

export interface AdminAccessResult {
  status: AdminAccessStatus;
  isAdmin: boolean;
  user: {
    id: string;
    email?: string;
  } | null;
}

export async function getAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      status: "unauthenticated",
      isAdmin: false,
      user: null,
    };
  }

  const { data: isAdminByFunction, error: functionError } = await supabase.rpc(
    "is_admin",
  );

  if (!functionError && isAdminByFunction === true) {
    return {
      status: "authorized",
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  const { data: adminUser, error: tableError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (tableError || !adminUser) {
    return {
      status: "forbidden",
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  return {
    status: "authorized",
    isAdmin: true,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export const requireAdmin = cache(getAdminAccess);
