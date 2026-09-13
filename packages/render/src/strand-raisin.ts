import { blobPoints } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import type { Bead } from "./strand-bead.js";

/**
 * THE STRAND's raisin: a bead with the life taken out of it — small, dark,
 * deeply lobed, no glow — and drawn on *both* screens, because how far along
 * the thread the pair has got is the one fact about this creature that is not
 * split. It is also the only readout either of them has, since a shot at the
 * wrong bead swells one of these back (`strand-round.ts`).
 *
 * The bottom of `strand-bead.ts` until 13 September 2026; a file of its own
 * because the reel's placement grew a world that day and pushed that file over
 * its limit, and because the two change for different reasons — the reel is a
 * picture about not knowing, and this is a picture of a thing that is over.
 */

/** How much of a body's footprint a raisin takes: less than half, against the
 * reel's shade under one (`REEL_MUL`) — the step is what says *this one is
 * done*. */
const RAISIN_MUL = 0.42;

/** A spent bead: the rock's dark, which is the one neutral in the palette that
 * is plainly not alive. */
const DEAD = PALETTE.rockDark;
const DEAD_RIM = PALETTE.sparkDim;

/** Six shallow lobes on an ovoid — the raisin's contour, and nothing else's.
 * Six is free: slick is 2, dart 3, wisp 5, throb 6 and round where this is
 * not. */
const RAISIN_LOBES = 6;

/**
 * One bead that has been shot: shrivelled, dark, and still hanging on the
 * thread. Drawn on both screens.
 */
export function drawRaisin(b: Bead): void {
  drawRaisinAt(b.ctx, b.l, b.world.cfg, b.c.id, b.x, b.y, b.time, b.near);
}

/** The same raisin from a point and an id — for the beads a thread still
 * carries while it burns, after the bodies have left the world
 * (`strand-fuse.ts`). */
export function drawRaisinAt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  id: number,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  const haze = (h: string): string => hazed(cfg, h, near);
  const r = l.tile * 0.4 * RAISIN_MUL;
  const t = contourClock(id, time);
  // Deep lobes and a slow wobble: a body that has lost its water pulls in
  // between its own ribs rather than staying round, and the creases are the
  // only thing this shape has to say.
  const body = splinePath(blobPoints(x, y, r, r * 0.86, RAISIN_LOBES, 0.34, 0.02, t, 2.5), true);
  ctx.fillStyle = haze(DEAD);
  ctx.fill(body);
  ctx.strokeStyle = haze(DEAD_RIM);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(body);
  // The one thing left of it, and it is barely there: a spent bead throws no
  // light of its own, so what stands in for the glow every living body has is
  // the faintest lift off the thread it is hanging on.
  halo(ctx, x, y, r * 1.6, haze(DEAD_RIM), 0.1);
}
