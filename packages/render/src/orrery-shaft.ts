import { ORRERY_RINGS, type OrreryState, orreryShaftOpen, type SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { orreryCorePoint } from "./orrery-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **The shaft**: a corridor of light straight down the core's column, on the
 * one beat a shot can reach the core.
 *
 * This is the picture the whole fight is for, and it is one no other boss in
 * this game can make, because no other boss is hollow. Everything else about
 * THE ORRERY is a count somebody says out loud; this is the count *arriving*,
 * and it has to be unmistakable at arm's length on a phone in a fifth of a
 * second — because THE SLOW is what buys the pair time to talk, not time to
 * look (`sim/slow.ts`).
 *
 * **It brightens the shaft rather than the screen**, which is the design's own
 * word and the right one: a flash across the field would say *something has
 * happened*, and what has to be said is *this column, now*. So it is a band
 * one column wide from the core down to the hull, and nothing outside that
 * column changes at all.
 *
 * **It is the same question the rules ask** (`orreryShaftOpen`), on the beat
 * and not on the tick, and it is drawn for the beat the pair is standing in
 * rather than the one coming — a corridor that opened early would be the
 * picture answering the question the readout exists to ask. The one thing the
 * beat phase does is fade it in and out, so a window one beat wide has an edge
 * a person can aim at rather than a frame that blinks.
 *
 * The design credits `light-shafts.ts` with this. That file is the backdrop's
 * sun stripes — a few dim bands leaning at the key light's angle, deliberately
 * losing the contrast contest with the creatures — and it is the wrong tool
 * twice over: it is stateless hashing over `time` rather than anything about a
 * beat, and *dim* is the opposite of what this moment needs.
 */

/** How much of the beat the corridor takes to come up, and to go again. */
const EDGE = 0.22;

export function drawOrreryShaft(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  beat: number,
  beatPhase: number,
): void {
  // Nothing to open a line of sight *to* once every ring is off: the core is
  // naked, the shaft is trivially open on every beat, and a corridor standing
  // there for the rest of the fight would say nothing at all.
  if (b.broken >= ORRERY_RINGS) return;
  if (!orreryShaftOpen(cfg, b, beat)) return;
  const p = Math.min(1, Math.max(0, beatPhase));
  const alpha = Math.min(1, Math.min(p, 1 - p) / EDGE);
  if (alpha <= 0) return;
  const { x, y } = orreryCorePoint(l, cfg);
  const half = l.tile * 0.34;
  const grad = ctx.createLinearGradient(0, y, 0, l.hullY);
  // Brightest at the core and gone by the hull, which is the way a line of
  // sight actually reads: the pair is looking *up* it.
  grad.addColorStop(0, PALETTE.crystalField);
  grad.addColorStop(1, PALETTE.background);
  ctx.save();
  ctx.globalAlpha = 0.34 * alpha;
  ctx.fillStyle = grad;
  ctx.fillRect(x - half, y, half * 2, l.hullY - y);
  ctx.restore();
}
