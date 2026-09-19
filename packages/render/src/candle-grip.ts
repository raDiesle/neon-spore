import { type CandleState, candleSmoking, candleWicked, type SimConfig } from "@neon-spore/sim";
import { candleFlameY, candleGlowY } from "./candle-glow.js";
import { halo } from "./glow.js";
import { drawHandleRest, drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE CANDLE's wick**: the one thing in a black field a hand takes hold of,
 * drawn and answered in one file for `sinew-handles.ts`' reason — the circle
 * a thumb is answered at is the circle the ring is drawn from.
 *
 * The boss is a point of light and nothing else (`candle-glow.ts`), so the
 * last step gives it the one part a candle has besides its flame: a wick,
 * hanging from the shelf the light hangs on, down the column the light is
 * over. At `last` the flame rides it — the pilot's thumb carries the light
 * down the stem and off the end — and at `smoking` the stem is all that is
 * left, an ember at its tip and smoke off that, which is where her beam goes
 * (`sim/candle-hand.ts`, `sim/candle.ts`).
 *
 * **The travel is one-to-one with the thumb.** `stare-lid.ts` remaps its
 * pull onto the eye's own height, because a lid the simulation calls shut
 * has to *look* shut; nothing here has to look like anything. The flame has
 * to be under his finger, so the wick is exactly `candlePinchMilli` long in
 * the picture and the light sits wherever he has put it. A wick a shade
 * shorter would end with the flame coming off half a tile above his thumb.
 *
 * **The ring is on both screens**, which is THE MAZE's, THE WARDEN's and THE
 * LID's arrangement and not THE STARE's: the gauge closing around the flame
 * is the navigator's cue, because the instant it closes is the instant her
 * beam starts being worth something (`handle-draw.ts`). Whose thumb it is is
 * said by the field's own word, `PULL`, which `boss-cue-read-m.ts` already
 * puts on the flame for the pilot alone — so no hint is drawn here, and the
 * word is said once.
 *
 * **Held is read off the depth**, because the depth is all the simulation
 * keeps: a thumb resting at the top of the wick looks like no thumb at all.
 * That is the truth of it — nothing has happened yet — and the frame it is
 * wrong for is the frame the pull begins on.
 */

/** How far down the flame comes, in pixels: the thumb's own distance. */
export function candleWickReach(l: Layout, cfg: SimConfig): number {
  return (l.tile * cfg.candlePinchMilli) / 1000;
}

/** Where the ring rests, with no thumb on the flame: the wick's root. */
export function candleWickRest(l: Layout, cfg: SimConfig, c: CandleState): Circle {
  return { x: tileCX(l, c.col), y: candleGlowY(l), r: handleRadius(l, cfg) };
}

/** Where the ring is standing: round the flame, wherever the thumb has it. */
export function candleWickAt(l: Layout, cfg: SimConfig, c: CandleState): Circle {
  return { ...candleWickRest(l, cfg, c), y: candleFlameY(l, c) };
}

/**
 * The press, and the pilot's alone: a pull sent from her seat is dropped
 * without a sound in the rule itself, so a ring she could grab would be a
 * control that did nothing (`sim/candle-hand.ts`). `bossOf(field, "candle")`
 * is `null` on every wave without the glow, and a press then falls through to
 * whatever is behind it as if no ring were there.
 *
 * Answered at the **rest** and never where the flame has got to, which is the
 * rule for every handle on this field (`handles.ts`): by the time it has
 * travelled the pointer is captured and nothing is hit-tested again.
 */
export function candleWickUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const c = bossOf(field, "candle");
  if (c === null || !candleWicked(c) || field.seat !== 1) return null;
  if (!hitCircle(candleWickRest(l, field.cfg, c), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "candleWick", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "candleWick", player: 1, originX: x, originY: y },
  };
}

/** The stem's ink while the flame is on it: dim, because the light beside it
 * is the picture and a bright wire under it would read as the thing to shoot. */
const WICK_ALPHA = 0.45;
/** Tiles of smoke above the tip, how far it wanders at the top, and in how
 * many segments — enough that the wander reads as a drift rather than a bend. */
