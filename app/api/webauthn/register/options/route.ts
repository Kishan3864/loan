import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { rpFromHost } from "@/lib/auth";
import { regOptions } from "@/lib/webauthn";
import { authed, setChallenge, hostHeader } from "@/lib/route-helpers";

export async function POST() {
  if (!(await authed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const store = await getStore();
  const { rpID } = rpFromHost(hostHeader());
  const options = await regOptions(rpID, store.credentials);
  const res = NextResponse.json(options);
  setChallenge(res, options.challenge);
  return res;
}
