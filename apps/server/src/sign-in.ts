/**
 * Who signed in, read off a Firebase ID token — checked here, never trusted.
 *
 * The game's sign-in is Firebase Auth (Google, or an email link), decided by
 * the owner on 13 September 2026, and it runs entirely in the browser: the
 * Worker never talks to Firebase. What the browser sends with a claim is the
 * **ID token** Firebase gave it — an RS256 JWT signed by Google, whose `sub`
 * is the one stable thing about a person across phones. The Worker checks
 * the signature against Google's published keys and reads `sub` out, and
 * that string is what a name is bound to.
 *
 * **No library.** The token is three base64url parts, the key is a JWK and
 * WebCrypto verifies RSASSA-PKCS1-v1_5 natively — about the size of the
 * dependency's import list. What is checked is what Firebase's own
 * documentation lists: `alg`, `kid` naming a published key, `iss` and `aud`
 * naming the project, `exp` in the future, `iat` in the past, `sub`
 * non-empty.
 *
 * **Two variables on the Worker.** `FIREBASE_PROJECT` is the project id;
 * without it nothing is verified and every claim is an anonymous one, which
 * is how a checkout without a Firebase project behaves. `SIGN_IN_KEYS` is a
 * JWK set to trust *instead of* Google's — set by `test/sign-in.test.ts`,
 * which signs tokens with a key pair it made, and by nothing else.
 */

export interface SignInEnv {
  FIREBASE_PROJECT?: string;
  SIGN_IN_KEYS?: string;
}

/** Where Google publishes the keys that sign Firebase ID tokens. */
const GOOGLE_KEYS =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

/** A token that is late by this much is still a token: phones' clocks drift. */
const SKEW_SECONDS = 60;

/** A published key: a JWK with the `kid` a token's header names. */
type NamedKey = JsonWebKey & { kid?: string };

interface KeySet {
  keys: NamedKey[];
}

/** Google's keys, held until the `Cache-Control` they came with runs out. */
let held: { keys: NamedKey[]; until: number } | null = null;

async function keySet(env: SignInEnv): Promise<NamedKey[]> {
  if (env.SIGN_IN_KEYS) return (JSON.parse(env.SIGN_IN_KEYS) as KeySet).keys;
  if (held && held.until > Date.now()) return held.keys;
  const res = await fetch(GOOGLE_KEYS);
  if (!res.ok) throw new Error(`Google's keys answered ${res.status}`);
  const set = (await res.json()) as KeySet;
  const age = /max-age=(\d+)/.exec(res.headers.get("cache-control") ?? "");
  held = { keys: set.keys, until: Date.now() + Number(age?.[1] ?? 300) * 1000 };
  return held.keys;
}

function fromBase64Url(part: string): Uint8Array {
  const padded = part
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(part.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function jsonPart(part: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(part))) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * The `sub` of a valid token for this project, or "" for anything else — a
 * token that is malformed, forged, expired, for another project, or sent to a
 * Worker with no project to check it against. Every refusal is "", because
 * the registry has one answer for "not signed in" and needs no second.
 */
export async function signedSubject(idToken: string, env: SignInEnv): Promise<string> {
  const project = env.FIREBASE_PROJECT ?? "";
  if (project === "" || idToken === "") return "";
  const parts = idToken.split(".");
  if (parts.length !== 3) return "";
  const [head, body, sig] = parts as [string, string, string];
  const header = jsonPart(head);
  const claims = jsonPart(body);
  if (!header || !claims) return "";
  if (header.alg !== "RS256" || typeof header.kid !== "string") return "";

  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== `https://securetoken.google.com/${project}`) return "";
  if (claims.aud !== project) return "";
  if (typeof claims.exp !== "number" || claims.exp + SKEW_SECONDS < now) return "";
  if (typeof claims.iat !== "number" || claims.iat - SKEW_SECONDS > now) return "";
  if (typeof claims.sub !== "string" || claims.sub === "") return "";

  let keys: NamedKey[];
  try {
    keys = await keySet(env);
  } catch {
    return "";
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return "";
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const ok = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      fromBase64Url(sig),
      new TextEncoder().encode(`${head}.${body}`),
    );
    return ok ? claims.sub : "";
  } catch {
    return "";
  }
}
