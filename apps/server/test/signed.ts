/**
 * A Firebase ID token, forged by the test — the one place a forgery is right.
 *
 * `sign-in.ts` verifies against whatever key set `SIGN_IN_KEYS` names, so a
 * test makes its own RSA pair, publishes the public half as a JWK set the way
 * Google does, and signs tokens with the private half. What that proves is
 * that the check reads the token Firebase's documentation describes; that
 * Google's real keys are where `GOOGLE_KEYS` says is unverified from any test
 * and verified by the first real sign-in.
 */

const ALG = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } as const;

export const PROJECT = "neon-spore-test";
export const KID = "test-key-1";

export interface Signer {
  /** The `vars` that make the worker trust this signer. */
  vars: { FIREBASE_PROJECT: string; SIGN_IN_KEYS: string };
  /** A valid token for `subject`, or one with the claims the test wants wrong. */
  token: (subject: string, claims?: Record<string, unknown>) => Promise<string>;
}

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function part(value: unknown): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

export async function signer(): Promise<Signer> {
  const pair = await crypto.subtle.generateKey(
    { ...ALG, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) },
    true,
    ["sign", "verify"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const keys = { keys: [{ ...jwk, kid: KID, use: "sig", alg: "RS256" }] };
  return {
    vars: { FIREBASE_PROJECT: PROJECT, SIGN_IN_KEYS: JSON.stringify(keys) },
    async token(subject, claims = {}) {
      const now = Math.floor(Date.now() / 1000);
      const body = {
        iss: `https://securetoken.google.com/${PROJECT}`,
        aud: PROJECT,
        sub: subject,
        iat: now - 5,
        exp: now + 3600,
        ...claims,
      };
      const head = { alg: "RS256", kid: KID, ...(claims.kid ? { kid: claims.kid } : {}) };
      const signed = `${part(head)}.${part(body)}`;
      const sig = await crypto.subtle.sign(ALG, pair.privateKey, new TextEncoder().encode(signed));
      return `${signed}.${toBase64Url(new Uint8Array(sig))}`;
    },
  };
}
