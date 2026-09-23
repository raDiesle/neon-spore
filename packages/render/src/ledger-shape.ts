import {
  type LedgerBead,
  type LedgerState,
  ledgerPhase,
  ledgerSeamCol,
  type SimConfig,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, type Layout, tileCX } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE LEDGER is**, in field pixels: the two halves of the body, the
 * cord between it and the hull, and every point on that cord a return has got
 * to.
 *
 * Its own file for `sinew-shape.ts`' reason, said about a cord instead of a
 * tendon: the halves are drawn from it (`ledger-draw.ts`), the bead and the
 * socket's lock are drawn *on* it by seat (`ledger-read.ts`), and the fx throws
 * its particles along it (`ledger-fx.ts`). A cord worked out in three files
 * would be a bead travelling one line and landing on another.
 *
 * **Nothing here reads the wall clock except the body's own wobble.** Where a
 * bead is has to be where the simulation says it is, so its place is the beat,
 * the phase and the bead's own span, and nothing else — the same discipline
 * `baton-draw.ts` keeps about a bead in flight.
 */

export interface Point {
  x: number;
  y: number;
}

/** Tiles the body stands above the grid's top edge, and reaches below it. */
const RISE = 2.1;
const DROP = 1.2;
/**
 * A half's width, in tiles — **half of `ledgerCols`, and not a look choice.**
 *
 * The simulation refuses a bolt up either flanking column because the body's
 * plating is over it (`ledgerCovers`, `ledgerRefused`), so the drawing has to
 * cover exactly the columns it refuses from or the refusal happens against
 * nothing the pair can see. It was `0.8` for one capture, which drew a body
 * half the width of the one the rules were being applied to.
 *
 * *Tall and narrow* is the design's word for it and it still holds against
 * these: three columns of eleven, and taller than it is wide.
 */
const HALF_W = 1.5;
/** The same, for `ledger-metal.ts`' bands and rivets to span. */
export const LEDGER_HALF_W = HALF_W;
/** How far apart the halves stand at a full seam, and once the cord is out. */
const GAP_MAX = 0.42;
const PART_MAX = 1.5;
/** The cord's bow while it is slack, in tiles, and how fast it sways. */
const BOW = 0.55;
const SWAY_HZ = 0.16;

/** The body's line: its top, its underside and the middle between them. */
export function ledgerBodyY(l: Layout): { top: number; bottom: number; mid: number; ry: number } {
  const top = l.gridTop - l.tile * RISE;
  const bottom = l.gridTop + l.tile * DROP;
  return { top, bottom, mid: (top + bottom) * 0.5, ry: (bottom - top) * 0.5 };
}

/** The column the seam runs down, in pixels: the one column a shot can hurt. */
export function ledgerSeamX(l: Layout, cfg: SimConfig, t: LedgerState): number {
  return tileCX(l, ledgerSeamCol(t, cfg));
}

/**
 * **How far apart the two halves stand**, in pixels — which is this boss's
 * health and the whole of it. No bar: one body, then a body with a line down
 * it, then two.
 *
 * The seam opens a share of `GAP_MAX` per hit and is thrown to `PART_MAX` once
 * the cord has torn out, so the last thing the picture does is the thing the
 * fight was for.
 */
export function ledgerGap(
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  beat: number,
  beatPhase: number,
): number {
  const open = Math.min(1, t.seam / Math.max(1, cfg.ledgerSeamHits));
  if (ledgerPhase(t, cfg, beat) !== "out") return l.tile * GAP_MAX * open;
  const gone = Math.min(1, (beat - t.outBeat + beatPhase) / Math.max(1, cfg.ledgerOutBeats));
  return l.tile * (GAP_MAX + (PART_MAX - GAP_MAX) * gone);
}

/**
 * One half of the body: a flat face down the seam and a lobed back.
 *
 * Bilateral by construction rather than by mirroring a whole blob and hoping
 * — the seam is a *cut*, so the inner side is the two straight points the cut
 * left and the outer side is the contour that was always there. `side` is -1
 * for the half to the left of the seam and 1 for the other.
 */
export function ledgerHalfPath(
  l: Layout,
  seamX: number,
  side: -1 | 1,
  gap: number,
  time: number,
): Path2D {
  const { top, bottom, mid, ry } = ledgerBodyY(l);
  const inner = seamX + side * gap * 0.5;
  const w = l.tile * HALF_W;
  const breathe = 1 + 0.04 * Math.sin(time * 1.1 + (side > 0 ? 1.7 : 0));
  const pts: Point[] = [
    { x: inner, y: top },
    { x: inner + side * w * 0.72 * breathe, y: top + ry * 0.28 },
    { x: inner + side * w * breathe, y: mid - ry * 0.22 },
    { x: inner + side * w * 0.66 * breathe, y: mid + ry * 0.34 },
    { x: inner + side * w * 0.84 * breathe, y: bottom - ry * 0.22 },
    { x: inner + side * w * 0.3, y: bottom },
    { x: inner, y: bottom },
  ];
  return splinePath(pts, true);
}

/**
 * **The whole body**, both halves and whatever is between them — centred on
 * the seam, as tall as the body stands and as wide as the plating a bolt is
 * refused by. `gap` is `ledgerGap`, so the ring widens with the seam the way
 * the body does; 0 is the body closed, which is how a caption asks for it
 * (`caption-anchor-boss-e.ts`).
 */
export function ledgerBodyBox(
  l: Layout,
  cfg: SimConfig,
  t: LedgerState,
  gap = 0,
): { x: number; y: number; rx: number; ry: number } {
  const { mid, ry } = ledgerBodyY(l);
  return { x: ledgerSeamX(l, cfg, t), y: mid, rx: l.tile * HALF_W + gap * 0.5, ry };
}

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
