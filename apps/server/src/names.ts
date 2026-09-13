import { isName, NAME_MINE_ROUTE, NAME_ROUTE, normalizeName, TAKEN_MESSAGE } from "@neon-spore/net";
import { type SignInEnv, signedSubject } from "./sign-in.js";

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
 * nobody. What survives a phone is a **sign-in** — Firebase's `sub`, checked
 * by `sign-in.ts` — and a claim that arrives with one binds the name to it.
 * From then on a device that signs in as that person is given the name back
 * and the claim moves to it, which is the whole of recovery, and the device
 * it moved from is refused on its next visit — which is what a stolen phone
 * needs. Nobody has to sign in to play: a claim without one is the token's
 * alone, and the settings page says what that costs. This replaced a
 * four-letter recovery code on 13 September 2026, on the owner's decision.
 *
 * **A name that is somebody else's answers exactly as a taken name does**,
 * whether the asker is anonymous or signed in as the wrong person. Otherwise
 * this route is a way to ask which names are bound to a sign-in.
 */

/** What a claim holds. Keyed by the normalized name, lower-cased. */
interface Claim {
  /** The name as it was typed, which is what gets drawn. */
  name: string;
  /** The device that holds it. */
  token: string;
  /** The person it belongs to, when one has signed in. "" until then. */
  subject: string;
}

/** The key a name is stored under: case-folded, so DAVID and David are one name. */
export function nameKey(name: string): string {
  return `name:${name.toLowerCase()}`;
}

/** The key a sign-in's name is found under: one name per person. */
function subjectKey(subject: string): string {
  return `subject:${subject}`;
}

/** What the routes answer. */
export interface ClaimResult {
  ok: boolean;
  /** The name as stored, when the claim stands. */
  name?: string;
  /** Why not, for the screen. One sentence, and always the same one. */
  why?: string;
}

export class Names {
  private readonly ctx: DurableObjectState;
  private readonly env: SignInEnv;

  constructor(ctx: DurableObjectState, env: SignInEnv) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") return new Response("expected POST", { status: 405 });
    let body: { name?: unknown; token?: unknown; idToken?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return Response.json({ ok: false, why: "bad request" }, { status: 400 });
    }
    const token = typeof body.token === "string" ? body.token : "";
    const idToken = typeof body.idToken === "string" ? body.idToken : "";
    if (token === "") return Response.json({ ok: false, why: "bad request" }, { status: 400 });
    const subject = await signedSubject(idToken, this.env);
    const path = new URL(request.url).pathname;
    if (path === NAME_MINE_ROUTE) {
      if (subject === "")
        return Response.json({ ok: false, why: "not signed in" }, { status: 401 });
      return Response.json(await this.mine(subject, token));
    }
    if (path !== NAME_ROUTE) return new Response("not found", { status: 404 });
    const name = normalizeName(typeof body.name === "string" ? body.name : "");
    if (!isName(name)) return Response.json({ ok: false, why: "bad request" }, { status: 400 });
    return Response.json(await this.claim(name, token, subject));
  }

  /** The whole of the registry's decision, away from HTTP so a test can call it. */
  async claim(name: string, token: string, subject: string): Promise<ClaimResult> {
    const key = nameKey(name);
    const held = await this.ctx.storage.get<Claim>(key);

    if (held) {
      // The device that already holds it, coming back — and, if it has signed
      // in since, the moment the name becomes that person's.
      if (held.token === token) {
        if (subject !== "" && held.subject !== subject) await this.bind(key, held, subject);
        return { ok: true, name: held.name };
      }
      // The person it belongs to, on a new device. The claim moves here and
      // the old device is refused from now on.
      if (subject !== "" && held.subject === subject) {
        await this.ctx.storage.put(key, { ...held, name, token });
        return { ok: true, name };
      }
      // Somebody else's — or bound to a sign-in this is not. One sentence for
      // both, so nothing can be learned by asking.
      return { ok: false, why: TAKEN_MESSAGE };
    }

    // Free. A signed-in person has one name: taking a new one releases the
    // one they held, which is what changing a name means.
    const claim: Claim = { name, token, subject };
    await this.ctx.storage.put(key, claim);
    if (subject !== "") await this.bind(key, claim, subject);
    return { ok: true, name };
  }

  /** The name this person holds, moved to this device. */
  async mine(subject: string, token: string): Promise<ClaimResult> {
    const key = await this.ctx.storage.get<string>(subjectKey(subject));
    const held = key ? await this.ctx.storage.get<Claim>(key) : undefined;
    if (!key || !held) return { ok: false, why: "no name yet" };
    if (held.token !== token) await this.ctx.storage.put(key, { ...held, token });
    return { ok: true, name: held.name };
  }

  /** Make `key` this person's one name, releasing whichever one it was before. */
  private async bind(key: string, claim: Claim, subject: string): Promise<void> {
    const before = await this.ctx.storage.get<string>(subjectKey(subject));
    if (before && before !== key) await this.ctx.storage.delete(before);
    await this.ctx.storage.put(key, { ...claim, subject });
    await this.ctx.storage.put(subjectKey(subject), key);
  }
}
