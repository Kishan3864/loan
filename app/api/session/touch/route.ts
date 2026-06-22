import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { getSecret } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { authed, setSession } from "@/lib/route-helpers";

// Sliding-session refresh: called by the client while the user is active.
export async function POST() {
  if (!(await authed())) return NextResponse.json({ ok: false }, { status: 401 });
  const store = await getStore();
  const ttlMin = store.settings.autoLockMinutes || 5;
  const token = await createSession(getSecret(), ttlMin * 60_000);
  const res = NextResponse.json({ ok: true, autoLockMinutes: ttlMin });
  setSession(res, token, ttlMin * 60);
  return res;
}
