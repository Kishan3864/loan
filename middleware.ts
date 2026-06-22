import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getSecret } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get(SESSION_COOKIE)?.value === getSecret();

  if (pathname === "/login") {
    if (authed) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // protect everything except auth APIs, static assets and PWA files
    "/((?!api/login|api/logout|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|robots.txt).*)",
  ],
};
