import { sinHash } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { glowStroke, spent } from "../../../../../packages/render/src/slow-crawl.js";
import { clipRoundBody } from "../../../../../packages/render/src/slow-keep-out.js";
import { beatFrac } from "../../../../../packages/render/src/slow-lens.js";
import { withLight } from "./window.js";

/** Rings of knots round the boss, in body radii, inner first. */
const RINGS = [1.25, 1.55, 1.9] as const;

/** Knots on each ring. */
const KNOTS = 16;

/** How far round a knot is thrown on a downbeat, in turns, before it brakes to nothing. */
const THROW = 0.22;

/** How hard it brakes: the larger, the sooner it is all but still. */
const BRAKE = 5;

/** A knot's trail at full speed, in turns, and its width, in body radii. */
const TRAIL = 0.14;
const WIDTH = 0.035;

/** How bright a knot is, inner ring first: the nearer the boss, the brighter. */
const LIT = [0.9, 0.6, 0.4] as const;

/**
 * **HORIZON — light orbits the boss and runs down.** Three rings of knots of
 * light circle the boss's head. On every slowed downbeat they are flung round
 * it as long cold arcs, and across the beat they brake — the arcs shorten to
 * points and warm to red, and by the end of the beat they have all but
 * stopped, hanging round the boss until the next downbeat throws them again.
 * The inner ring, nearest the boss, is flung least and slows first: time is
 * slower the closer it is.
 *
 * How it can lose: the rings are round the head, and THE INSTAR's wings reach
 * through all three, so a knot resting on a wing reads as a mark on it.
 */
export const horizonWindow = withLight((ctx, l, at, up, win) => {
  const floor = l.hullY;
  if (floor <= 0 || at.r <= 0) return;
  const u = beatFrac(win);
  const beat = Math.floor(spent(win));

  ctx.save();
  clipRoundBody(ctx, l, at, 0, floor);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  RINGS.forEach((ring, i) => {
    const rad = at.r * ring;
    // Nearer rings brake harder: the same fall, a slower clock.
    const brake = BRAKE * (1 + (RINGS.length - 1 - i) * 0.5);
    const gone = 1 - Math.exp(-brake * u);
    const speed = 1 - gone;
    const colour = mixHex(PALETTE.arcRim, PALETTE.red, gone ** 3);
    const lit = (LIT[i] ?? 0) * up;
    const dir = i % 2 === 0 ? 1 : -1;
    for (let k = 0; k < KNOTS; k++) {
      // Where this knot rests is kept from beat to beat, so the rings are
      // seen to wind on rather than to be dealt again.
      const home = (k + sinHash(i, k) * 0.6) / KNOTS + beat * THROW * dir;
      const head = (home + THROW * dir * gone) * Math.PI * 2;
      const trail = (TRAIL * speed + 0.004) * Math.PI * 2 * dir;
      const width = at.r * WIDTH * (0.8 + sinHash(i, k, 1) * 0.4);
      ctx.strokeStyle = rgba(colour, lit);
      ctx.beginPath();
      if (dir > 0) ctx.arc(at.x, at.y, rad, head - trail, head);
      else ctx.arc(at.x, at.y, rad, head, head - trail);
      glowStroke(ctx, width);
    }
  });
  ctx.restore();
});
