import { blobPath, facet, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE BALL OF FIRE A TORCH FALLS INSIDE — everything outside the stone.
 *
 * Its own file beside `torch-fire.ts` for the reason the size limit exists, and
 * the seam is a real one: next door is fire *on* the rock, placed at longitudes
 * on the stone's own skin and hidden by it for half of every turn, and this is
 * fire *around* it, which the stone never occludes because all of it is laid
 * down first. The two are drawn in one pass and argue about different things.
 *
 * Nothing here is a fill over the stone and nothing here shades it: every mark
 * is additive, so a torch stays unmistakably the rock family however hot it
 * gets (`drawStone`, torch.ts).
 */

/** How far the fire reaches, as a share of the stone's radius. Past two, which
 * is what makes it a fireball rather than a rock with a rim: a two-tile torch
 * burns across most of the 2x2 square it falls down. */
const BALL = 2.15;

/** The two shells the ball's edge is made of, as shares of the radius. They
 * turn against each other, which is what keeps the outline boiling instead of
 * wobbling as one lump. */
const SHELL_OUT = 1.72;
const SHELL_IN = 1.24;

/** How many plumes ride round on the burning mass, how far out they sit and how
 * wide each one is. Nine: enough that four or five are on the near side at any
 * turn, few enough that at the width a torch draws at they are lobes of a fire
 * rather than a texture. */
const PLUMES = 9;
const PLUME_REACH = 1.32;
const PLUME_SIZE = 0.86;

/** What is left of a mark's brightness at the limb. High, because fire is its
 * own light: the cosine here is *distance* rather than shading, and a plume
 * that faded to nothing at the edge would read as a rock going out. */
export const EMBER_FLOOR = 0.45;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Where each plume sits, on a mass of its own well outside the stone. The
 * longitudes are spread by the golden angle so no two ever line up, and
 * `LAT_LIMIT` is `surface.ts`'s number and is *called*, because a mark nearer a
 * pole than that is a horizontal hairline whatever the rotation does. */
const PLUME_PINS = Array.from({ length: PLUMES }, (_, i) =>
  pin(i * GOLDEN + 0.7, Math.sin(i * 2.3) * LAT_LIMIT * 0.75, PLUME_REACH),
);

/** How hard mark `i` is burning this instant, 0.55..1. Deterministic and off
 * the frame clock alone, so two phones draw one fire — the same argument
 * `own-motion.ts` makes for sampling a pose on a shared clock. Shared with the
 * tongues next door, which flicker on the same numbers. */
export function flicker(i: number, time: number): number {
  return 0.775 + 0.225 * Math.sin(time * (5.3 + i * 0.37) + i * 2.1);
}

/**
 * One shell of the ball's edge: a lobed contour filled with a radial ramp that
 * is nothing at the middle and brightest near the rim.
 *
 * Hollow on purpose. Two solid discs stacked additively over a rock would take
 * the middle of the picture to white and the stone with it; what the eye needs
 * out here is an *edge* that ripples, and the heat inside it is the halo's job.
 */
function shell(
  ctx: CanvasRenderingContext2D,
  r: number,
  reach: number,
  lobes: number,
  t: number,
  seed: number,
  heat: number,
): void {
  const rad = r * reach;
  const g = ctx.createRadialGradient(0, 0, rad * 0.25, 0, 0, rad);
  g.addColorStop(0, rgba(PALETTE.ember, 0));
  g.addColorStop(0.62, rgba(PALETTE.ember, 0.22 * heat));
  g.addColorStop(0.86, rgba(PALETTE.emberRim, 0.3 * heat));
  g.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = g;
  ctx.fill(new Path2D(blobPath(0, 0, rad, rad, lobes, 0.2, 0.12, t, seed, 30)));
}

/**
 * The plumes, placed on a turning mass and blitted as one cached sprite each.
 *
 * `halo` rather than a gradient per plume, and that is what keeps a fire this
 * size free: the sprite is keyed on a colour and a rounded radius, both of
 * which are constant here, so nine plumes on any number of torches are one
 * canvas. The foreshortening is `ctx.scale` around the blit, so a plume going
 * round the limb still narrows the way everything else on a surface does.
 */
export function plumes(
  ctx: CanvasRenderingContext2D,
  r: number,
  theta: number,
  time: number,
): void {
  for (let i = 0; i < PLUME_PINS.length; i++) {
    const p = PLUME_PINS[i];
    if (!p) continue;
    const f = facet(p, theta);
    const heat = flicker(i, time) * surfaceDim(EMBER_FLOOR, Math.abs(f.sx));
    ctx.save();
    ctx.translate(f.x * r, f.y * r);
    ctx.scale(Math.max(0.2, Math.abs(f.sx)), f.sy);
    halo(ctx, 0, 0, r * PLUME_SIZE, PALETTE.ember, (f.near ? 0.34 : 0.24) * heat);
    ctx.restore();
  }
}

/**
 * The whole ball: the heat under everything, the two shells turning against
 * each other, and the plumes riding round on the mass.
 *
 * All of it additive, and all of it drawn before the stone — which is what
 * makes the rock an opaque core inside a fire rather than a shape with fire
 * painted on it.
 */
export function ball(ctx: CanvasRenderingContext2D, r: number, theta: number, time: number): void {
  const breath = 0.86 + 0.14 * Math.sin(time * 2.7);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The heat, widest and under everything. A fixed radius so it stays one
  // cached sprite; what breathes is the alpha.
  halo(ctx, 0, 0, r * BALL, PALETTE.ember, 0.26 * breath);
  halo(ctx, 0, 0, r * SHELL_IN, PALETTE.emberRim, 0.14 * breath);
  shell(ctx, r, SHELL_OUT, 7, time * 0.55, 11, breath);
  shell(ctx, r, SHELL_IN, 5, -time * 0.8, 23, breath);
  plumes(ctx, r, theta, time);
  ctx.restore();
}
