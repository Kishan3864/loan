import { NextResponse } from "next/server";
import { SESSION_COOKIE, getPassword, getSecret } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: "" }));
  const password = String(body?.password ?? "");

  if (password === getPassword()) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, getSecret(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  return NextResponse.json(
    { ok: false, error: "Incorrect password — please try again" },
    { status: 401 },
  );
}
