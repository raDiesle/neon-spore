import { crystalRadiusMul, METEOR, type Point } from "@neon-spore/content";
import type { Crater } from "./crater-geom.js";
import { stream } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import type { HullSkin } from "./hull.js";
import { shatter } from "./shatter.js";

/**
 * SPALL — the membrane around a hole, buckled inward in plates.
 *
 * The hull used to meet a hole at full brightness, as though it had been
 * punched cleanly by something very sharp. What a hole in a skin actually does
 * is take the skin *with* it, so this cuts a ring of plates out of the hole's
 * own outline — the same crystal the crater is, at `REACH` times its radius, so
 * every plate's inner edge is exactly the hole's rim — and pulls each of them a
 * little toward the pit, turned by a degree or two of its own. The material is
 * still there and it is no longer flat: it is caved, and it is darker the
 * closer it gets to what went through it.
 *
 * It is the same fracture the creature break uses (`shatter.ts`) spent the
 * other way round: on a **permanent deformation** rather than on debris.
 *
 * It came in as `ship:crater` / `spall` and the owner took it on 9 September
 * 2026, with two things to repair on the way in, both of them recorded here
 * because both are rules rather than tastes.
 *
 * **Nothing is drawn above the ship's own surface.** The candidate clipped to a
 * flat rectangle at the skin line *above the hole's centre*, and the membrane
 * is a curve — so wherever the surface fell away to one side of a hole, plates
 * drawn down to that flat line stood in the sky beside the ship. The clip is
 * the hull's own filled contour now, applied once around every crater by
 * `hull.ts`, so a plate can no more rise above the skin than the ship can.
 *
 * **The colours are the seat's, not the palette's.** Player two's ship is amber
 * (`seat-skin.ts`) and this was written against `PALETTE.hull`, so every hole
 * on that screen was lined with player one's violet. Every colour here is read
 * off the `HullSkin` the hull was drawn with, which also means THE MIRROR's
 * copy wears its own.
 */

/** How far out the buckled ring reaches, as a multiple of the hole's radius. */
const REACH = 1.7;
/** How many plates the ring is cut into. Enough to read as material and few
 * enough that each is a plate rather than a grain. */
const PLATES = 11;
/** How far each plate is pulled toward the pit, as a share of its distance. */
const PULL = 0.07;
/** The most a plate is turned out of true, in radians. A buckle is a small
 * angle: past this the ring reads as rubble sitting in a hole. */
const TILT = 0.075;

/** The hole's own outline at `REACH` times its size, in screen space — the
 * crystal `craters.ts` measures the mouth from, rotated the same way. */
export function ring(c: Crater, reach = REACH): Point[] {
  const cos = Math.cos(c.rotation);
  const sin = Math.sin(c.rotation);
  const pts: Point[] = [];
  const n = METEOR.sides * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = crystalRadiusMul(a, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed);
    const px = Math.cos(a) * c.r * reach * m;
    const py = Math.sin(a) * c.r * reach * m;
    pts.push({ x: px * cos - py * sin, y: px * sin + py * cos });
  }
  return pts;
}

/**
 * The ring of buckled plates, drawn about the hole's own centre.
 *
 * The caller has already translated to `centreY(c)`; nothing here touches the
 * transform except its own per-plate `save`/`restore`, so a look that wants to
 * put something else in the same frame of reference can call this and then keep
 * drawing.
 */
export function spallRing(ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin): void {
  const rnd = stream(Math.round(c.x) * 7919 + Math.round(c.r));
  for (const s of shatter(ring(c), {
    ox: 0,
    oy: 0,
    wedges: PLATES,
    innerAt: 1 / REACH,
    speed: 0,
    spin: 0,
    seed: Math.round(c.x * 13),
  })) {
    // The inner ring of the cut is the hole itself, and it is filled opaque
    // over the top of this. Only the outer plates are the skin that stayed.
    if (s.depth < 0.6) continue;
    const pull = 1 - PULL;
    ctx.save();
    ctx.translate(s.x * pull, s.y * pull);
    ctx.rotate((rnd() - 0.5) * 2 * TILT);
    ctx.beginPath();
    const first = s.points[0] as Point;
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < s.points.length; i++) {
      const p = s.points[i] as Point;
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    // Dark at the pit and back to the ship's own membrane colour at the far
    // edge, which is where the intact skin resumes. A plate that stayed
    // hull-bright would be a facet of the ship lying at an angle, not skin
    // pulled into a hole.
    ctx.fillStyle = mixHex(skin.muzzle, skin.rim, 0.42 + rnd() * 0.22);
    ctx.fill();
    ctx.strokeStyle = rgba(skin.edge, 0.22);
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }
}
