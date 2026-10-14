import type { Point } from "@neon-spore/content";
import { drawPullKnob, drawPullTrack, PALETTE, pullTrackPoint, STROKE } from "@neon-spore/render";
import { drawHandleDial } from "../../../packages/render/src/handle-draw.js";
import { PULL_SIZE } from "../../../packages/render/src/pull-knob.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import { inZone, type LabLever, leverValue } from "./lever-lab-rule.js";
import { atOf, type LeverSetup, mineShape, theirShape } from "./lever-lab-setup.js";
import { afterOf, paintField, toneOf } from "./pull-lab-paint.js";
import { knobAt } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, type LabShape } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * One frame of THE LEVER LAB (`lever-lab.ts`): the PULL LAB's empty field and
 * its FIZZ knob and channel, drawn by the game's own `drawPullTrack` and
 * `drawPullKnob`, so a lever and a pull read as one family. What a lever adds
 * is drawn round them, in the game's own marks:
 *
 * - **the groove is graduated** — a notch every quarter of its reach — since
 *   where the knob stands is the value, not only whether it got there;
 * - **the zone lies on it** (`LeverAsk.zone`): a wide band dim until the
 *   value is in it, then green; a grip is its threshold notch drawn long. On
 *   a summed pair it lies on a gauge between the two grooves, which reads
 *   the sum, since neither groove alone has a zone;
 * - **the hold's dial** sweeps round the knob from the top while the zone is
 *   held (`drawHandleDial`, the game's handle dial), and **the waiting
 *   clock** every hold in the labs wears sits on its shoulder until it is
 *   counted (`drawHoldClock`);
 * - **the partner's lever** is drawn as THE COMBO LAB draws a partner's knob:
 *   dim, no arrow — its channel dim with it.
 *
 * No word on the field, as in the PULL LAB: the bar's readout says it.
 */

export interface LeverFrame {
  setup: LeverSetup;
  lever: LabLever;
  time: number;
  touch: boolean;
}

/** The knob as the eye sees it, over which the dial and the clock are laid. */
const DRAWN = LAB_KNOB * PULL_SIZE;

export function paintLeverLab(ctx: CanvasRenderingContext2D, f: LeverFrame): void {
  const { setup, lever } = f;
  paintField(ctx);
  const mine = mineShape(setup);
  const lit = inZone(setup, lever);
  const each = setup.pair !== "summed";
  if (setup.pair !== "one") paintPartner(ctx, f, theirShape(setup), each && lit);
  paintGroove(ctx, mine, each ? setup.ask.zone : null, lit);
  if (!each) paintGauge(ctx, f, lit);
  const p = lever.mine;
  const tone = toneOf(p);
  const held = p.phase === "held" || p.phase === "full";
  const after = afterOf(p, strayReach("half", f.touch));
  drawPullTrack(ctx, mine.track, {
    ...tone,
    held,
    origin: mine.origin,
    at: p.at,
    time: f.time,
    after,
  });
  const at = knobAt(mine, p);
  const q = pullTrackPoint(mine.track, p.at);
  const s = p.sign !== 0 ? p.sign : 1;
  drawPullKnob(ctx, at, LAB_KNOB, {
    ...tone,
    held,
    time: f.time,
    way: { dx: q.dx * s, dy: q.dy * s },
    either: mine.origin > 0 && p.sign === 0,
    after,
  });
  if (!setup.ask.zone) return;
  if (p.phase === "held")
    drawHandleDial(ctx, at.x, at.y, DRAWN * 0.75, PALETTE.goodRim, lever.fill);
  if (p.phase !== "full") drawHoldClock(ctx, at, DRAWN * 0.75, 1, f.time);
}

/** A depth's point on a groove, on the side `sign` names. */
const pointAt = (s: LabShape, depth: number, sign: 1 | -1): Point => {
  const q = pullTrackPoint(s.track, atOf(s, depth, sign));
  return { x: q.x, y: q.y };
};

/** Along the groove from one depth to another, on the side `sign` names. */
function span(
  ctx: CanvasRenderingContext2D,
  s: LabShape,
  from: number,
  to: number,
  sign: 1 | -1,
): void {
  const a = pointAt(s, from, sign);
  const b = pointAt(s, to, sign);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
}

/** Across the groove at `depth`: a notch `half` long either side of it. */
function notch(
  ctx: CanvasRenderingContext2D,
  s: LabShape,
  depth: number,
  sign: 1 | -1,
  half: number,
): void {
  const q = pullTrackPoint(s.track, atOf(s, depth, sign));
  ctx.moveTo(q.x - q.dy * half, q.y + q.dx * half);
  ctx.lineTo(q.x + q.dy * half, q.y - q.dx * half);
}

/** The groove's quarter notches, and its zone over them. */
function paintGroove(
  ctx: CanvasRenderingContext2D,
  s: LabShape,
  zone: readonly [number, number] | null,
  lit: boolean,
): void {
  const signs: (1 | -1)[] = s.origin > 0 ? [1, -1] : [1];
  ctx.save();
  ctx.lineCap = "round";
  // The groove the whole reach: faint, since the FIZZ channel is drawn only as the drop goes.
  ctx.strokeStyle = PALETTE.dim;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = LAB_TILE * 0.3;
  ctx.beginPath();
  for (const sign of signs) span(ctx, s, 0, 1, sign);
  ctx.stroke();
  if (zone) {
    ctx.strokeStyle = lit ? PALETTE.good : PALETTE.dim;
    ctx.globalAlpha = lit ? 0.32 : 0.2;
    ctx.lineWidth = LAB_TILE * 0.9;
    ctx.beginPath();
    for (const sign of signs) span(ctx, s, zone[0], zone[1], sign);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (const sign of signs)
    for (const d of [0.25, 0.5, 0.75, 1]) notch(ctx, s, d, sign, LAB_TILE * 0.22);
  ctx.stroke();
  if (zone) {
    // The grip: the zone's edges drawn long, the threshold the thumb carries past.
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = lit ? PALETTE.good : PALETTE.text;
    ctx.lineWidth = STROKE.outline;
    ctx.beginPath();
    for (const sign of signs)
      for (const d of zone) if (d < 1) notch(ctx, s, d, sign, LAB_TILE * 0.62);
    ctx.stroke();
  }
  ctx.restore();
}

/** The partner's lever: its groove and channel dim, its knob dim and arrowless. */
function paintPartner(
  ctx: CanvasRenderingContext2D,
  f: LeverFrame,
  s: LabShape,
  lit: boolean,
): void {
  const each = f.setup.pair === "both";
  paintGroove(ctx, s, each ? f.setup.ask.zone : null, lit);
  const held = f.lever.theirs > 0.02 || f.lever.mine.phase === "held";
  const tone = { hex: PALETTE.dim, rim: PALETTE.rock };
  // A rail filled as deep as the partner has it — not FIZZ's channel, whose
  // drop and goal are the hand's own to read.
  fill(ctx, s, f.lever.theirs, PALETTE.rock);
  const q = pullTrackPoint(s.track, atOf(s, f.lever.theirs, 1));
  drawPullKnob(ctx, { x: q.x, y: q.y }, LAB_KNOB, {
    ...tone,
    held,
    time: f.time,
    way: null,
    theirs: true,
  });
}

/** TWO · SUMMED: a gauge between the grooves, filled to the pair's mean, its zone on it. */
function paintGauge(ctx: CanvasRenderingContext2D, f: LeverFrame, lit: boolean): void {
  const g = gaugeOf(f.setup);
  paintGroove(ctx, g, f.setup.ask.zone, lit);
  fill(ctx, g, leverValue(f.setup, f.lever), lit ? PALETTE.good : PALETTE.text);
}

/** A groove filled from its rest to `depth`, on the side its value is read from. */
function fill(ctx: CanvasRenderingContext2D, s: LabShape, depth: number, hex: string): void {
  if (depth <= 0.005) return;
  ctx.save();
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  span(ctx, s, 0, depth, 1);
  ctx.stroke();
  ctx.restore();
}

/** The summed gauge's own line, in the middle between the two grooves, as long as one. */
function gaugeOf(setup: LeverSetup): LabShape {
  const m = mineShape(setup).track.pts;
  const t = theirShape(setup).track.pts;
  const mid = (i: number): Point => {
    const p = m[i] as Point;
    const q = t[i] as Point;
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  };
  const [a, b] = [mid(0), mid(m.length - 1)];
  // A sideways sum still reads from one end: its depth, not its side.
  return { ...mineShape(setup), origin: 0, track: { pts: [a, b], w: 2 } };
}
