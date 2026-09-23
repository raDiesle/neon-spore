import { type SimConfig, type SpliceState, spliceEntranceRow } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { drawTube, drawTubeStub } from "./splice-flesh.js";

/**
 * THE SPLICE's straws, as geometry and as lines.
 *
 * Every curve in the fight comes out of `spliceCurve`, and so does every
 * *position* on one: the number riding down a straw is `spliceAt` at a
 * fraction of the same curve the straw was stroked from. One function rather
 * than two is the whole point — a number drawn beside the line it is supposed
 * to be inside is the one mistake this picture cannot afford, because tracing
 * the line is the navigator's entire job.
 *
 * Nothing here is a rule. The three column arrays and the permutation are the
 * simulation's, laid once from the seeded rng (`sim/splice-tangle.ts`); this
 * file turns them into pixels and keeps nothing between frames.
 */

/** The y a straw's numbered top end stands at. */
export function spliceTopY(l: Layout, cfg: SimConfig): number {
  return tileCY(l, cfg.spliceTopRow);
}

/** The y the mouths stand at — two tiles over the plating by default. */
export function spliceMouthY(l: Layout, cfg: SimConfig): number {
  return tileCY(l, spliceEntranceRow(cfg));
}

/**
 * A mouth's own radius. Here rather than in `drawMouths`, which used to hold
 * it alone, because the cue wants the same number: a number arriving is drawn
 * *in* its mouth, so the top of this ring is the line under which the cue's
 * verb stops being readable (`boss-cue-read-d.ts`, `BossCue.wordFloor`).
 */
export function spliceMouthR(l: Layout): number {
  return Math.max(4, l.tile * 0.3);
}

/**
 * One straw as a quadratic curve, from its numbered top end down to its mouth.
 *
 * Quadratic and not a polyline through the middle column, because the tangle
 * has to read as *hose* rather than as a wiring diagram: a bend is where the
 * eye loses a line, and a corner is where it loses it for good. The control
 * point is the straw's own middle column at the height halfway between the two
 * rows, which is the one number the simulation rolls purely for the picture
 * (`SpliceState.midCols`) — without it every straw is a straight line and the
 * whole puzzle can be read off the two rows without following anything.
 */
export interface SpliceCurve {
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
}

export function spliceCurve(
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  entrance: number,
): SpliceCurve {
  const top = s.topOf[entrance] ?? entrance;
  const y0 = spliceTopY(l, cfg);
  const y1 = spliceMouthY(l, cfg);
  return {
    x0: tileCX(l, s.topCols[top] ?? 0),
    y0,
    // The waypoint is pulled clear of the two ends rather than sitting at the
    // midpoint of the drop: a control point level with the middle of the run
    // makes every straw the same shallow arc, and what makes a tangle legible
    // to follow and hard to guess is that the arcs disagree about where they
    // are steepest.
    cx: tileCX(l, s.midCols[entrance] ?? 0),
    cy: y0 + (y1 - y0) * 0.55,
    x1: tileCX(l, s.entranceCols[entrance] ?? 0),
    y1,
  };
}

/** A point along one, `t` from the top end (0) to the mouth (1). */
export function spliceAt(c: SpliceCurve, t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * c.x0 + 2 * u * t * c.cx + t * t * c.x1,
    y: u * u * c.y0 + 2 * u * t * c.cy + t * t * c.y1,
  };
}

/**
 * **Where the number in flight is**, or `null` while none is — one straw's
 * curve and the fraction of it the travel has covered, in one call.
 *
 * `beat` is the beat *and its phase*, so the token moves between beats rather
 * than jumping on them. The fraction is clamped at both ends: a feed is judged
 * on the beat `spliceFeedBeats` is reached (`sim/splice-round.ts`), and a frame
 * drawn a phase past that would otherwise put the number below its own mouth.
 *
 * It is here rather than inside `drawFlight` because two callers want it and
 * the arithmetic is not theirs to keep a copy of: the picture draws the number,
 * and the cue stands its own frame on it (`boss-cue-read-d.ts`). A word beside
 * the line the number is inside is the one mistake this whole picture cannot
 * afford, and two copies of a lerp is how that happens.
 */
export function spliceFlightAt(
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  beat: number,
): { x: number; y: number } | null {
  if (s.feedFrom === -1) return null;
  const t = Math.max(0, Math.min(1, (beat - s.feedBeat) / cfg.spliceFeedBeats));
  return spliceAt(spliceCurve(l, cfg, s, s.feedFrom), t);
}

/**
 * The tangle, on the seat that is shown it.
 *
 * Each straw drawn whole — casing, wall, rings, wet line (`splice-flesh.ts`)
 * — before the next, so a crossing reads as one hose passing *behind* another
 * rather than as two lines meeting at a point. That is the whole difference
 * between a puzzle and a scribble.
 *
 * The straw whose number is already fed is dimmed rather than removed: what
 * the pair has done is part of what they are reading, and a tangle that lost a
 * line every feed would be a different picture each time they looked up.
 */
export function drawStraws(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
): void {
  const wide = Math.max(3, l.tile * 0.24);
  for (let e = 0; e < s.entranceCols.length; e++) {
    const done = (s.topOf[e] ?? 0) < s.fed;
    ctx.globalAlpha = done ? 0.25 : 0.9;
    drawTube(ctx, l, spliceCurve(l, cfg, s, e), wide);
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}

/**
 * The stub the seat holding the cannon is given: the same curve and the same
 * tube, fading in from nothing a hand's width over the mouths.
 *
 * It is the *same* curve and not a straight tail, so the direction a straw
 * leaves its mouth in is honest — that is the one thing the pilot can
 * legitimately notice, and a fake vertical stub would be the picture lying to
 * the seat that cannot check it.
 */
export function drawStubs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
): void {
  const topY = spliceMouthY(l, cfg) - l.tile * 1.2;
  const wide = Math.max(2, l.tile * 0.2);
  for (let e = 0; e < s.entranceCols.length; e++) {
    drawTubeStub(ctx, spliceCurve(l, cfg, s, e), wide, topY);
  }
  ctx.lineWidth = 1;
}
