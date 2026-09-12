import { facet, LAT_LIMIT, LIGHT_HALF, pin, surfaceDim } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { farRegion, seamAt } from "./throb.js";
import type { ThrobHalf } from "./throb-look.js";

/**
 * PORES — the far half wears marks that are *on* it: seven pores pinned at a
 * longitude and latitude of the far hemisphere, each crossing at its own
 * rate, instead of the body's interior squashed as one picture.
 *
 * The shipped half narrows its interior marks with the surface by scaling the
 * whole drawing, which moves every mark at one rate — the sticker shrinking
 * `docs/dimensional.md` measures at 1.10 : 1. A pore placed by `pin` and
 * carried by `facet` crosses the middle fast and crawls at the limb, 22.9 : 1,
 * and narrows to nothing there rather than being cut by the seam. That is the
 * one cue that says the far colour is round a ball rather than under a
 * window, and it is the whole of this candidate: the fill, the rim, the seam
 * and the light are the shipped ones.
 */

/** How many pores the far hemisphere carries, and how far out of the middle
 * they reach. Seven: enough that two or three are on the near side at any
 * turn, few enough that at thirty pixels they are marks and not a texture. */
const PORES = 7;
const REACH = 0.74;
/** What a pore keeps of its light where the surface has turned away. */
const FLOOR = 0.35;
/** How wide a pore is, as a share of the body. */
const SIZE = 0.15;

/**
 * The far colour's own hemisphere is longitudes π/2 to 3π/2 (`throb.ts`'s
 * `seamAt`), so the pins are spread through that half turn — by the golden
 * angle, so no two share a meridian — and kept off the poles.
 */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS = Array.from({ length: PORES }, (_, i) =>
  pin(
    Math.PI / 2 + 0.15 + ((i * GOLDEN) % (Math.PI - 0.3)),
    Math.sin(i * 1.9) * LAT_LIMIT * 0.75,
    REACH,
  ),
);

export function pores(h: ThrobHalf): void {
  const { ctx, body, rx, ry, tint, seamHue, lw, turn, rot } = h;
  const { half, side } = seamAt(turn, rx);
  const far = farRegion(half, side, rx, ry);

  ctx.save();
  ctx.rotate(-turn);
  ctx.clip(far);
  ctx.rotate(turn);
  ctx.fillStyle = tint.dark;
  ctx.fill(body);
  strokeGlow(ctx, body, tint.hex, lw, 1);
  ctx.restore();

  // The pores, placed on the ball and carried round by the turn — in the
  // un-turned frame, because a pore is a mark on the surface and the turn is
  // what the surface has done. Each is drawn about its own origin and
  // foreshortened by the tangent plane's own map.
  ctx.save();
  ctx.clip(body);
  ctx.rotate(-turn);
  for (const p of PINS) {
    const f = facet(p, turn);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * rx, f.y * ry);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * SIZE, ry * SIZE, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(tint.rim, 0.55 * surfaceDim(FLOOR, f.lit));
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * SIZE * 0.45, ry * SIZE * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(tint.dark, 0.9);
    ctx.fill();
    ctx.restore();
  }
  // The cut, as it ships: the boundary meridian in the two colours mixed.
  const meridian = new Path2D();
  meridian.ellipse(0, 0, Math.max(0.5, Math.abs(half)), ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  ctx.strokeStyle = seamHue;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(meridian);
  ctx.restore();

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature, rot);
  ctx.restore();
}
