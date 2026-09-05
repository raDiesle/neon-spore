import { type Creature, linkIsArmoured, type World } from "@neon-spore/sim";
import { linkCenter, linkScale } from "./crawler-place.js";
import { hazed, nearness } from "./depth.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What each ring of THE CRAWLER is owed, said on the ring itself.**
 *
 * The worm is the one body in the game whose answer changes link by link along
 * a single creature, and the pair has to agree an *order of work* on it out
 * loud while it walks (`sim/crawler.ts`). Reading that order off the materials
 * alone — lit colour means cannon, dead grey means dome — is a thing a pair
 * learns, and until they have learned it the whole creature is a guessing game
 * played against a clock. So the owner asked for it to be stated: a crosshair
 * over every ring, and the shield's own mark over the ones the dome has to
 * take.
 *
 * **A crosshair on every ring, and that is deliberate.** It would have been
 * easy to put one only over the rings the cannon answers and let its absence
 * say the rest — and it would have been the wrong picture, because a plate is
 * still a *column* somebody has to be standing under. The crosshair says
 * "this lane, now"; the mark above it says which of the two controls is
 * standing in it. Both seats need the first half whichever half of the job
 * they are holding.
 *
 * **Marks are light.** Four ticks around a gap and a small dome, stroked
 * through `strokeGlow` rather than filled and never boxed — the field's own
 * rule about how a thing is picked out, and the reason nothing here is a ring
 * or a frame.
 *
 * **Every mark is the ship's own pale, and none of them is a body's colour.**
 * Two reasons and they arrive at the same ink. A crosshair drawn in the ring's
 * own red or cyan is a mark you can barely see, because it is lying on a field
 * of that colour — and it would say nothing the fill under it does not already
 * say. And the dome's mark cannot be the shield's cyan, because `PALETTE.shield`
 * *is* `PALETTE.cyan` and cyan on a crawler is a word the pair says out loud
 * to mean ammunition; a cyan mark over a plate would be the one misleading
 * thing this file could draw. So these are instruments rather than bodies,
 * drawn in the light the ship's own things are drawn in (`crawler-fx.ts`).
 */

/** How far out the crosshair's ticks stand, as a share of a tile. Outside the
 * ring's own contour, so the mark reads as laid over the animal and not as a
 * feature of it. */
const REACH = 0.5;
/** And how long each tick is, as the same share. A body is about forty pixels
 * across on a phone, so a tick under a fifth of a tile is a smudge. */
const TICK = 0.22;

/** How far above the ring the dome sits, as a share of a tile — clear of the
 * crosshair's top tick, which is the thing it must not touch. */
const LIFT = 0.78;
/** Half the dome's width, and its height, in the same units. */
const DOME_W = 0.2;
const DOME_H = 0.17;

/** One ring's marks: the crosshair, and the dome when the shield is owed. */
export function drawLinkMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beats: number,
  beatPhase: number,
): void {
  if (l.tile <= 0) return;
  const { x, y } = linkCenter(l, c, beatPhase);
  const k = linkScale(world, l);
  const ink = hazed(world.cfg, PALETTE.hullRim, nearness(l, world.cfg.rows - 2));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  // One path and one glow for both marks. They are the same ink and the same
  // weight, and `strokeGlow` is four strokes — a second call per ring would
  // double the dearest thing on the field's cheapest picture, over a body that
  // can be nine rings long (`crawler-budget.test.ts`).
  const marks = crosshair(l, x, y);
  if (linkIsArmoured(c)) dome(marks, l, x, y, beats);
  strokeGlow(ctx, marks, ink, STROKE.outline);
  ctx.restore();
}

/**
 * Four ticks pointing in at the ring's centre, with the middle left empty.
 *
 * The gap is the whole of why this is a crosshair rather than a cross: what
 * the pair is looking at is the ring, and a mark that crossed over it would be
 * a line drawn through the colour they have to name.
 */
function crosshair(l: Layout, x: number, y: number): Path2D {
  const out = l.tile * REACH;
  const inn = out - l.tile * TICK;
  const p = new Path2D();
  for (const [dx, dy] of [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ] as const) {
    p.moveTo(x + dx * inn, y + dy * inn);
    p.lineTo(x + dx * out, y + dy * out);
  }
  return p;
}

/**
 * The shield's mark, added to the ring's own mark path: a dome on a base line,
 * which is the shape of the thing itself — a closed lid standing off a surface
 * rather than lying on it.
 *
 * It breathes on the beat, a little, and the reason is the control it stands
 * for: the dome is the one answer in this game that has to be given *on* a
 * count, so its mark is the one thing over the field that is visibly counting.
 */
function dome(p: Path2D, l: Layout, x: number, y: number, beats: number): void {
  const pulse = 1 + 0.12 * Math.sin(beats * Math.PI * 2);
  const w = l.tile * DOME_W * pulse;
  const h = l.tile * DOME_H * pulse;
  const top = y - l.tile * LIFT;
  p.moveTo(x - w, top + h);
  p.quadraticCurveTo(x - w, top - h * 0.7, x, top - h * 0.7);
  p.quadraticCurveTo(x + w, top - h * 0.7, x + w, top + h);
  p.moveTo(x - w * 1.25, top + h);
  p.lineTo(x + w * 1.25, top + h);
}
