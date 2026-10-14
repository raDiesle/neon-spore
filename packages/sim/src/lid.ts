import type { SimConfig } from "./config.js";
import { pullOpenMilli, tileCentreMilli } from "./handle-pull.js";
import type { Creature } from "./types.js";

/**
 * THE LID: an armoured eye, and the first body on the field that a hand has to
 * hold **open** while the other seat shoots into it.
 *
 * Two plates meet down the middle of the eye and a cord hangs off the bottom of
 * it. Player 1 takes the cord and pulls it aside; the plates part from the
 * middle outwards, by degrees, in proportion to the tension — and only at full
 * tension is the lens bare. Player 2 fires the lens's own colour up its column.
 * Once taut the lens stays bare however the hand eases — the one generic PULL,
 * counted at its reach — and a hand that lifts lets the plates close again,
 * so the opening lasts exactly as long as somebody is holding it.
 *
 * **It is THE CLASP's coupling made continuous, and that is the creature.** A
 * clasp is opened by a *moment* — the ward lands, the shield is off, and the
 * body underneath can be shot whenever the pair get round to it. A lid is
 * opened by a *hold*: the two halves have to happen at the same instant, in
 * two different hands, and neither seat can do the other's. So what the pair
 * has to say is not an order but a count — *now* — and the seat holding the
 * cord has their thumb somewhere other than the cannon strip while they say it.
 *
 * Nothing about it is hidden from either screen, and that is deliberate rather
 * than an omission: THE VEIL already owns the split where one seat can see a
 * colour and the other cannot, and a second copy of that would teach the pair
 * to look for something withheld instead of to synchronise. The colour is
 * authored on the arrival and shines out of the seam the whole way down, the
 * way a shell's does — what the armour buys is not surprise, it is *timing*.
 *
 * `render/lid.ts` draws the eye and its plates, `render/lid-string.ts` the cord
 * and its handle. The cord's one path is `lid-way.ts`, the hand on it
 * `lid-hand.ts`, a shot's answer `lid-struck.ts`. Everything here is integers
 * and the tick counter.
 */

/**
 * How far open a lid stands, 0..1000 — and so how far the plates have parted,
 * because they are the same number drawn twice.
 *
 * There is no easing anywhere between this and the picture. The gap between
 * the plates *is* player 2's readout of a hand they cannot see, and a readout
 * that lags the rule is a readout that lies at exactly the moment somebody is
 * deciding to fire. `wardenPullMilli` makes the same argument about a hatch.
 * Once the cord has counted it reads full open until the lift, because the
 * lens is bare until then (`lidIsOpen`) and the plates must say so.
 */
export function lidOpenMilli(cfg: SimConfig, c: Creature): number {
  if (c.lidPullMilli === undefined) return 0;
  if (c.lidCounted) return 1000;
  return pullOpenMilli(c.lidPullMilli, cfg.lidTautMilli);
}

/**
 * Which side of the body the cord hangs on: **the side toward the middle of
 * the field**, +1 for the right and -1 for the left. The owner asked for the
 * handle beside the eye rather than under it (11 September 2026), and beside
 * means one side or the other: the one with the room, so a lid against a wall
 * never hangs its handle into it and a hand pulling *away* from the body has
 * the width of the field to do it in. A lid dead centre hangs it on the left.
 */
export function lidSide(cfg: SimConfig, c: Creature): -1 | 1 {
  return c.col * 2 + 1 < cfg.cols ? 1 : -1;
}

/** Where this lid's cord hangs with no hand on it, in thousandths of a tile —
 * `lidCordMilli` beside the body's own centre, on `lidSide`. The one place it
 * is said, so the clamp that keeps the handle on the field and the cord render
 * draws to it cannot disagree about where it starts. */
export function cordRest(cfg: SimConfig, c: Creature): { x: number; y: number } {
  const centre = tileCentreMilli(c.col, c.row);
  return { x: centre.x + lidSide(cfg, c) * cfg.lidCordMilli, y: centre.y };
}

/**
 * Whether the lens is bare this instant — the only window a shot counts in:
 * the cord held, and pulled taut at some point of this hold. It is the one
 * generic PULL (`pull.ts`), counted once at its reach (the lane's (b), 14
 * October 2026), so a hand that eases after the plates parted keeps them
 * parted until it lets go.
 *
 * **The raw pull against the raw threshold, never the readout above**, is
 * where the count is made (`lidHeard`): `lidOpenMilli` rounds, so a hand a
 * thousandth of a tile short of taut reads as a full thousand, and the
 * rounding belongs to the picture and must never decide a hit.
 */
export function lidIsOpen(_cfg: SimConfig, c: Creature): boolean {
  return c.lidPullMilli !== undefined && c.lidCounted === true;
}

/** Whether a hand is on this lid's cord at all. Absent is the whole of "no
 * hand": a grab reports zero, so a lid being held from its resting position
 * still has a field, and one nobody has hold of has none. */
export function lidIsHeld(c: Creature): boolean {
  return c.lidPullMilli !== undefined;
}
