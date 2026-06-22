// Edge-safe signed/expiring session tokens (works in middleware + node routes).
// token = base64url(payloadJSON) + "." + base64url(HMAC-SHA256(body))

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function createSession(secret: string, ttlMs: number): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify({ exp: Date.now() + ttlMs })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)));
  return body + "." + b64url(sig);
}

export async function verifySession(secret: string, token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const body = token.slice(0, dot);
  const sigStr = token.slice(dot + 1);
  let got: Uint8Array;
  try {
    got = unb64url(sigStr);
  } catch {
    return false;
  }
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)));
  if (expected.length !== got.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ got[i];
  if (diff !== 0) return false;
  try {
    const payload = JSON.parse(dec.decode(unb64url(body)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
