import { httpOrigin } from "./origin.js";

/**
 * A signed-in person with no Google behind them, so a check can be one.
 *
 * Signing in for real needs a Google account and a mailbox, which a session
 * neither has nor should be given — so everything behind `idToken()` was read
 * off the source and had never run: `syncName` filling the first meeting's
 * field with the name the registry hands back, the same call reconciling a
 * name this phone typed, the SETTINGS row saying who is logged in.
 *
 * This is the smaller of the two ways out named when that was found — the
 * other being Firebase's own auth emulator, which is truer and is a Java
 * dependency in the tree. What stands in is **Google's chooser and nothing
 * else**: the press on LOG IN WITH GOOGLE, the listeners it wakes and every
 * caller behind them are the shipped ones, and the token handed over is a real
 * one the registry verifies, minted by the check the way
 * `apps/server/test/signed.ts` mints one.
 *
 * **It refuses to exist anywhere it could matter.** An offer is taken only
 * against a relay on this machine, so a deployed game cannot be talked into
 * one however it is asked.
 *
 * Its own file rather than a second half of `sign-in.ts`, which is at its
 * size; the seam is unchanged, because the rest of the app still asks
 * `sign-in.ts` the same three questions.
 */

/** A signed-in person the check invents. */
export interface StandIn {
  /** What the settings row and the first meeting call them. */
  email: string;
  /** A token the registry will take, asked for afresh the way Firebase's is. */
  token: () => Promise<string>;
}

/** The account our own button hands back, once a check has put one there. */
let offered: StandIn | null = null;
/** Whoever is signed in this way, which is nobody until the press. */
let standing: StandIn | null = null;

/** The hosts an offer is allowed against: this machine, and nowhere else. */
const LOCAL = /^(?:localhost|127\.0\.0\.1|\[::1\])$/;

/**
 * Whether a stand-in could exist here at all.
 *
 * The relay is where a name is claimed (`origin.ts`), so it is the thing to
 * ask about: a page talking to a worker on this machine is a checkout being
 * checked, and a page talking to anything else is somebody playing.
 */
export function standInAllowed(): boolean {
  try {
    return LOCAL.test(new URL(httpOrigin()).hostname);
  } catch {
    return false;
  }
}

/**
 * Put an account behind the button, or take it away again — and say whether it
 * was allowed to, because a caller that is refused has proved nothing and must
 * not carry on as though it had.
 */
export function offerStandIn(who: StandIn | null): boolean {
  if (who !== null && !standInAllowed()) return false;
  offered = who;
  if (who === null) standing = null;
  return true;
}

/** Whether Firebase should be left alone: an offer taken or waiting is both. */
export function standInInPlay(): boolean {
  return offered !== null || standing !== null;
}

/** Whoever is signed in without Firebase, or `null`. */
export function standIn(): StandIn | null {
  return standing;
}

/** The press: sign in as the offer, if there is one. */
export function takeStandIn(): boolean {
  if (!offered) return false;
  standing = offered;
  return true;
}

/** And out again, answering whether anybody was signed in to begin with. */
export function dropStandIn(): boolean {
  const was = standing !== null;
  standing = null;
  return was;
}
