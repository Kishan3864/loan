import { NextResponse } from "next/server";
import { updateStore } from "@/lib/store";
import { rpFromHost, CHALLENGE_COOKIE } from "@/lib/auth";
import { verifyReg, pkToB64url } from "@/lib/webauthn";
import { authed, readCookie, hostHeader, clearChallenge } from "@/lib/route-helpers";

export async function POST(req: Request) {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const challenge = readCookie(CHALLENGE_COOKIE);
  if (!challenge) return NextResponse.json({ error: "Challenge expired, try again" }, { status: 400 });

  const { rpID, origin } = rpFromHost(hostHeader());
  let verification;
  try {
    verification = await verifyReg({
      response: body.response,
      expectedChallenge: challenge,
      origin,
      rpID,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Verification failed" }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Could not register this device" }, { status: 400 });
  }

  const info = verification.registrationInfo;
  await updateStore((s) => {
    s.credentials.push({
      id: info.credential.id,
      publicKey: pkToB64url(info.credential.publicKey),
      counter: info.credential.counter,
      transports: info.credential.transports,
      name: String(body?.name || "This device"),
      createdAt: new Date().toISOString(),
    });
  });

  const res = NextResponse.json({ ok: true });
  clearChallenge(res);
  return res;
}
