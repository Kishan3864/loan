// Auth constants + helpers for the personal dashboard.
export const SESSION_COOKIE = "emi_session";
export const CHALLENGE_COOKIE = "emi_wa_chal";

export const getSecret = () =>
  process.env.APP_SESSION_SECRET || "emi-dashboard-secret-please-change";

/** Effective WebAuthn Relying-Party ID + origin, derived from the request host. */
export function rpFromHost(host: string | null): { rpID: string; origin: string } {
  const h = (host || "localhost:3000").split(":")[0];
  const isLocal = h === "localhost" || h === "127.0.0.1";
  const proto = isLocal ? "http" : "https";
  // origin must include the port for localhost dev
  const origin = isLocal ? `${proto}://${host}` : `${proto}://${h}`;
  return { rpID: h, origin };
}
