import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Point } from "./surge-shape.js";

/**
 * **What THE SURGE is made of**: a sac of membrane blown tight — lit from the
 * upper left and gone to the deep beneath, held in by ribs that stand up out
 * of it as cords with a groove beside each, its lower wall lit from inside
 * brighter as the pressure comes on, and a film of gloss high on the left the
 * way a thing stretched thin catches light. It is no longer a violet fill with
 * a line and a glowing line drawn round it, which is the one picture the brief
 * rules out by name (`new-boss-more` §6.3).
 *
 * Split off `surge-draw.ts`, which decides *what* the bulb says — its swell,
 * its pinch, whether it is inside out or sealing, whether it holds its charge
 * — so it stays about the fight and this one about the material. The seam,
 * its notches and pressure mark (`surge-gauge.ts`) and the grips are
 * information and drawn over this as they were. Colours go in plain with the
 * strength in the alpha, so `surge-frame.test.ts` finds the hull and its rim.
 *
 * **Every width is off the tile**, never off the bulb's radii: the bulb
 * swells and folds, and a width that followed it would be new every frame.
 */

/** The bulb as `surge-draw.ts` has placed it this frame. */
export interface Sac {
  c: Point;
  rx: number;
  ry: number;
  tile: number;
}

/** The ribs: meridians by their half-width as a share of the bulb's. */
const RIBS = [0.3, 0.6, 0.85];

/**
 * `hex` the membrane, `rim` the light inside it, `glow` 0..1 how bright the
 * lower wall is lit, and `ribs` how much the ribs stand out — faint while it
 * re-seals and is slack.
 */
export function paintSac(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Sac,
  hex: string,
  rim: string,
  fill: number,
  glow: number,
  ribs: number,
): void {
  const { c, rx, ry, tile } = s;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(body);
  ctx.globalAlpha = fill;
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const shade = ctx.createRadialGradient(
    c.x - rx * 0.35,
    c.y - ry * 0.45,
    0,
    c.x,
    c.y,
    Math.max(rx, ry) * 1.1,
  );
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.25));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55));
  ctx.fillStyle = shade;
  ctx.fill(body);
  // The ribs: a groove on the shadowed side, the cord lit on the other.
  const gap = Math.max(1, tile * 0.035);
  for (const f of RIBS) {
    rib(ctx, c, rx * f + gap, ry, Math.max(1, tile * 0.05), PALETTE.sheenDeep, 0.35 * ribs);
    rib(ctx, c, rx * f, ry, Math.max(0.8, tile * 0.025), rim, 0.3 * ribs);
  }
  // Its lower wall, lit from inside: stroked wide inside the sac over its
  // lower half only, never all round, which was the outline.
  ctx.save();
  ctx.beginPath();
  ctx.rect(c.x - rx * 2, c.y, rx * 4, ry * 2);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.14;
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.25 + 0.45 * glow;
  ctx.stroke(body);
  ctx.restore();
  ctx.restore();
  // The film, high on the left: a soft bloom and a hard point.
  const fx = c.x - rx * 0.45;
  const fy = c.y - ry * 0.5;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.22);
  ctx.beginPath();
  ctx.ellipse(fx, fy, rx * 0.2, Math.min(ry * 0.12, tile * 0.12), -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(fx - rx * 0.08, fy - tile * 0.02, Math.max(0.8, tile * 0.04), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** One meridian across the sac, at half-width `rx`. */
function rib(
  ctx: CanvasRenderingContext2D,
  c: Point,
  rx: number,
  ry: number,
  width: number,
  colour: string,
  a: number,
): void {
  ctx.globalAlpha = a;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, ry * 1.02, 0, 0, Math.PI * 2);
  ctx.stroke();
}
