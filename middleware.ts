import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getSecret } from "@/lib/auth";
import { verifySession } from "@/lib/session";

// Paths reachable without a session (login page + auth endpoints).
const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/api/login",
  "/api/logout",
  "/api/webauthn/available",
  "/api/webauthn/auth/options",
  "/api/webauthn/auth/verify",
]);

/** Build an absolute redirect from the forwarded Host/proto (works behind nginx). */
function redirectTo(req: NextRequest, path: string) {
  const host = req.headers.get("host");
  if (!host) return NextResponse.redirect(new URL(path, req.url));
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return NextResponse.redirect(`${proto}://${host}${path}`);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySession(getSecret(), req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (authed) return redirectTo(req, "/");
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  if (!authed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return redirectTo(req, "/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // run on everything except Next internals, static assets and PWA files
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|apple-splash|robots.txt).*)",
  ],
};
