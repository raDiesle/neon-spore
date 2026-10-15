import type { Point } from "@neon-spore/content";
import {
  drawLeverGroove,
  drawPullKnob,
  drawPullTrack,
  type GrooveSide,
  PALETTE,
  pullTrackPoint,
  STROKE,
} from "@neon-spore/render";
import { drawHandleDial } from "../../../packages/render/src/handle-draw.js";
import { PULL_SIZE } from "../../../packages/render/src/pull-knob.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import { inZone, type LabLever, leverValue } from "./lever-lab-rule.js";
import { atOf, depthOf, type LeverSetup, mineShape, theirShape } from "./lever-lab-setup.js";
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
 * - **FIZZ's goal ring stands where the lever is to be held**: at the end of
 *   the groove for a grip, and for a band in the band's middle — the channel
 *   drawn only that far, the knob going on past it along the faint groove
 *   when it is too deep (`fizzOf`). The game's own drawing is untouched (the
 *   owner left it to the lane, 14 October 2026);
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
  const fizz = fizzOf(mine, setup.ask.zone);
  const from = after.from && { ...after.from, at: fizz.at(after.from.at) };
  drawPullTrack(ctx, fizz.track, {
    ...tone,
    held,
    origin: mine.origin,
    at: fizz.at(p.at),
    time: f.time,
    after: { ...after, ...(from ? { from } : {}) },
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

/** FIZZ's channel for a lever: the whole groove, or for a band only as far as
 * its middle, so the goal ring FIZZ draws at the channel's end is where to
 * hold — and where along that channel a point of the groove falls. */
function fizzOf(
  s: LabShape,
  zone: readonly [number, number] | null,
): { track: LabShape["track"]; at: (k: number) => number } {
  if (!zone || zone[1] >= 1) return { track: s.track, at: (k) => k };
  const goal = (zone[0] + zone[1]) / 2;
  const a = pointAt(s, goal, -1);
  const b = pointAt(s, goal, 1);
  const track = { pts: [s.origin > 0 ? a : pointAt(s, 0, 1), b], w: s.track.w };
  return {
    track,
    at: (k) => atOf(s, Math.min(1, depthOf(s, k) / goal), k < s.origin ? -1 : 1),
  };
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

/** The groove, its quarter notches and its zone: the game's own drawing
 * (`render/lever-groove.ts`), on each side a two-way groove has. */
function paintGroove(
  ctx: CanvasRenderingContext2D,
  s: LabShape,
  zone: readonly [number, number] | null,
  lit: boolean,
): void {
  const signs: (1 | -1)[] = s.origin > 0 ? [1, -1] : [1];
  const sides = signs.map((sign): GrooveSide => {
    const a = pointAt(s, 0, sign);
    const b = pointAt(s, 1, sign);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  });
  drawLeverGroove(ctx, sides, { zone, lit, tile: LAB_TILE });
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
