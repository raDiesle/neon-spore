import { CANNON_LOBE, CHOKE, livingPath } from "@neon-spore/content";
import { chokeHeading, chokeIsStuck, chokeTapsSoFar, type World } from "@neon-spore/sim";
import { COILS, coilStack, drawCoils, drawTail, pincers } from "./choke-coil.js";
import type { ChokeCrawlFx } from "./choke-crawl.js";
import { drawCrawler, paintStrand, STRAND_R } from "./choke-strand.js";
import type { Body } from "./creature-body-in.js";
import { contourClock, livingScale } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHOKE, drawn in its two states: a strand coming down a lane with its
 * hooks opening, and the same strand wound round the cannon's swelling once
 * it has it.
 *
 * **Nothing here is a new shape.** In the air it is TENDRIL's sac off the
 * shape sheet (`content/silhouettes-choke.ts`), tall and boneless. On the
 * ship it is a stack of loops round the swelling the hull grows under the
 * cannon (`choke-coil.ts`), with its loose end hanging off the side — a body
 * that has taken hold of something is drawn *on* it, the gum's rule. And
 * between the two, for most of a beat, the same sac crawling along the
 * plating from the lane it fell in to the cannon (`choke-strand.ts`,
 * `choke-crawl.ts`) — the owner's ask, so that the grip is seen to be
 * *taken* rather than to appear.
 *
 * **Its own material, on both screens**: the palette's `bile`, a yellow that
 * is nobody's ammunition and no seat's hull, so the strand reads the same on
 * the violet ship and the amber one and neither seat reads a colour off it
 * that says "load this".
 *
 * **What the picture has to say**, in the order it is needed:
 * 1. it has the cannon: the loops are on the swelling and go where it goes;
 * 2. how much is left: how many loops are still tight *is* the tap count,
 *    the top one unwinding first, and the strand's loose end grows by what
 *    has come off — the same readout player 1 has on the strip;
 * 3. where the cannon will be on the next beat: a light along the hull from
 *    the swelling toward the column it steps to, a streak rather than an
 *    arrow, which is the whole of what player 2 has to fire by.
 */

/** The loops' thickness and their vertical squash, in tiles. */
const COIL_W = 0.09;
const COIL_RY = 0.09;
/** How far down the hull's shoulder the lowest loop sits, in tiles: a grip
 * round a throat goes round the shoulders too. */
const GRIP_DOWN = 0.38;
/** How far the light toward the next column reaches, in tiles. */
const STREAK = 1.2;

export function drawChokeBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  // A choke on the cannon is drawn over the ship, by `drawStuckChokes`.
  if (chokeIsStuck(c)) return;
  const tile = l.tile;
  const s = livingScale(CHOKE, tile * STRAND_R);
  const path = new Path2D(livingPath(CHOKE, contourClock(c.id, time)));
  halo(ctx, x, y, tile * 0.9, hazed(world.cfg, PALETTE.bile, near), 0.28);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  paintStrand(ctx, path, s, world.cfg, near);
  ctx.restore();
  // The hooks under it, opening as it nears the ship: reaching for the thing
  // it is about to take. Swinging a little, on the body's own clock.
  const foot = { x, y: y + CHOKE.ry * s * 0.62 };
  const swing = Math.sin(contourClock(c.id, time) * 1.7) * 0.25;
  pincers(ctx, foot, Math.PI / 2 + swing, tile * 0.24, 0.25 + near * 0.6);
}

/**
 * The choke on the cannon, over the finished hull. `cannonX` is the eased
 * cannon the ship pass drew, not the world's column, so the loops ride the
 * swelling through its glide rather than jumping a beat ahead of it; and
 * `surfaceY` is the membrane the swelling is a lobe of, sampled at its foot
 * and its crown for the loops' base and top. `crawl` is how far along the
 * plating each choke's picture has got: one still crawling is drawn as the
 * strand on its way, and the loops go on when it arrives.
 */
export function drawStuckChokes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cannonX: number,
  surfaceY: SurfaceY,
  time: number,
  crawl?: ChokeCrawlFx,
): void {
  const tile = l.tile;
  const cfg = world.cfg;
  for (const c of world.creatures) {
    if (!chokeIsStuck(c)) continue;
    const way = crawl?.state(c.id);
    if (way && way.u < 1) {
      drawCrawler(ctx, tile, cfg, way, cannonX, surfaceY, time, c.id);
      continue;
    }
    const share = chokeTapsSoFar(c) / Math.max(1, cfg.chokeTaps);
    const half = CANNON_LOBE.halfTiles * tile;
    const top = surfaceY(cannonX) + tile * 0.08;
    const base = Math.max(surfaceY(cannonX - half), surfaceY(cannonX + half)) + tile * GRIP_DOWN;
    const dir = chokeHeading(cfg.cols, world.cannonCol, c);
    // The grab: the loops flashing on as the crawl ends, a light that swells
    // and goes in the moment it takes the throat.
    if (way && way.grab < 1) {
      const g = way.grab;
      halo(ctx, cannonX, (top + base) / 2, tile * (1.4 + 1.2 * g), PALETTE.bileRim, 0.7 * (1 - g));
    }
    // The light toward the column the cannon steps to on the beat.
    streak(ctx, cannonX, (top + base) / 2, tile, dir * STREAK * tile);
    halo(
      ctx,
      cannonX,
      (top + base) / 2,
      tile * 1.3,
      PALETTE.bile,
      0.35 + 0.15 * Math.sin(time * 6),
    );
    // What the loops are wound round, by height: the hull's shoulder at the
    // foot, the swelling's neck at the crown.
    const profile = (u: number): number => half * (1.05 - 0.6 * u);
    const coils = coilStack(cannonX, top, base, profile, tile * COIL_RY, share);
    drawCoils(ctx, coils, tile * COIL_W);
    // The loose end: off the top loop, over the shoulder and down the hull's
    // face against the way the cannon walks, and longer by what has been
    // unwound. Its hooks are shut while the grip holds and open as it loosens.
    const loose = Math.floor(share * COILS);
    const len = tile * (0.5 + loose * 0.25);
    const crown = { x: cannonX - dir * half * 0.4, y: top };
    const end = { x: cannonX - dir * (half + len * 0.5), y: base + len };
    const belly = { x: cannonX - dir * (half * 1.4 + len * 0.3), y: top + len * 0.25 };
    drawTail(ctx, crown, end, belly, tile * COIL_W * 1.3, time + c.id, share);
  }
}

/** The light along the hull toward the column the cannon goes to next. */
function streak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  dx: number,
): void {
  const g = ctx.createLinearGradient(x, 0, x + dx, 0);
  g.addColorStop(0, rgba(PALETTE.bile, 0.5));
  g.addColorStop(1, rgba(PALETTE.bile, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  const h = tile * 0.3;
  ctx.fillRect(Math.min(x, x + dx), y - h / 2, Math.abs(dx), h);
  ctx.restore();
}
