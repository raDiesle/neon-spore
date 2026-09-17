import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { ledgerCordAt, type Point } from "./ledger-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The cord**, and the one hole in the ship it goes into.
 *
 * The design's own claim about this boss is that one drawn object carries the
 * whole fight, so it is drawn as a thing and not as a line: a wide cool
 * shadow, the hull's violet over it, and a hard core down the middle — the
 * three strokes `tether-cord.ts` argues make a stroke into something with a
 * near side (`.claude/skills/depth`). **Violet because the damage travelling
 * it is the ship's own**, which is the design's whole statement about colour
 * and the reason nothing else here is violet but the beads.
 *
 * **It is drawn in segments, and that is the split.** The pilot is shown the
 * cord leaving the body and a bead coming down it; the last stretch above the
 * plating fades out on his screen, so he cannot read which column it is rooted
 * in — that is hers (`ledger-read.ts`, `view-role-clocks.ts`). A cord drawn
 * full length on both screens would answer her half of the sentence before she
 * said it. The segments pay for themselves twice: the fade is per-segment
 * alpha rather than a gradient, and the strain that runs up the cord as a
 * return lands is per-segment brightness.
 */

/** How many pieces the cord is drawn in: enough for a smooth fade on a phone. */
const SEGS = 14;
/** Where the fade starts and ends on the pilot's screen, down the cord. */
const FADE_FROM = 0.58;
const FADE_TO = 0.88;
/** The cord's half-width slack and taut, in tiles. */
const WIDE = 0.1;
const NARROW = 0.045;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** How much of the cord is drawn at `u`, on a screen that is not shown the root. */
function seenAt(u: number, showsRoot: boolean): number {
  if (showsRoot) return 1;
  if (u <= FADE_FROM) return 1;
  return Math.max(0, 1 - (u - FADE_FROM) / (FADE_TO - FADE_FROM));
}

export function drawLedgerCord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  to: Point,
  taut: number,
  time: number,
  /** Whether this screen is shown where the cord is rooted (the navigator's). */
  showsRoot: boolean,
  /** 0..1, the strain running up the cord as a return takes its last beat. */
  strain: number,
): void {
  const w = l.tile * (WIDE - (WIDE - NARROW) * taut);
  let prev = ledgerCordAt(l, from, to, taut, time, 0);
  for (let i = 1; i <= SEGS; i++) {
    const u = i / SEGS;
    const next = ledgerCordAt(l, from, to, taut, time, u);
    const seen = seenAt(u - 0.5 / SEGS, showsRoot);
    if (seen > 0.01) {
      const seg = new Path2D();
      seg.moveTo(prev.x, prev.y);
      seg.lineTo(next.x, next.y);
      // The strain arrives from the socket and goes up, so a return landing is
      // seen in the cord before it is seen in the hull.
      const lit = strain * Math.max(0, 1 - Math.abs(u - (1 - strain)) * 3);
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = rgba(SHADOW, 0.55 * seen);
      ctx.lineWidth = w * 2.4;
      ctx.stroke(seg);
      ctx.strokeStyle = rgba(PALETTE.hull, (0.72 + 0.28 * lit) * seen);
      ctx.lineWidth = w * 1.6;
      ctx.stroke(seg);
      ctx.strokeStyle = rgba(PALETTE.hullRim, (0.35 + 0.5 * lit) * seen);
      ctx.lineWidth = Math.max(0.6, w * 0.5);
      ctx.stroke(seg);
      ctx.restore();
    }
    prev = next;
  }
}

/**
 * **The socket**: the hole in the plating the cord goes through, drawn on the
 * navigator's screen alone.
 *
 * A grommet rather than a dot — the cord passes *through* the hull rather than
 * stopping on it, which is `tether-cord.ts`' own ruling about a root and the
 * only way a cord reads as being *in* something. It is the hull's own violet
 * and never white: the white here is the lock that names the column, and the
 * two must not be the same mark (`ledger-read.ts`).
 */
export function drawLedgerSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  taut: number,
): void {
  const r = l.tile * (0.2 - 0.05 * taut);
  const hole = new Path2D();
  hole.ellipse(at.x, at.y, r, r * 0.42, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = rgba(SHADOW, 0.85);
  ctx.fill(hole);
  ctx.restore();
  strokeGlow(ctx, hole, PALETTE.hullRim, STROKE.inner, 0.45 + 0.45 * taut);
}
