import { type LedgerState, ledgerPhase, ledgerSeamCol, type SimConfig } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { platedBack } from "./ledger-shape-plated-back.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE LEDGER is**, in field pixels: the two halves of the body, how
 * far apart they stand and the seam between them. The cord between the body
 * and the hull is `ledger-cord-shape.ts`.
 *
 * Its own file for `sinew-shape.ts`' reason: the halves are drawn from it
 * (`ledger-draw.ts`), a bolt stops on them (`ledger-stop.ts`) and a caption
 * rings them (`caption-anchor-boss-e.ts`), and a body worked out in three
 * files would be a bolt stopping on one outline under another.
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
  return splinePath(ledgerHalfPoints(l, seamX, side, gap, time), true);
}

/** The points `ledgerHalfPath` is drawn through, for a bolt to stop on (`ledger-stop.ts`). */
export function ledgerHalfPoints(
  l: Layout,
  seamX: number,
  side: -1 | 1,
  gap: number,
  time: number,
): Point[] {
  return LEDGER_BACK.points(l, seamX, side, gap, time);
}

/**
 * **The half's outline, as a record**, so the drawing and the bolt that stops
 * on it read one answer and a candidate can offer another (`ledger:back` in
 * VERSUS, 8 October 2026). The design asks for a lobed back off the shape
 * sheet, and since 9 October 2026 that is what ships: COLONY · PLATED, the
 * owner's pick over this file's own seven points
 * (`ledger-shape-plated-back.ts`).
 */
export interface LedgerBack {
  points(l: Layout, seamX: number, side: -1 | 1, gap: number, time: number): Point[];
}

export const LEDGER_BACK: LedgerBack = { points: platedBack };

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
