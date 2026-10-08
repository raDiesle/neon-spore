import type { LedgerBead, LedgerState, SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, type Layout, tileCX } from "./layout.js";
import { ledgerBodyY, ledgerSeamX, type Point } from "./ledger-shape.js";

/**
 * **Where THE LEDGER's cord is**, in field pixels: where it leaves the body
 * and where it goes into the ship, how taut it hangs, every point along it
 * and how far down it a return has got.
 *
 * Its own file for `sinew-shape.ts`' reason, said about a cord instead of a
 * tendon: the cord is drawn from it (`ledger-cord.ts`), the bead and the
 * socket's lock are drawn *on* it by seat (`ledger-read.ts`), and the haul
 * is drawn along it (`ledger-haul.ts`). A cord worked out in three files
 * would be a bead travelling one line and landing on another. The body it
 * hangs from is `ledger-shape.ts`.
 *
 * **Nothing here reads the wall clock except the cord's own sway.** Where a
 * bead is has to be where the simulation says it is, so its place is the beat,
 * the phase and the bead's own span, and nothing else — the same discipline
 * `baton-draw.ts` keeps about a bead in flight.
 */

/** The cord's bow while it is slack, in tiles, and how fast it sways. */
const BOW = 0.55;
const SWAY_HZ = 0.16;

/** Where the cord goes into the ship: the socket's column, at the hull line. */
export function ledgerSocketPoint(l: Layout, t: LedgerState): Point {
  return { x: tileCX(l, t.socket), y: l.hullY };
}

/**
 * How far above the hull line her one ring hangs, in tiles
 * (`ledger-grip.ts`).
 *
 * **A tile and a fifth, which is what the lock costs.** Half a tile was the
 * first figure and the first frame taken of it was the argument against: the
 * dial sweeps `DIAL_RADII` out from the ring, so at full grace it closes into
 * a circle wider than the white lock's own brackets and stood on top of them
 * — and that lock is the one mark on her screen naming the column the plate
 * has to be in (`ledger-read.ts`). A whole tile was the second, and the second
 * frame was the argument against that: the dial's bottom came down onto the
 * lock's top bracket and the two read as one mark, because the grommet is
 * drawn on the **bowed** skin and that skin stands proud of the hull line
 * where the plating crests — which is exactly where a rooted cord tends to be.
 * The fifth is that bow, paid for once here rather than sampled: the dial
 * clears the bracket over any crest this hull makes.
 *
 * Read off `l.hullY` and not off the bowed skin the grommet is drawn on
 * (`ledger-root.ts`, `surfaceY`): that skin is a function of x a draw file is
 * handed and a hit test is not, and it is never more than a fraction of a tile
 * off the line — THE UNDERTOW's ruling about this same edge of this same ship.
 * A ring is a ring and not a trace.
 */
const ROOT_UP = 1.2;

/**
 * **Her one ring on the root of the cord**: the foot while it is still paying
 * out, her thumb in the socket after (`ledger-grip.ts`).
 *
 * Here rather than with the drawing because the *reading* wants it too — the
 * word that stands in `rooting` stands on this circle and drops its own frame,
 * a ring being a mark already (`boss-cue-read-o.ts`, `boss-cue-draw.ts`) — and
 * a handle placed in one file and written about in another is two numbers that
 * drift.
 *
 * It **moves under her own thumb** while she is walking the foot, because
 * `foot` writes `t.socket` on the tick it reads the carry (`sim/ledger-hand.ts`).
 */
export function ledgerRootCircle(l: Layout, cfg: SimConfig, t: LedgerState): Circle {
  return {
    x: tileCX(l, t.socket),
    y: l.hullY - l.tile * ROOT_UP,
    r: handleRadius(l, cfg),
  };
}

/** Where the cord leaves the body: the underside, between the two halves. */
export function ledgerRootPoint(l: Layout, cfg: SimConfig, t: LedgerState): Point {
  return { x: ledgerSeamX(l, cfg, t), y: ledgerBodyY(l).bottom };
}

/**
 * **How taut the cord is**, 0..1 — a share of the seam, so it goes straight as
 * the fight is won. The design's own beat 12: at four of five it is taut
 * enough to be drawn as a straight line for the first time.
 */
export function ledgerTaut(cfg: SimConfig, t: LedgerState): number {
  return Math.min(1, t.seam / Math.max(1, cfg.ledgerSeamHits - 1));
}

/** The cord's one control point: a bow that straightens as the seam fills. */
function bendOf(l: Layout, from: Point, to: Point, taut: number, time: number): Point {
  const bow = l.tile * BOW * (1 - taut) * Math.sin(time * SWAY_HZ * Math.PI * 2);
  return { x: (from.x + to.x) * 0.5 + bow, y: (from.y + to.y) * 0.5 };
}

/** A point `u` of the way down the cord, 0 at the body and 1 at the socket. */
export function ledgerCordAt(
  l: Layout,
  from: Point,
  to: Point,
  taut: number,
  time: number,
  u: number,
): Point {
  const c = bendOf(l, from, to, taut, time);
  const k = 1 - u;
  return {
    x: k * k * from.x + 2 * u * k * c.x + u * u * to.x,
    y: k * k * from.y + 2 * u * k * c.y + u * u * to.y,
  };
}

/**
 * **How far down the cord a return has got**, 0..1, off the beat and the phase.
 *
 * Read from the bead's own span rather than from the config's cadence, because
 * the cadence shortens as the seam widens and a bead that started at four
 * beats is still a four-beat bead (`sim/ledger.ts`, `LedgerBead`).
 */
export function ledgerBeadU(b: LedgerBead, beat: number, beatPhase: number): number {
  const left = b.beat - beat - beatPhase;
  return Math.max(0, Math.min(1, 1 - left / Math.max(1, b.span)));
}

/** How far down the cord the soonest return has come, 0..1; 0 with none on it. */
export function ledgerBeadNear(t: LedgerState, beat: number, beatPhase: number): number {
  let most = 0;
  for (const b of t.beads) {
    const left = b.beat - beat - beatPhase;
    const u = Math.max(0, Math.min(1, 1 - left / Math.max(1, b.span)));
    if (u > most) most = u;
  }
  return most;
}
