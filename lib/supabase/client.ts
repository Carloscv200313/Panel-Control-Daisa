import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  return { url, anonKey };
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getEnv();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
