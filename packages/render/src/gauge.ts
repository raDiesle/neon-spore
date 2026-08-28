import { GAUGE_FULL, type GaugeState, type SimConfig } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE GAUGE's picture: a half-round dial, a needle, and two marks that only
 * one of the two screens carries.
 *
 * Drawn out of slabs and glyphs, never blobs — `docs/spec/interludes.md` makes
 * that the one rule the whole category shares, and it costs no new art: a hard
 * plate, a rim of notches, a straight needle. A pair who have spent an act
 * among soft closed contours know from the first frame that this is a
 * different kind of thing and nothing had to say so.
 *
 * No new colours either. Violet and white are the ship's own and the machine
 * is the ship's; the band is `pod` amber, which is already what this game
 * spends on "here, this is the thing"; a call that landed is `good` green and
 * one that did not is `sparkDim`, which are already right and wrong everywhere
 * else. A round that invented a third pair would be teaching a colour
 * vocabulary for ninety seconds.
 *
 * Stateless, like every other draw in this package: everything it shows is on
 * the world, so nothing here outlives a frame and `Effects.reset` has nothing
 * of it to clear.
 */

/**
 * The navigator reads the marks. The pilot's dial is the same dial without
 * them — not a different picture, which is what makes "I cannot see it, tell
 * me" the obvious thing for him to say.
 *
 * A role predicate in render/ for the same reason `showsQueenHint` is: the
 * information split is a fact about a *screen*, not about the world. It is not
 * the same question as which buttons a seat has — that is the control set's,
 * and `slabs.ts` answers it — and keeping the two apart is what lets a later
 * round hand one seat information without also handing it a verb.
 */
export const showsGaugeMarks = (role: ViewRole): boolean => role !== "p1";
/** The pilot turns it. Nobody else has a valve drawn at all. */
export const showsGaugeValve = (role: ViewRole): boolean => role !== "p2";

export interface Dial {
  cx: number;
  /** The pivot, at the bottom of the half-circle. */
  cy: number;
  r: number;
}

export interface DialView {
  /** Whether this screen is the one that can see the two marks. */
  showMarks: boolean;
  beat: number;
  beatPhase: number;
}

/** Where a value on the dial sits, as a canvas angle. Left is 0, right is full. */
function angleFor(milli: number): number {
  return Math.PI + (milli / GAUGE_FULL) * Math.PI;
}

function pointOn(dial: Dial, milli: number, radius: number): { x: number; y: number } {
  const a = angleFor(milli);
  return { x: dial.cx + Math.cos(a) * radius, y: dial.cy + Math.sin(a) * radius };
}

/**
 * The name, and the one sentence that teaches the round. Different on the two
 * screens because the halves are different — a pair reading the same line
 * would have nothing to tell each other, which is filter 6 of the category
 * (`docs/spec/transfers-hazelight.md`) failed in the first frame.
 */
export function drawGaugeTitle(ctx: CanvasRenderingContext2D, l: Layout, role: ViewRole): void {
  const y = l.playHeight * 0.14;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE GAUGE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(taught(role), l.width / 2, y + 22);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(withheld(role), l.width / 2, y + 38);
}

/** What this screen can do. */
function taught(role: ViewRole): string {
  if (role === "p1") return "turn it where they tell you";
  if (role === "p2") return "say where it has to go, then call";
  return "one of you turns, the other calls";
}

/** And what it is not being shown, said out loud rather than merely missing. */
function withheld(role: ViewRole): string {
  if (role === "p1") return "YOU CANNOT SEE THE MARKS";
  if (role === "p2") return "YOU CANNOT TURN IT";
  return "NEITHER HALF IS ENOUGH ON ITS OWN";
}

export function drawGauge(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  gauge: GaugeState,
  view: DialView,
): void {
  drawPlate(ctx, dial);
  if (view.showMarks) drawBand(ctx, dial, cfg, gauge);
  drawScale(ctx, dial);
  drawCall(ctx, dial, gauge, view);
  drawNeedle(ctx, dial, gauge);
}

