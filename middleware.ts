import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getSecret } from "@/lib/auth";

/**
 * Build an absolute redirect URL from the *forwarded* host/proto headers.
 * Behind a reverse proxy (nginx), req.url reflects the internal bind address
 * (127.0.0.1:3011), so we must use the original Host the browser asked for.
 */
function redirectTo(req: NextRequest, path: string) {
  const host = req.headers.get("host");
  if (!host) return NextResponse.redirect(new URL(path, req.url));
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return NextResponse.redirect(`${proto}://${host}${path}`);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get(SESSION_COOKIE)?.value === getSecret();

  if (pathname === "/login") {
    if (authed) return redirectTo(req, "/");
    return NextResponse.next();
  }

  if (!authed) {
    return redirectTo(req, "/login");
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // protect everything except auth APIs, static assets and PWA files
    "/((?!api/login|api/logout|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|robots.txt).*)",
  ],
};
