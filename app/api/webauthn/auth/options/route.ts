import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { rpFromHost } from "@/lib/auth";
import { authOptions } from "@/lib/webauthn";
import { setChallenge, hostHeader } from "@/lib/route-helpers";

// Public: start a fingerprint login.
export async function POST() {
  const store = await getStore();
  if (store.credentials.length === 0) {
    return NextResponse.json({ error: "no_credentials" }, { status: 400 });
  }
  const { rpID } = rpFromHost(hostHeader());
  const options = await authOptions(rpID, store.credentials);
  const res = NextResponse.json(options);
  setChallenge(res, options.challenge);
  return res;
}
