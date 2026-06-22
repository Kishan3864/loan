import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { getSecret } from "@/lib/auth";
import { setSession } from "@/lib/route-helpers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: "" }));
  const password = String(body?.password ?? "");
  const store = await getStore();

  if (verifyPassword(password, store.passwordHash)) {
    const ttlMin = store.settings.autoLockMinutes || 5;
    const token = await createSession(getSecret(), ttlMin * 60_000);
    const res = NextResponse.json({ ok: true, autoLockMinutes: ttlMin });
    setSession(res, token, ttlMin * 60);
    return res;
  }

  return NextResponse.json(
    { ok: false, error: "Incorrect password — please try again" },
    { status: 401 },
  );
}
