import { NextResponse } from "next/server";
import { getStore, updateStore } from "@/lib/store";
import { rpFromHost, CHALLENGE_COOKIE, getSecret } from "@/lib/auth";
import { verifyAuth } from "@/lib/webauthn";
import { createSession } from "@/lib/session";
import { readCookie, hostHeader, setSession, clearChallenge } from "@/lib/route-helpers";

// Public: complete a fingerprint login -> issues a session.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const challenge = readCookie(CHALLENGE_COOKIE);
  if (!challenge) return NextResponse.json({ error: "Challenge expired, try again" }, { status: 400 });

  const response = body.response;
  const credId = String(response?.id ?? "");
  const store = await getStore();
  const cred = store.credentials.find((c) => c.id === credId);
  if (!cred) return NextResponse.json({ error: "Unknown device" }, { status: 400 });

  const { rpID, origin } = rpFromHost(hostHeader());
  let verification;
  try {
    verification = await verifyAuth({ response, expectedChallenge: challenge, origin, rpID, cred });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Verification failed" }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Fingerprint not recognised" }, { status: 400 });
  }

  await updateStore((s) => {
    const c = s.credentials.find((x) => x.id === credId);
    if (c) c.counter = verification!.authenticationInfo.newCounter;
  });

  const ttlMin = store.settings.autoLockMinutes || 5;
  const token = await createSession(getSecret(), ttlMin * 60_000);
  const res = NextResponse.json({ ok: true, autoLockMinutes: ttlMin });
  setSession(res, token, ttlMin * 60);
  clearChallenge(res);
  return res;
}
