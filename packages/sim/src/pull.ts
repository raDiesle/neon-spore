/**
 * **The one generic PULL** — the owner, 10 October 2026, taking PULL PAST A
 * DISTANCE's SUGGESTED line: one rule for every handle a thumb carries a
 * distance, with the direction a named field and one drawn arrow. The PULL
 * LAB's toy rule (`tools/director/src/pull-lab-rule.ts`) is its
 * specification, in seconds; this is the same rule in thousandths, on the
 * tick, where both phones keep it.
 *
 * - **The direction is a field** (`PullWay`), never a function of its own in
 *   a hand file: `down` and `up` count travel one way and none the other,
 *   `either` counts it whichever way, and `signed` is a sideways pull whose
 *   one way is asked by the thing it hangs on — a zone's inward, a swipe's
 *   arrow — and given as its `sign`.
 * - **A pull counts the moment it has gone its whole reach**, once: the
 *   caller says whether this hold has already counted, and the rule answers
 *   `counted` only on the command that first meets the reach — a move, or
 *   the lift when the hand let go the instant it got there.
 * - **A short lift is refused** — the owner, 10 October 2026, in the PULL
 *   LAB: *for the tolerance variants i prefer "short * red"*. A lift that
 *   carried the knob at least `PULL_TAP_MILLI` and not the whole way is
 *   `short`, and the caller says so with `pullShort`, which the pair hears;
 *   the knob going home red is the renderer's (`render/pull-memory.ts`).
 *   Less than that is a tap, and a tap is never refused.
 *
 * The travel is the hand's displacement along the pull's own axis, in
 * thousandths of a tile, down and right positive — `fromYMilli` for a pull
 * that runs up or down the field, `fromMilli` for one across it — so the
 * axis stays the caller's and the rule is the same for every one.
 */

/** Which way a pull counts: `docs/spec` PULL PAST A DISTANCE's four. */
export type PullWay = "down" | "up" | "either" | "signed";

/** A pull: its way and how far it has to go, in thousandths of a tile. */
export interface Pull {
  way: PullWay;
  reachMilli: number;
  /** A `signed` pull's asked way along its axis: 1 for right or down, -1 for left or up. */
  sign?: 1 | -1;
}

/** What a hand on a pull came to on one command. */
export type PullHeard =
  /** Held, short of the reach or past it once it has counted. */
  | "held"
  /** The reach met, for the first time this hold: the caller's count. */
  | "counted"
  /** Let go part way: refused, and said. */
  | "short"
  /** Let go after it counted, or before it went anywhere: nothing to say. */
  | "home";

/**
 * How far short of nothing a lift has to have carried the knob to be refused,
 * thousandths of a tile — the lab's 0.04 of a pull (`pull-lab-rule.ts`) on
 * the shortest reach the game has, so a thumb that only rested on the knob
 * is a tap.
 */
export const PULL_TAP_MILLI = 40;

/**
 * The travel along `p`'s way, cut to its reach: none the wrong way for
 * `down`, `up` and `signed`, and the size either way for `either`.
 */
export function pullTravelMilli(p: Pull, along: number): number {
  const d = Math.round(along);
  const size =
    p.way === "down"
      ? d
      : p.way === "up"
        ? -d
        : p.way === "signed"
          ? (p.sign ?? 1) * d
          : Math.abs(d);
  return Math.max(0, Math.min(p.reachMilli, size));
}

/**
 * One drag command read against `p`: `on` and `along` as the command says
 * them, `counted` whether this hold has already counted. What comes back is
 * the travel to keep — none once it is let go — and what the hand came to.
 */
export function pullHeard(
  p: Pull,
  counted: boolean,
  on: boolean,
  along: number,
): { travelMilli: number; heard: PullHeard } {
  const travel = pullTravelMilli(p, along);
  if (on) {
    return { travelMilli: travel, heard: !counted && travel >= p.reachMilli ? "counted" : "held" };
  }
  // A lift that carries the whole reach met it too: the hand went the whole
  // way, and the move that said so may have been the lift itself.
  if (!counted && travel >= p.reachMilli) return { travelMilli: 0, heard: "counted" };
  return { travelMilli: 0, heard: !counted && travel >= PULL_TAP_MILLI ? "short" : "home" };
}
