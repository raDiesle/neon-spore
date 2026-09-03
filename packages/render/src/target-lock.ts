/**
 * THE TARGET LOCK: the one marking in this game that means *an instrument has
 * picked this body out, and it cannot tell you the rest*.
 *
 * Four corner brackets around a box, a line that sweeps down through it, and a
 * flicker. Nothing else — no glyph, no readout, no invented coordinates. It is
 * drawn identically over a lure, over a dart, over a cloud and over the
 * queen's two marks, and that sameness is the whole point of the file.
 *
 * **This is a reversal, and it is the owner's.** Every marking here used to
 * argue at length for being unlike its neighbours — `lure-alarm.ts` and
 * `veil-marks.ts` each carry a paragraph explaining how they differ on where,
 * on colour and on what they say about time, on the reasoning that two
 * markings which look alike are worse than one that is ugly. That reasoning
 * held while each mark was a *sentence*: an exclamation, a question mark, a
 * ring. The owner asked for the opposite and said why: a pair was learning
 * four different pictures for one idea — *this one is not ordinary, and the
 * screen you are on is not the one being told* — and four pictures for one
 * idea is three too many.
 *
 * So the shared part is now the frame, and what still separates the four is
 * everything *inside* it:
 *
 * - the **lure** keeps its white and its label, and white is a colour nothing
 *   else on the field is drawn in;
 * - the **dart** keeps its two arrows down both diagonals, which is the only
 *   way this vocabulary has of saying "either way";
 * - the **veil** keeps the pilot's draining clock on the other screen, which
 *   is a countdown and was never a highlight;
 * - the **queen's marks** keep the armour, the morph and the colour on the
 *   border, none of which any other body has.
 *
 * The frame says *found*. What is in it says what was found and what is being
 * withheld, which is the half a shared marking was never carrying anyway.
 *
 * **The flicker is not decoration.** A steady rectangle reads as a thing that
 * was drawn on the field; one that drops and jumps a pixel reads as a readout
 * off a machine that is doing its best, which is exactly the fiction — the
 * seat wearing this frame is the seat that is *not being told*. It runs on the
 * wall clock, which render is free to use and the simulation is not, so two
 * devices flickering out of step is not a desync and never reaches `hashWorld`.
 */

/** How far each corner arm reaches, as a share of the box's shorter half-extent. */
const ARM = 0.55;
/** Line weight as a share of that same half-extent, and its floor in pixels —
 * a tile is about thirty pixels across on a phone and a hairline is nothing. */
const WEIGHT = 0.11;
const MIN_WEIGHT = 1.5;

/** Seconds one interference step holds for. Short: the eye should read it as
 * a bad connection, not as a blink. */
const STEP = 0.07;
/** How often a step is a bad one, and how far the frame drops when it is.
 * Never to nothing — a mark that vanishes is a mark somebody has to wait for. */
const DROP_CHANCE = 0.16;
const DROP = 0.45;

/** Seconds the sweep takes to cross the box, and how bright it is mid-run. */
const SWEEP_SECONDS = 1.6;
const SWEEP_ALPHA = 0.34;
/** Below this half-extent, in pixels, the sweep is skipped: on a radar blip
 * the box is eight pixels tall and a line inside it is a smudge. */
const SWEEP_MIN = 7;

/** How wide the glow pass is beside the crisp one, and how faint. */
const GLOW_WIDTH = 3;
const GLOW_ALPHA = 0.18;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * A repeatable 0..1 off one number. Not `Rng` — that is the simulation's, and
 * a marking that pulled from it would move the shared stream and desync two
 * devices over a flicker. Not `Math.random` either: this has to give the same
 * answer twice within a frame, because the jitter is read once for the box and
 * once for the corner ticks.
 */
