import { beatsFromSeconds, type OwnMotion, type Pose } from "@neon-spore/content";
import type { Bounds, Subject } from "@neon-spore/shape-sheet";
import { DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * Own-motion, in the units a card is drawn in.
 *
 * `content/own-motion.ts` measures a sway in **tiles**, because that is the
 * only unit that survives a different screen — the game multiplies by
 * `layout.tile` and gets the same fraction of a lane on a phone and on a
 * tablet. A catalogue card has no layout and no tile, so it has to work one
 * out, or a sway drawn here is not the sway the game draws.
 *
 * Split out of `shapes-panel.ts` because it is arithmetic with no DOM in it:
 * a card that clips its own shape is a bug you can catch in a test, and the
 * panel around it is not.
 */

/**
 * How many contour pixels one tile is worth, for a shape drawn at creature
 * scale. `render/creatures.ts` fits a creature into a circle of `tile * 0.4`
 * by scaling its longest half-axis to that radius, so one tile is that half
 * axis divided by 0.4 — which is exactly what makes the bulb's 0.17-tile sway
 * come out the same fraction of its own width here as it does on the field.
 */
export function tilePixels(b: Bounds): number {
  const half = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2;
  return half / 0.4;
}

/**
 * A pose at a moment on the card's clock, which is seconds.
 *
 * The field's pose clock is `world.beat + beatPhase`, so that two phones agree
 * about what a body looks like; a card has no world, and its contour wobble is
 * genuinely sampled in seconds. This is the one place the two meet, and every
 * caller here goes through it — a card that converted at its own rate would be
 * showing a sway the game does not have, which is the failure `own-motion.ts`
 * exists to prevent.
 */
function poseAtSecond(motion: OwnMotion, t: number): Pose {
  return motion.poseAt(beatsFromSeconds(t, DEFAULT_CONFIG.bpm));
}

export interface Centre {
  x: number;
  y: number;
}

/**
 * The pose as an SVG transform, applied about the shape's own centre rather
 * than the origin: rotating a hull arc about (0, 0) swings it out of the card,
 * because an open contour is nowhere near the origin it was sampled from.
 */
export function motionTransform(
  motion: OwnMotion | undefined,
  t: number,
  centre: Centre,
  tile: number,
): string {
  if (!motion) return "";
  const p = poseAtSecond(motion, t);
  const dx = centre.x + p.dx * tile;
  const dy = centre.y + p.dy * tile;
  const deg = ((p.rot * 180) / Math.PI).toFixed(2);
  return (
    `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${deg}) ` +
    `scale(${p.sx.toFixed(4)} ${p.sy.toFixed(4)}) translate(${-centre.x} ${-centre.y})`
  );
}

/** The pose applied to one point, in the same order the transform applies it. */
function move(
  x: number,
  y: number,
  p: ReturnType<OwnMotion["poseAt"]>,
  c: Centre,
  tile: number,
): { x: number; y: number } {
  const sx = (x - c.x) * p.sx;
  const sy = (y - c.y) * p.sy;
  const cos = Math.cos(p.rot);
  const sin = Math.sin(p.rot);
  return {
    x: c.x + p.dx * tile + sx * cos - sy * sin,
    y: c.y + p.dy * tile + sx * sin + sy * cos,
  };
}

/**
 * The box a subject needs once its own-motion is counted in.
 *
 * Fitting a card to the contour alone is what makes a shape that sways look
 * fine standing still and then walk off the edge of its own frame — which is
 * the one failure a catalogue of animated shapes must not have, because it
 * reads as the shape being wrong rather than the card being small.
 */
export function transformedBounds(
  subject: Subject,
  motion: OwnMotion | undefined,
  times: number[],
  tile: number,
  centre: Centre,
): Bounds {
  const b: Bounds = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  // The wobble's three layers have no common period, so the extremes are found
  // by scanning rather than by solving — the same choice `metrics.ts` makes.
  // The window is the slowest layer's own period, `sin(t * 0.31)`, and the
  // step is as coarse as the clip test will allow: a contour sample costs a
  // metaball bisection for the cluster forms, and thirty-odd cards are built
  // in one go the first time the sheet is opened.
  const scan = [...times, ...Array.from({ length: 128 }, (_, i) => i * 0.16)];
  // A second pass, over the motion alone and far finer. `TWITCH` holds still
  // for two thirds of its cycle and then flicks: a 0.2 s step walks straight
  // over the flick, fits the card to the stillness, and the flick then leaves
  // the frame. The pose is cheap, so it is sampled at 0.01 s — applied to the
  // corners of the still box rather than to a contour, which costs four points
  // instead of sixty-four and can only ever make the frame roomier.
  if (motion) {
    const still = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const t of scan) {
      for (const p of subject.pointsAt(t)) {
        if (p.x < still.x0) still.x0 = p.x;
        if (p.x > still.x1) still.x1 = p.x;
        if (p.y < still.y0) still.y0 = p.y;
        if (p.y > still.y1) still.y1 = p.y;
      }
    }
    const corners = [
      { x: still.x0, y: still.y0 },
      { x: still.x1, y: still.y0 },
      { x: still.x0, y: still.y1 },
      { x: still.x1, y: still.y1 },
    ];
    // Sixty-four seconds, not sixteen: `DRIFT` is built out of two slow
    // frequencies chosen not to divide into each other, and its widest excursion
    // is a beat the two of them only share once every half minute.
    for (let t = 0; t < 64; t += 0.01) {
      const pose = poseAtSecond(motion, t);
      for (const c of corners) {
        const q = move(c.x, c.y, pose, centre, tile);
        if (q.x < b.x0) b.x0 = q.x;
        if (q.x > b.x1) b.x1 = q.x;
        if (q.y < b.y0) b.y0 = q.y;
        if (q.y > b.y1) b.y1 = q.y;
      }
    }
  }

  for (const t of scan) {
    const pts = subject.pointsAt(t);
    if (!motion) {
      for (const p of pts) {
        if (p.x < b.x0) b.x0 = p.x;
        if (p.x > b.x1) b.x1 = p.x;
        if (p.y < b.y0) b.y0 = p.y;
        if (p.y > b.y1) b.y1 = p.y;
      }
      continue;
    }
    // The same centre the drawn transform turns about — the still shape's, not
    // the moving one's. A box measured about a centre that chases the sway is
    // a box the drawing does not agree with, which is how a card clips.
    const pose = poseAtSecond(motion, t);
    for (const p of pts) {
      const q = move(p.x, p.y, pose, centre, tile);
      if (q.x < b.x0) b.x0 = q.x;
      if (q.x > b.x1) b.x1 = q.x;
      if (q.y < b.y0) b.y0 = q.y;
      if (q.y > b.y1) b.y1 = q.y;
    }
  }
  // A margin, because the scan above is a sampling and not a solution: the
  // three wobble layers have no common period, so a step coarse enough to fit
  // thirty cards in a fraction of a second can always land either side of an
  // extreme. Four percent is more than any of them was caught missing by, and
  // a frame that is a hair roomy costs nothing — one that is a hair tight
  // clips, and a clipped shape reads as the shape being wrong.
  // Taken off the longer side and spent on both, rather than three percent of
  // each: the hull arcs are forty times as wide as they are tall, and a margin
  // proportional to *their* height is no margin at all on the one axis where
  // the membrane actually breathes.
  const m = Math.max(b.x1 - b.x0, b.y1 - b.y0) * 0.04;
  return { x0: b.x0 - m, x1: b.x1 + m, y0: b.y0 - m, y1: b.y1 + m };
}
