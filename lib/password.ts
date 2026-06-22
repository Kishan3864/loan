import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Hash a password with scrypt. Format: "<saltHex>:<hashHex>". */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64);
  return salt.toString("hex") + ":" + hash.toString("hex");
}

/** Constant-time verify a password against a stored scrypt hash. */
export function verifyPassword(pw: string, stored: string): boolean {
  const [saltHex, hashHex] = (stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const test = scryptSync(pw, salt, expected.length);
  return expected.length === test.length && timingSafeEqual(expected, test);
}
