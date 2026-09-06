import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The whole ship, shocked.**
 *
 * A wall that finds the dome in its way does not strike the hull — it earths
 * through the shield, and the current has to go somewhere after that. The
 * owner asked to see where: *when the fence reaches the shield and does damage,
 * I also want the full ship to have energy animations, like it got shocked by
 * electricity.*
 *
 * So for a moment after the breach the ship conducts. Arcs run along its own
 * membrane from wall to wall, crossing the lobes and the hollows the way a
 * charge crawls over a surface, with short hops jumping clear of the skin and
 * back into it. Nothing here is placed on a column and nothing is placed on the
 * shield: the point is that it is *the whole ship*, and the place it went in is
 * already said twice over by the outage on the shield's line
 * (`shield-outage.ts`) and by the burst at the hull.
 *
 * **It is drawn along the surface rather than over the body**, which is the one
 * decision in the file. A wash of light over the hull is a ship lit from
 * outside; a line that follows every rise the membrane takes is a charge *in*
 * it. `surfaceY` is the same sampler the hull was drawn from, so the arcs ride
 * the cannon and the dome and cannot drift off them.
 *
 * `fence-strike.ts` owns the clock. This file draws one shock at one strength.
 */

/** Arcs crawling the surface at full strength. Enough to read as the ship
 * being lit all over, few enough that each one is a line rather than a haze. */
const CRAWLERS = 7;

/** How much of the ship's width one crawler covers, at least and at most. */
const RUN_MIN = 0.16;
const RUN_MAX = 0.42;

/** Steps along a crawler, per tile of its run. */
const PER_TILE = 1.6;

/** How far a crawler lifts off the skin at its loosest, as a share of a tile.
 * Small: it is a charge running over a surface, not a bolt leaving it. */
const LIFT = 0.22;

/** Short hops that jump clear of the membrane and back — the part that reads
 * as electricity rather than as a bright outline. */
const HOPS = 5;
const HOP_HEIGHT = 0.5;

/** Times a second the whole picture is struck again. The same clock the arcs
 * between the wall and the dome run on, so a shock reads as the end of that
 * argument rather than as a new thing (`fence-arc.ts`). */
const STRIKE_HZ = 22;

/**
 * One shock at one strength. `force` is 1 the instant the wall lands and 0
 * when the ship is quiet again.
 */
export function drawHullShock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  time: number,
  force: number,
): void {
  if (force <= 0) return;
  const strike = Math.floor(time * STRIKE_HZ);
  const left = l.gridLeft;
  const width = l.gridWidth;

  ctx.save();
  // Every arc in the wall's own blue, not the shield's cyan and not a damage
  // red: what is running through the ship is the thing that came down on it,
  // and an impact is drawn in the colour of what made it.
  for (let i = 0; i < CRAWLERS; i++) {
    const run = width * (RUN_MIN + (RUN_MAX - RUN_MIN) * Math.abs(signedHash(i, 1, strike)));
    const from = left + (width - run) * ((signedHash(i, 2, strike) + 1) / 2);
    const steps = Math.max(3, Math.round((run / l.tile) * PER_TILE));
    const path = new Path2D();
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const x = from + run * t;
      // Pinned where it meets the skin at both ends, loosest in the middle:
      // a charge that lifted off at its own ends would read as a line laid
      // over the ship rather than as one running through it.
      const belly = Math.sin(t * Math.PI);
      const y = surfaceY(x) + signedHash(i, 4 + k, strike) * l.tile * LIFT * belly * force;
      if (k === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    strokeGlow(ctx, path, PALETTE.arc, Math.max(1.2, l.tile * 0.035), 0.6 + 1.2 * force);
  }

  // The hops: short arcs that leave the membrane and come back a fraction of a
  // tile along it. Brighter and thinner than the crawlers, so the eye reads
  // them as the discharge and the crawlers as what is carrying it.
  for (let i = 0; i < HOPS; i++) {
    const x = left + width * ((signedHash(i, 7, strike) + 1) / 2);
    const w = l.tile * (0.2 + 0.3 * Math.abs(signedHash(i, 8, strike)));
    const path = new Path2D();
    path.moveTo(x - w, surfaceY(x - w));
    path.lineTo(
      x + signedHash(i, 9, strike) * w * 0.4,
      surfaceY(x) - l.tile * HOP_HEIGHT * force * (0.5 + 0.5 * Math.abs(signedHash(i, 10, strike))),
    );
    path.lineTo(x + w, surfaceY(x + w));
    strokeGlow(ctx, path, PALETTE.arcRim, Math.max(1, l.tile * 0.025), 1 + 1.4 * force);
  }
  ctx.restore();
}
