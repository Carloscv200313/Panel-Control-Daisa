import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/auth/requireAdmin";
import { signCloudinaryUpload } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const access = await getAdminAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ error: "Sin permisos." }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as { folder?: string } | null;
    const folder = body?.folder?.trim() || "daisa/admin";

    return NextResponse.json(signCloudinaryUpload(folder));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo firmar la carga.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
