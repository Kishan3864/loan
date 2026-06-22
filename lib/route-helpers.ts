import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, CHALLENGE_COOKIE, getSecret } from "./auth";
import { verifySession } from "./session";

const secureCookie = () => process.env.NODE_ENV === "production";

export function setSession(res: NextResponse, token: string, maxAgeSec: number) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: maxAgeSec,
  });
}

export function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export function setChallenge(res: NextResponse, challenge: string) {
  res.cookies.set(CHALLENGE_COOKIE, challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    maxAge: 300,
  });
}

export function clearChallenge(res: NextResponse) {
  res.cookies.set(CHALLENGE_COOKIE, "", { path: "/", maxAge: 0 });
}

export function readCookie(name: string): string | undefined {
  return cookies().get(name)?.value;
}

export async function authed(): Promise<boolean> {
  return verifySession(getSecret(), cookies().get(SESSION_COOKIE)?.value);
}

export function hostHeader(): string | null {
  return headers().get("host");
}
