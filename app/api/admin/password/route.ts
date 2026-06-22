import { NextResponse } from "next/server";
import { getStore, updateStore } from "@/lib/store";
import { verifyPassword, hashPassword } from "@/lib/password";
import { authed } from "@/lib/route-helpers";

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");

  const store = await getStore();
  if (!verifyPassword(currentPassword, store.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  if (newPassword.length < 4) {
    return NextResponse.json({ error: "New password must be at least 4 characters" }, { status: 400 });
  }

  await updateStore((s) => {
    s.passwordHash = hashPassword(newPassword);
  });
  return NextResponse.json({ ok: true });
}
