import {
  crystalPath,
  crystalRadiusMul,
  METEOR,
  type Point,
} from "../../../../../packages/content/src/index.js";
import { type Crater, centreY, cutY, LID } from "../../../../../packages/render/src/crater-geom.js";
import { stream } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { shatter } from "../../../../../packages/render/src/shatter.js";

/**
 * SPALL — the membrane around a hole, buckled inward in plates.
 *
 * The shipped crater is a flat opaque silhouette of the rock that made it, with
 * a hot hairline along the cut. It says *this much of the ship is gone* and it
 * says nothing at all about the skin that is still there: the membrane meets
 * the hole at full brightness, as though the hull had been punched cleanly by
 * something very sharp.
 *
 * What a hole in a skin actually does is take the skin *with* it. So this cuts
 * a ring of plates out of the hole's own outline — the same crystal the crater
 * is, at 1.7 times its radius, so every plate's inner edge is exactly the
 * hole's rim — and pulls each of them a little toward the pit, turned by a
 * degree or two of its own. The material is still there and it is no longer
 * flat: it is caved, and it is darker the closer it gets to what went through
 * it.
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
function ring(c: Crater): Point[] {
  const cos = Math.cos(c.rotation);
  const sin = Math.sin(c.rotation);
  const pts: Point[] = [];
  const n = METEOR.sides * 4;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const m = crystalRadiusMul(a, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed);
    const px = Math.cos(a) * c.r * REACH * m;
    const py = Math.sin(a) * c.r * REACH * m;
    pts.push({ x: px * cos - py * sin, y: px * sin + py * cos });
  }
  return pts;
}

export function spall(ctx: CanvasRenderingContext2D, c: Crater): void {
  const cy = centreY(c);
  ctx.save();
  // Everything above the skin line is outside the ship. Wider than the shipped
  // pit's clip, because the buckle reaches past the hole it is around — and
  // still flat and level, cut in screen space before anything is rotated.
  ctx.beginPath();
  ctx.rect(c.x - c.r * REACH * 1.4, cutY(c), c.r * REACH * 2.8, c.r * REACH * 2 + LID);
  ctx.clip();
  ctx.translate(c.x, cy);

  // The plates. Only the outer ring of the cut is drawn — the inner one is the
  // hole itself, and it is filled opaque below.
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
    // Dark at the pit and back to the hull's own violet at the far edge, which
    // is where the intact membrane resumes. A plate that stayed hull-bright
    // would be a facet of the ship lying at an angle, not skin pulled into a
    // hole.
    ctx.fillStyle = mixHex("#14101F", PALETTE.hull, 0.42 + rnd() * 0.22);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.22);
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  // The hole itself, over the plates, exactly as the shipped crater fills it:
  // a hole has no rim of its own material, only the dark of what is gone.
  ctx.rotate(c.rotation);
  ctx.fillStyle = "#14101F";
  ctx.fill(
    new Path2D(
      crystalPath(0, 0, c.r, c.r, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed),
    ),
  );
  ctx.restore();

  // And the shipped hairline along the cut, kept: the seam where the rock ended
  // and the skin resumes, still a little hot. Nothing about this candidate is
  // an argument with it.
  const rim = ctx.createLinearGradient(c.left, c.top.y, c.right, c.top.y);
  rim.addColorStop(0, "rgba(255,122,47,0)");
  rim.addColorStop(0.5, "rgba(255,122,47,0.4)");
  rim.addColorStop(1, "rgba(255,122,47,0)");
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(c.left, c.top.y);
  ctx.lineTo(c.right, c.top.y);
  ctx.stroke();
}