function noise(n: number): number {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

/** The four corner brackets, as one path ready to stroke. */
function corners(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
  arm: number,
): void {
  ctx.beginPath();
  for (const [x, sx] of [
    [left, 1],
    [right, -1],
  ] as const) {
    for (const [y, sy] of [
      [top, 1],
      [bottom, -1],
    ] as const) {
      ctx.moveTo(x, y + sy * arm);
      ctx.lineTo(x, y);
      ctx.lineTo(x + sx * arm, y);
    }
  }
}

/**
 * One lock, about a box rather than about a radius.
 *
 * A box and not a circle because a rectangle has corners and a corner is what
 * carries this picture: four short right angles read as a frame the moment
 * three of them are on screen, where four arcs of a circle read as a broken
 * ring. It also lets a mark be as tall as what it is about — the dart's frame
 * is a portrait rectangle because it holds the body *and* its two arrows, and
 * the queen's is as squat as the silhouette it sits inside.
 *
 * `seed` spreads the interference so that two locks on the field at once do
 * not blink as one object.
 */
export function drawTargetLock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  hex: string,
  time: number,
  alpha = 1,
  seed = 0,
): void {
  if (alpha <= 0 || halfW <= 0 || halfH <= 0) return;
  const short = Math.min(halfW, halfH);
  const arm = short * ARM;
  const w = Math.max(MIN_WEIGHT, short * WEIGHT);

  const step = Math.floor(time / STEP) + seed * 17;
  const bad = noise(step) < DROP_CHANCE;
  // A shallow shimmer under the drops, so the frame is never quite still even
  // on a good step — an instrument holding a lock is still working at it.
  const shimmer = 0.9 + 0.1 * Math.sin(time * 9 + seed);
  const a = clamp01(alpha * shimmer * (bad ? DROP : 1));
  if (a <= 0.01) return;
  // Sideways only, and only on a bad step: a frame that wandered in both axes
  // every frame would read as a thing floating rather than as a bad signal.
  const jx = bad ? (noise(step * 1.7 + 3) - 0.5) * w * 1.6 : 0;

  const left = cx - halfW + jx;
  const right = cx + halfW + jx;
  const top = cy - halfH;
  const bottom = cy + halfH;

  ctx.save();
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.strokeStyle = hex;

  // The glow, in the same additive hand as every other line in the game
  // (`glow.ts`) — one wide faint pass rather than `shadowBlur`, which is the
  // single most expensive thing a phone GPU can be asked for.
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = w * GLOW_WIDTH;
  ctx.globalAlpha = clamp01(a * GLOW_ALPHA);
  corners(ctx, left, top, right, bottom, arm);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";

  ctx.lineWidth = w;
  ctx.globalAlpha = a;
  corners(ctx, left, top, right, bottom, arm);
  ctx.stroke();

  // A square pip in each corner, where the two arms meet. It is what makes the
  // bracket read as an instrument's registration mark rather than as a torn
  // rectangle, and it costs one call.
  ctx.fillStyle = hex;
  const pip = w * 1.5;
  for (const x of [left, right]) {
    for (const y of [top, bottom]) ctx.fillRect(x - pip / 2, y - pip / 2, pip, pip);
  }

  if (short >= SWEEP_MIN) drawSweep(ctx, left, top, right, bottom, arm, w, hex, a, time, seed);
  ctx.restore();
}

/**
 * The line that crosses the box, top to bottom, over and over.
 *
 * It fades in and out at both ends rather than wrapping at full strength: a
 * line that reappeared at the top on the same frame it left the bottom reads
 * as two lines, and the thing being drawn is one beam going round.
 *
 * It stops short of the corners on both sides, so the sweep never touches an
 * arm — a bracket the sweep runs into is a rectangle with sides, which is the
 * one thing this frame is not.
 */
function drawSweep(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  right: number,
  bottom: number,
  arm: number,
  w: number,
  hex: string,
  alpha: number,
  time: number,
  seed: number,
): void {
  const phase = (time / SWEEP_SECONDS + seed * 0.37) % 1;
  const y = top + phase * (bottom - top);
  const a = clamp01(alpha * SWEEP_ALPHA * Math.sin(phase * Math.PI));
  if (a <= 0.01) return;
  const inset = arm * 0.35;
  ctx.strokeStyle = hex;
  ctx.globalAlpha = a;
  ctx.lineWidth = Math.max(1, w * 0.7);
  ctx.beginPath();
  ctx.moveTo(left + inset, y);
  ctx.lineTo(right - inset, y);
  ctx.stroke();
}

/**
 * The same lock at the size of a radar blip: a small square around it, no
 * sweep (`SWEEP_MIN` sees to that) and the same flicker.
 *
 * The strip and the field have to be plainly saying one word — that was
 * already the rule when both said it with an exclamation (`lure-alarm.ts`) —
 * so a blip that has been picked out wears the same corners the body will,
 * eight pixels across instead of forty.
 */
export function drawRadarLock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  half: number,
  hex: string,
  time: number,
  alpha = 1,
  seed = 0,
): void {
  drawTargetLock(ctx, x, y, half, half, hex, time, alpha, seed);
}
