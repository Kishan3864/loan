import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type { StoredCredential } from "./store";

const RP_NAME = "EMI Dashboard";
const enc = new TextEncoder();

export function regOptions(rpID: string, existing: StoredCredential[]) {
  return generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userID: enc.encode("emi-owner"),
    userName: "owner",
    userDisplayName: "EMI Dashboard Owner",
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[] | undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });
}

export function verifyReg(opts: {
  response: any;
  expectedChallenge: string;
  origin: string;
  rpID: string;
}) {
  return verifyRegistrationResponse({
    response: opts.response,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: opts.origin,
    expectedRPID: opts.rpID,
    requireUserVerification: true,
  });
}

export function authOptions(rpID: string, creds: StoredCredential[]) {
  return generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransport[] | undefined,
    })),
  });
}

export function verifyAuth(opts: {
  response: any;
  expectedChallenge: string;
  origin: string;
  rpID: string;
  cred: StoredCredential;
}) {
  return verifyAuthenticationResponse({
    response: opts.response,
    expectedChallenge: opts.expectedChallenge,
    expectedOrigin: opts.origin,
    expectedRPID: opts.rpID,
    requireUserVerification: true,
    credential: {
      id: opts.cred.id,
      publicKey: new Uint8Array(Buffer.from(opts.cred.publicKey, "base64url")),
      counter: opts.cred.counter,
      transports: opts.cred.transports as AuthenticatorTransport[] | undefined,
    },
  });
}

export function pkToB64url(pk: Uint8Array): string {
  return Buffer.from(pk).toString("base64url");
}