/**
 * The plate the dial is cut into. A rectangle with its top corners taken off,
 * which is the cheapest shape that reads as *made*: nothing on the field has a
 * straight edge anywhere.
 */
function drawPlate(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const pad = dial.r * 0.16;
  const left = dial.cx - dial.r - pad;
  const top = dial.cy - dial.r - pad;
  const w = (dial.r + pad) * 2;
  const h = dial.r + pad * 2.8;
  const cut = pad * 1.4;

  ctx.beginPath();
  ctx.moveTo(left + cut, top);
  ctx.lineTo(left + w - cut, top);
  ctx.lineTo(left + w, top + cut);
  ctx.lineTo(left + w, top + h);
  ctx.lineTo(left, top + h);
  ctx.lineTo(left, top + cut);
  ctx.closePath();
  ctx.fillStyle = "rgba(16,11,34,.92)";
  ctx.fill();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

/**
 * The two marks and the band between them. Only ever drawn on the screen that
 * is allowed to read it — the pilot's copy of this dial is the same dial with
 * this call left out, not a different picture, which is what makes "I cannot
 * see it, tell me" the obvious thing for him to say.
 */
function drawBand(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  cfg: SimConfig,
  gauge: GaugeState,
): void {
  const span = cfg.gaugeSpanMilli;
  const lo = Math.max(0, gauge.markMilli - span);
  const hi = Math.min(GAUGE_FULL, gauge.markMilli + span);
  const inner = dial.r * 0.62;

  ctx.beginPath();
  ctx.arc(dial.cx, dial.cy, dial.r, angleFor(lo), angleFor(hi));
  ctx.arc(dial.cx, dial.cy, inner, angleFor(hi), angleFor(lo), true);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,194,74,.20)";
  ctx.fill();

  ctx.strokeStyle = PALETTE.podRim;
  ctx.lineWidth = 2.2;
  for (const edge of [lo, hi]) {
    const a = pointOn(dial, edge, inner);
    const b = pointOn(dial, edge, dial.r);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/** The rim: an arc and twenty-one notches, every fifth of them long. */
function drawScale(ctx: CanvasRenderingContext2D, dial: Dial): void {
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(dial.cx, dial.cy, dial.r, Math.PI, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i <= 20; i++) {
    const milli = (i * GAUGE_FULL) / 20;
    const long = i % 5 === 0;
    const a = pointOn(dial, milli, dial.r - dial.r * (long ? 0.14 : 0.07));
    const b = pointOn(dial, milli, dial.r);
    ctx.strokeStyle = long ? PALETTE.hullRim : PALETTE.hull;
    ctx.lineWidth = long ? 1.8 : 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/**
 * Where the last call landed, fading over two beats. Both screens show it, and
 * that is deliberate: it is the one thing in the round the pair have to agree
 * about afterwards, and a pilot who never learnt whether his stop was right
 * has no way to get better at obeying.
 */
function drawCall(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  gauge: GaugeState,
  view: DialView,
): void {
  const age = view.beat - gauge.calledBeat + view.beatPhase;
  if (gauge.calledMilli < 0 || age > 2) return;
  const alpha = Math.max(0, Math.min(1, 1 - age / 2));
  const a = pointOn(dial, gauge.calledMilli, dial.r * 0.2);
  const b = pointOn(dial, gauge.calledMilli, dial.r * 1.04);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = gauge.calledGood ? PALETTE.good : PALETTE.sparkDim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

/** The needle itself, and the pin it turns on. */
function drawNeedle(ctx: CanvasRenderingContext2D, dial: Dial, gauge: GaugeState): void {
  const tip = pointOn(dial, gauge.needleMilli, dial.r * 0.94);
  const tail = pointOn(dial, gauge.needleMilli, -dial.r * 0.12);

  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(tail.x, tail.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(dial.cx, dial.cy, Math.max(1, dial.r * 0.07), 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.hull;
  ctx.fill();
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}
