import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

export function biometricSupported(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function registerFingerprint(name: string): Promise<void> {
  const optRes = await fetch("/api/webauthn/register/options", { method: "POST" });
  if (!optRes.ok) throw new Error("Could not start enrolment");
  const optionsJSON = await optRes.json();
  const attResp = await startRegistration({ optionsJSON });
  const verifyRes = await fetch("/api/webauthn/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: attResp, name }),
  });
  if (!verifyRes.ok) {
    const e = await verifyRes.json().catch(() => ({}));
    throw new Error(e.error || "Enrolment failed");
  }
}

export async function loginFingerprint(): Promise<void> {
  const optRes = await fetch("/api/webauthn/auth/options", { method: "POST" });
  if (!optRes.ok) throw new Error("No fingerprint is set up on this account");
  const optionsJSON = await optRes.json();
  const asseResp = await startAuthentication({ optionsJSON });
  const verifyRes = await fetch("/api/webauthn/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response: asseResp }),
  });
  if (!verifyRes.ok) {
    const e = await verifyRes.json().catch(() => ({}));
    throw new Error(e.error || "Fingerprint login failed");
  }
}
