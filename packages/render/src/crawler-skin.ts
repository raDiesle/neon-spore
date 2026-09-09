import { CRAWLER, facet, LAT_LIMIT, LIGHT_HALF, pin, surfaceDim } from "@neon-spore/content";
import type { CrawlerLinkDraw } from "./crawler-look.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The wet on a maggot, and the little on its face**, which is the whole of
 * what makes THE CRAWLER read as alive rather than as a row of shapes.
 *
 * Cut out of `crawler.ts` when the rework that gave the worm overlapping rings
 * took that file over its 250-line limit, and along a seam it already had:
 * next door is *the run* — which ring is which material, where each one stands,
 * what order they are painted in — and none of it is a light. This is the
 * light, and it is the half the owner will keep asking for changes to, because
 * *slimy, alien and living* is a judgement made with an eye.
 *
 * Nothing here knows what a world or a creature is. It takes a contour, a
 * centre, two radii and where the ring stands in its own contraction, and it
 * draws on top of whatever colour the caller has already filled.
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
const PINS = Array.from({ length: PORES }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.7, REACH),
);

/**
 * The wet on one ring, as a ball rather than as a picture of one.
 *
 * It was three ellipses laid out in picture coordinates — a belly shadow, a
 * specular along the top and a catchlight that slid sideways as the ring
 * squeezed. Good paint, and entirely *posed*: what travelled when the worm
 * walked was the highlight, which is a light following the animal about. The
 * owner took PEARL out of VERSUS on 9 September 2026 and this is it.
 *
 * It takes the whole ring record rather than eight loose numbers because it is
 * a field on `CRAWLER_LOOK` and a candidate surface is patched onto that
 * record — a second spelling of the arguments would be a second thing to keep
 * in step (`crawler-look.ts`).
 *
 * Three passes, and the order is the one `litPass` uses: the value ramp that
 * puts a terminator across the body, the pores that ride round on the surface
 * under it, and the one specular that does not move at all.
 */
export function drawSlime(d: CrawlerLinkDraw): void {
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
    // `beginPath` and not a `Path2D` per pore: five rings' worth of them is
    // twenty allocations a frame on the busiest row of the screen, and a pore
    // is drawn once and never reused (`crawler-budget.test.ts`).
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.17, ry * 0.17, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.background, 0.5 * surfaceDim(PORE_FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
  }

  // And the specular, which stays exactly where it is while all of that travels
  // under it. It is the half of the pair that cannot be faked by a pose and the
  // half a pose cannot be faked without: a lit ball that does not move is a
  // still life, and a surface that moves under no light is a coin.
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.34, rx * 0.26, ry * 0.2, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.34);
  ctx.fill();
  ctx.restore();
}

/**
 * The face: one eye with a catchlight in it, and a mouth under the leading
 * edge.
 *
 * A maggot's head is a hard cap with almost nothing on it, and almost nothing
 * is what survives the forty pixels a body draws at — an eye that says *this
 * end is alive and pointed at the far wall*, and a slot that says it eats. It
 * sat as a bare hole for a version and read as damage rather than as a face.
 */
export function drawFace(d: CrawlerLinkDraw): void {
  const { ctx, rx, ry, dir, squeeze: bite } = d;
  const x = 0;
  const y = 0;
  const eye = new Path2D();
  eye.ellipse(x + dir * rx * 0.34, y - ry * 0.3, rx * 0.16, ry * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.background;
  ctx.fill(eye);
  const spark = new Path2D();
  spark.ellipse(x + dir * rx * 0.39, y - ry * 0.38, rx * 0.06, ry * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.85;
  ctx.fill(spark);
  ctx.globalAlpha = 1;
  // The mouth, opening and shutting on the contraction: a short arc under the
  // leading tip rather than a hole through the cap.
  const mouth = new Path2D();
  const lip = x + dir * rx * 0.62;
  const gape = ry * (0.16 + (bite + 1) * 0.07);
  mouth.moveTo(lip - dir * rx * 0.12, y + ry * 0.24);
  mouth.quadraticCurveTo(lip + dir * rx * 0.16, y + ry * 0.24 + gape, lip, y + ry * 0.5);
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(mouth);
}
