import { CRAWLER, LIGHT_HALF } from "../../../../../packages/content/src/index.js";
import {
  facet,
  LAT_LIMIT,
  type Pin,
  pin,
  surfaceDim,
} from "../../../../../packages/content/src/surface.js";
import type { CrawlerLinkDraw } from "../../../../../packages/render/src/crawler-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The paint PEARL is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls — FORGE's
 * arrangement next door, and its reason.
 *
 * Everything here is drawn from the numbers the ring record hands over, and
 * nothing caches a frame of its own. A candidate lives inside two renderers
 * stepping one world, so a module-level canvas here would be state shared
 * between the two sides of the pair, which is the one thing the pair promises
 * it does not have. The only thing held anywhere is `litRound`'s own sprite
 * cache, which is keyed on a quantised radius and a quantised spin and is the
 * shipped renderer's, not this file's.
 */

/**
 * How long a ring's surface takes to come all the way round, in beats, and how
 * far behind the ring in front of it each one runs.
 *
 * Four beats is slow enough that a pore crossing the middle is a thing an eye
 * follows rather than a flicker, and fast enough that the far side of a ring
 * has been round at least once inside the seven beats a worm is on screen. The
 * lag is the same idea `CRAWLER_PULSE` already has about the contraction — the
 * rings are out of step, and that is what makes six shapes read as one animal —
 * but it is **this candidate's own number and not a second copy of that one**:
 * the pulse is a rule the simulation and both devices agree about, and a skin
 * turning is a picture.
 */
const ROLL_BEATS = 4;
const ROLL_LAG = 0.5;

/** How many pores a ring wears, and how far they reach out of its own centre.
 * Eight: enough that two or three are on the near side at any turn, few enough
 * that at forty pixels they are marks rather than a texture. */
const PORES = 8;
const REACH = 0.72;

/** What is left of a pore where the surface has turned fully away from the
 * light. Not nought: a mark that reaches zero at the terminator reads as a
 * hole, and half a worm with no marks on it at all is half a worm that has
 * stopped being made of anything (`surfaceDim`). */
const PORE_FLOOR = 0.3;

/**
 * Where the pores sit, worked out once for the module rather than per ring.
 *
 * Spread by the golden angle in longitude and by a shallow sine in latitude,
 * so no two are on the same meridian and none of them sits near a pole — a
 * patch at `cos(lat) ≈ 0` is a horizontal hairline whatever the rotation does,
 * which is what `LAT_LIMIT` is for.
 */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS: Pin[] = Array.from({ length: PORES }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.7, REACH),
);

/**
 * The wet on one ring, as a ball rather than as a picture of one.
 *
 * Three passes, and the order is the one `litPass` uses: the value ramp that
 * puts a terminator across the body, the pores that ride round on the surface
 * under it, and the one specular that does not move at all.
 */
export function pearl(d: CrawlerLinkDraw): void {
  const { ctx, body, ry, dir, squeeze, beats, order } = d;
  // `CRAWLER.pulse` called and never spelled out: how far a contraction narrows
  // a ring is content's number, and a second copy of it here would be a worm
  // that squeezes by one amount and shines by another.
  const rx = d.rx * (1 - CRAWLER.pulse * squeeze);
  // Backwards along the way it is going, which is what a crawling thing's skin
  // does: the surface travels toward the tail while the animal travels toward
  // the wall, and the lag makes that travel run down the chain.
  const theta = -dir * ((beats / ROLL_BEATS) * Math.PI * 2 - order * ROLL_LAG);

  ctx.save();
  ctx.clip(body);
  // The value half only, which is the rule rather than a taste: a creature's
  // red-or-cyan is a fact one player says out loud, so a light that moved its
  // hue would be moving the callout (`LIGHT_HALF`).
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature);

  // The pores, placed. Each is drawn about its own origin and foreshortened by
  // the tangent plane's own map, so one coming round the limb narrows to
  // nothing instead of being clipped by an edge — which is the whole
  // difference between a mark on a surface and a sticker on a disc.
  for (const p of PINS) {
    const f = facet(p, theta);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * rx, f.y * ry);
    ctx.scale(f.sx, f.sy);
    const pore = new Path2D();
    pore.ellipse(0, 0, rx * 0.17, ry * 0.17, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.background, 0.5 * surfaceDim(PORE_FLOOR, f.lit));
    ctx.fill(pore);
    ctx.restore();
  }

  // And the specular, which stays exactly where it is while all of that travels
  // under it. It is the half of the pair that cannot be faked by a pose and the
  // half a pose cannot be faked without: a lit ball that does not move is a
  // still life, and a surface that moves under no light is a coin.
  ctx.globalCompositeOperation = "lighter";
  const wet = new Path2D();
  wet.ellipse(-rx * 0.3, -ry * 0.34, rx * 0.26, ry * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.34);
  ctx.fill(wet);
  ctx.restore();
}