const PLUME = 1.7;
const PLUME_SWAY = 0.3;
const PLUME_STEPS = 6;
/** How fast the smoke wanders, and how dark it starts. */
const PLUME_HZ = 0.8;
const PLUME_ALPHA = 0.4;
/** The ember's reach in tiles at the start of the smoke and at the last beat
 * of it, and the handful of sizes between: `haloSprite` bakes a canvas per
 * radius, so a reach that swelled smoothly would bake one a frame
 * (`candle-glow.ts` has the same rule about the halo it throws). */
const EMBER_COOL = 0.22;
const EMBER_HOT = 0.55;
const EMBER_STEPS = 4;
/** The ember's own dot, in tiles, cold and hot. */
const EMBER_DOT = 0.05;
/** Flicker, quickening as the wick comes back towards a flame. */
const FLICK_SLOW = 3;
const FLICK_FAST = 11;

/**
 * The wick, on every screen, under the light rather than over it: called
 * before `drawCandleGlow` so the flame is painted into the middle of its own
 * ring rather than behind the ring's fill (`candle-dark.ts`).
 *
 * Nothing at all on the phases above the last: there is a flame with glow
 * behind it then, and a stem under it would be a handle four phases before
 * one may be taken hold of.
 */
export function drawCandleWick(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: CandleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!candleWicked(c) && !candleSmoking(c)) return;
  const rest = candleWickRest(l, cfg, c);
  const tip = rest.y + candleWickReach(l, cfg);
  const stem = new Path2D();
  stem.moveTo(rest.x, rest.y);
  stem.lineTo(rest.x, tip);
  ctx.save();
  ctx.globalAlpha = WICK_ALPHA;
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(stem);
  ctx.restore();

  if (candleSmoking(c)) {
    drawSmoke(ctx, l, cfg, c, rest.x, tip, beat, beatPhase, time);
    return;
  }
  const pull = cfg.candlePinchMilli === 0 ? 0 : c.pinchMilli / cfg.candlePinchMilli;
  const held = c.pinchMilli > 0;
  if (held) drawHandleRest(ctx, rest, PALETTE.ember);
  drawHandleRing(ctx, {
    x: rest.x,
    y: candleFlameY(l, c),
    r: rest.r,
    hex: PALETTE.ember,
    rim: PALETTE.emberRim,
    held,
    pull,
    time,
  });
}

/**
 * The tip once the flame is off it: an ember, and smoke off the ember.
 *
 * **The ember is the clock.** The wick lights again `candleSmokeBeats` after
 * the pull if the beam has not landed (`candle-step.ts`), and that count is
 * the whole of the phase's pressure — so it is read off the phase here and
 * spent on the one thing in the frame: the ember swells through a handful of
 * sizes and flickers faster as it comes back towards a flame. She has no
 * other clock; the word beside it says `BURN` and not *how long*.
 */
function drawSmoke(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: CandleState,
  x: number,
  tip: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const gone = beat - c.phaseBeat + beatPhase;
  const urge = Math.min(1, Math.max(0, gone / Math.max(1, cfg.candleSmokeBeats)));
  const hz = FLICK_SLOW + (FLICK_FAST - FLICK_SLOW) * urge;
  const flick = 0.8 + 0.2 * Math.sin(time * hz * 2 * Math.PI);
  const step = Math.round(urge * EMBER_STEPS) / EMBER_STEPS;
  const reach = Math.round(l.tile * (EMBER_COOL + (EMBER_HOT - EMBER_COOL) * step));
  halo(ctx, x, tip, reach, PALETTE.ember, (0.4 + 0.35 * urge) * flick);
  ctx.fillStyle = PALETTE.emberRim;
  ctx.beginPath();
  ctx.arc(x, tip, l.tile * EMBER_DOT * (1 + urge), 0, Math.PI * 2);
  ctx.fill();

  // Segment by segment, fading as it rises: one stroke at one alpha would end
  // in a line with a top to it, and smoke has none.
  ctx.save();
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = STROKE.inner;
  let px = x;
  let py = tip;
  for (let i = 1; i <= PLUME_STEPS; i++) {
    const t = i / PLUME_STEPS;
    const nx = x + Math.sin(time * PLUME_HZ * 2 * Math.PI + t * 4) * l.tile * PLUME_SWAY * t;
    const ny = tip - l.tile * PLUME * t;
    ctx.globalAlpha = PLUME_ALPHA * (1 - t);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    px = nx;
    py = ny;
  }
  ctx.restore();
}
