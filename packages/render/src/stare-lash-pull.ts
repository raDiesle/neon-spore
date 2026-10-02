import { type SimConfig, type StareState, stareCharging, stareLashesOwed } from "@neon-spore/sim";
import { ROOT_MUL } from "./eye.js";
import { rimBox, rimPoint } from "./eye-rim.js";
import { strokeGlow } from "./glow.js";
import { handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullArrow } from "./pull-knob.js";
import { PULL_UP } from "./pull-line.js";
import { type StareEye, stareEye } from "./stare-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE STARE's lashes, to be pulled**: the one thing on the eye a hand takes
 * hold of, drawn and answered in one file for `sinew-handles.ts`' reason —
 * the band a thumb is answered in is the fan that is drawn.
 *
 * The owner, 2 October 2026: *instead of pulling middle, players need to pull
 * up a number of lashes. First level 4 and every level more doubling it.* So
 * while the eye charges, a fan of `stareLashesOwed` lashes stands along the
 * eye's **upper** rim, corner to corner: a lash still down is short and
 * smouldering in the charge's ember, a lash pulled up is long and lit green —
 * the owner's colour for a pull done (`pull-track.ts`) — and the lash a thumb
 * is pulling rides up with the thumb (`lashMilli`). They come up from both
 * ends inward, so the fan fills evenly whichever thumb is pulling.
 *
 * **Both seats at once, anywhere on the eye**: a press anywhere over the cowl
 * takes hold of the lashes, and every `stareLashPullMilli` the thumb rises is
 * one more (`sim/stare-hand.ts`). Thirty-two lashes are too fine to aim a
 * thumb at, and aiming is not the ask — the count is.
 */

/** The fan stands clear of the eye's corners by this share of its width at each end. */
const MARGIN = 0.05;
/** A lash's length in socket heights: still down, and pulled up. */
const DOWN = 0.45;
const UP = 1.35;
/** The band a press is answered in, in socket half-extents round the eye's middle. */
const BAND_W = 1.55;
const BAND_TOP = 3.1;
const BAND_FOOT = 0.9;

/** Where the fan's crown stands: over the eye, where its arrow and `PULL` are written. */
export function stareLashCrown(l: Layout, cfg: SimConfig): Circle {
  const e = stareEye(l, cfg);
  return { x: e.cx, y: e.cy - e.ry * (1 + UP + 0.35), r: handleRadius(l, cfg) };
}

/**
 * The press, answered for either seat while the eye charges. `bossOf(field,
 * "stare")` is `null` on every wave without the eye, and a press then falls
 * through to whatever is behind it as if no lashes were there. The hold's
 * origin is the finger: how far *up* it comes is the pull.
 */
export function stareLashUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "stare");
  if (s === null || !stareCharging(s)) return null;
  const e = stareEye(l, field.cfg);
  if (Math.abs(x - e.cx) > e.rx * BAND_W) return null;
  if (y < e.cy - e.ry * BAND_TOP || y > e.cy + e.ry * BAND_FOOT) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target: "stareLash", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "stareLash", player: field.seat, originX: x, originY: y },
  };
}

/**
 * The `k`th lash to come up, as a slot along the fan from the left: from the
 * two ends inward, alternately, so the fan fills evenly.
 */
function slotOf(k: number, n: number): number {
  return k % 2 === 0 ? k / 2 : n - 1 - (k - 1) / 2;
}

/**
 * The fan over the charging eye, and the arrow over it. Called after the eye
 * is drawn, so the lashes stand in front of the cowl. `e` is the socket, not
 * the swollen eye, so the fan does not slide about under a thumb.
 */
export function drawStareLashPull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: StareState,
  time: number,
): void {
  if (!stareCharging(s)) return;
  const e: StareEye = stareEye(l, cfg);
  const n = stareLashesOwed(s, cfg);
  const pull = Math.max(1, cfg.stareLashPullMilli);
  // How far up each slot stands, zero down and one pulled.
  const rise = new Array<number>(n).fill(0);
  for (let k = 0; k < Math.min(n, s.lashesUp); k++) rise[slotOf(k, n)] = 1;
  let next = s.lashesUp;
  for (let seat = 0; seat < 2; seat++) {
    if (!s.lashHeld[seat] || next >= n) continue;
    rise[slotOf(next, n)] = Math.min(1, (s.lashMilli[seat] as number) / pull);
    next += 1;
  }
  const box = rimBox(e.rx, e.ry, ROOT_MUL);
  const up = new Path2D();
  const down = new Path2D();
  const going = new Path2D();
  let ups = 0;
  let goings = 0;
  for (let i = 0; i < n; i++) {
    const across = MARGIN + ((1 - 2 * MARGIN) * (i + 0.5)) / n;
    const p = rimPoint(box, across * 0.5);
    const r = rise[i] as number;
    const len = e.ry * (DOWN + (UP - DOWN) * r);
    const path = r >= 1 ? up : r > 0 ? going : down;
    if (r >= 1) ups += 1;
    else if (r > 0) goings += 1;
    // A lash still down droops a little and stirs; one pulled stands straight.
    const sway = r >= 1 ? 0 : Math.sin(time * 2.1 + i * 1.7) * 0.15 * (1 - r);
    path.moveTo(e.cx + p.x, e.cy + p.y);
    path.lineTo(e.cx + p.x + (p.nx + sway) * len, e.cy + p.y + p.ny * len);
  }
  const w = STROKE.outline * (n > 16 ? 1.2 : 1.8);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = w * 2.2;
  ctx.stroke(down);
  if (goings > 0) ctx.stroke(going);
  if (ups > 0) ctx.stroke(up);
  ctx.restore();
  if (ups + goings < n) strokeGlow(ctx, down, PALETTE.ember, w, 0.9, 0.85);
  if (goings > 0) strokeGlow(ctx, going, PALETTE.text, w * 1.2, 2.2);
  if (ups > 0) strokeGlow(ctx, up, PALETTE.good, w, 1.8);
  // The way, over the fan: every screen pulls, so the arrow is on every screen.
  const crown = stareLashCrown(l, cfg);
  drawPullArrow(ctx, crown, crown.r, PULL_UP, time, { alpha: 0.9 });
}
