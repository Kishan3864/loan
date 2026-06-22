import { NextResponse } from "next/server";
import { updateStore } from "@/lib/store";
import { authed } from "@/lib/route-helpers";

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const v = Math.max(1, Math.min(120, Math.round(Number(body?.autoLockMinutes) || 5)));

  const s = await updateStore((s) => {
    s.settings.autoLockMinutes = v;
  });
  return NextResponse.json({ ok: true, settings: s.settings });
}
