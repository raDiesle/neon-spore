import { isName, normalizeName, TAKEN_MESSAGE } from "@neon-spore/net";

/**
 * The name registry: one Durable Object holding every claimed name.
 *
 * A name is how the other phone knows who is in the other seat, so two people
 * called DAVID in the same room is the one thing it must not be possible to
 * be. Uniqueness needs somewhere to be unique *in*, and a room is the wrong
 * place — rooms come and go, and the pair who play tomorrow are the same two
 * people. So there is exactly one of these, reached over a small HTTP route on
 * the worker.
 *
 * **Not the room socket.** The relay stays a dumb relay that never looks
 * inside anything (rule 2 of the `net-change` skill), and a claim has nothing
 * to do with lockstep — it happens before a room exists and never again. It
 * needs no relay to prove, which is why `test/names.test.ts` can drive the
 * whole of it.
 *
 * **A claim belongs to a device token**, which the browser generates and
 * keeps. Re-claiming the same name with the same token is how a returning
 * device keeps its own name, and it must answer yes rather than "taken" —
 * otherwise the second visit locks a player out of the name they chose.
 *
 * **And a token dies with the browser's storage.** A new phone, cleared site
 * data, a private window: the token is gone and the name is held for ever by
 * nobody. So a successful claim mints a short **recovery code**, shown once,
 * and a name plus its code moves the claim to a new token. No accounts, no
 * email, nothing new kept on the device but the token it already had.
 *
 * **A wrong code answers exactly as a taken name does.** Otherwise this route
 * is a way to ask which names exist, one guess at a time.
 */

/** What a claim holds. Keyed by the normalized name, lower-cased. */
interface Claim {
  /** The name as it was typed, which is what gets drawn. */
  name: string;
  /** The device that holds it. */
  token: string;
  /** The code that moves it to another device. Never leaves except on minting. */
  code: string;
}

/**
 * The recovery code's alphabet and length.
 *
 * The room code's alphabet, for the same reason it has one: this is read off a
 * screen and typed on another, sometimes by somebody reading it aloud, so a
 * `0` that might be an `O` is a support conversation. Four characters against
 * a 25-letter alphabet is about 390 000 codes — and a wrong guess is
 * indistinguishable from a taken name, so guessing tells an attacker nothing
 * about whether they are close.
 */
const CODE_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";
const CODE_LENGTH = 4;

function mintCode(random: Uint8Array): string {
  let out = "";
  for (const byte of random) out += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return out;
}

/** The key a name is stored under: case-folded, so DAVID and David are one name. */
export function nameKey(name: string): string {
  return `name:${name.toLowerCase()}`;
}

/** What the route answers. `code` is present only on a fresh mint. */
export interface ClaimResult {
  ok: boolean;
  /** The name as stored, when the claim stands. */
  name?: string;
  /** Shown once, on a fresh claim only. */
  code?: string;
  /** Why not, for the screen. One sentence, and always the same one. */
  why?: string;
}

export class Names {
  private readonly ctx: DurableObjectState;

  constructor(ctx: DurableObjectState) {
    this.ctx = ctx;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return new Response("expected POST", { status: 405 });
    let body: { name?: unknown; token?: unknown; code?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return Response.json({ ok: false, why: "bad request" }, { status: 400 });
    }
    const name = normalizeName(typeof body.name === "string" ? body.name : "");
    const token = typeof body.token === "string" ? body.token : "";
    const code = typeof body.code === "string" ? body.code.toUpperCase() : "";
    if (!isName(name) || token === "") {
      return Response.json({ ok: false, why: "bad request" }, { status: 400 });
    }
    return Response.json(await this.claim(name, token, code));
  }

  /** The whole of the registry's decision, away from HTTP so a test can call it. */
  async claim(name: string, token: string, code: string): Promise<ClaimResult> {
    const key = nameKey(name);
    const held = await this.ctx.storage.get<Claim>(key);

    if (held) {
      // The device that already holds it, coming back. Idempotent, and no new
      // code: the one it was given still works, and minting a second would
      // quietly invalidate whatever the player wrote down.
      if (held.token === token) return { ok: true, name: held.name };
      // Somebody else's, and the right code moves it here. A wrong one is
      // refused in exactly the words a taken name is refused in.
      if (code !== "" && code === held.code) {
        await this.ctx.storage.put(key, { ...held, name, token });
        return { ok: true, name };
      }
      return { ok: false, why: TAKEN_MESSAGE };
    }

    // Free. The code is minted here and never on the client, and this is the
    // one moment it is ever sent.
    const minted = mintCode(crypto.getRandomValues(new Uint8Array(CODE_LENGTH)));
    await this.ctx.storage.put(key, { name, token, code: minted });
    return { ok: true, name, code: minted };
  }
}
