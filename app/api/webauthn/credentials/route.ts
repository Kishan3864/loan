import { NextResponse } from "next/server";
import { getStore, updateStore } from "@/lib/store";
import { authed } from "@/lib/route-helpers";

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const s = await getStore();
  return NextResponse.json({
    credentials: s.credentials.map((c) => ({ id: c.id, name: c.name, createdAt: c.createdAt })),
  });
}

export async function DELETE(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  await updateStore((s) => {
    s.credentials = s.credentials.filter((c) => c.id !== id);
  });
  return NextResponse.json({ ok: true });
}
