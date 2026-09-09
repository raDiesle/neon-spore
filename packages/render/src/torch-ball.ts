import { blobPath, facet, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { haloSprite } from "./glow.js";
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
 *
 * **Nothing here is built per frame either, and that was measured.** The first
 * cut of this fire built two `blobPath` contours and two radial gradients on
 * every torch on every frame; BULB QUEEN draws a torch in each of the queen's
 * sockets, and `bun run perf` put that wave up 62% on its own. The contours are
 * baked per radius and per thirty-second of a turn now and the gradients are
 * held per radius, so the ball costs blits and fills and builds nothing
 * (`baked.ts`, and `glow.ts`'s bargain for halos).
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

/** How many shapes one shell's wobble is cut into, over a whole cycle of it.
 * Thirty-two is about ten a second at the rate the outer shell turns, which is
 * the rate hand-drawn fire is animated at and well past the rate an eye reads a
 * boil as stepping. */
const STEPS = 32;

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

const shells = bakedCache<string, Path2D>();

/**
 * One shell's contour, baked per radius and per step of its own wobble.
 *
 * `blobPath` builds a string and a `Path2D` parses it back, which is the single
 * dearest thing this fire ever did — twice a frame, on every torch. A shape is
 * held instead of a picture, because a `Path2D` is a few hundred bytes where a
 * canvas of this size is a quarter of a megabyte, and thirty-two of them per
 * radius is a cache nothing notices.
 */
function shellPath(rad: number, lobes: number, seed: number, step: number): Path2D {
  const key = `${rad}:${lobes}:${seed}:${step}`;
  const held = shells.get(key);
  if (held) return held;
  if (shells.size > STEPS * 6) shells.clear();
  const t = (step / STEPS) * Math.PI * 2;
  const made = new Path2D(blobPath(0, 0, rad, rad, lobes, 0.2, 0.12, t, seed, 24));
  shells.set(key, made);
  return made;
}

interface Ramp {
  ctx: CanvasRenderingContext2D;
  rad: number;
  gradient: CanvasGradient;
}
const ramps = bakedCache<number, Ramp>();

/**
 * The ramp a shell is filled with, at full heat: nothing at the middle and
 * brightest near the rim.
 *
 * Hollow on purpose. Two solid discs stacked additively over a rock would take
 * the middle of the picture to white and the stone with it; what the eye needs
 * out here is an *edge* that ripples, and the heat inside it is the halo's job.
 *
 * Every stop is the same alpha times the same heat, so it is built once at
 * heat 1 and the heat is `globalAlpha` at the fill — which is what makes it
 * cacheable at all.
 */
function shellRamp(ctx: CanvasRenderingContext2D, which: 0 | 1, rad: number): CanvasGradient {
  const held = ramps.get(which);
  if (held && held.ctx === ctx && held.rad === rad) return held.gradient;
  const g = ctx.createRadialGradient(0, 0, rad * 0.25, 0, 0, rad);
  g.addColorStop(0, rgba(PALETTE.ember, 0));
  g.addColorStop(0.5, rgba(PALETTE.ember, 0.24));
  // The pale end is a *sliver*, and deliberately so: `emberRim` is nearly
  // white, and a wide band of it over a dark field takes the whole ball to
  // peach — a fire that has gone out and is still warm. The orange is the fire.
  g.addColorStop(0.82, rgba(PALETTE.emberRim, 0.16));
  g.addColorStop(0.92, rgba(PALETTE.ember, 0.3));
  g.addColorStop(1, rgba(PALETTE.ember, 0));
  ramps.set(which, { ctx, rad, gradient: g });
  return g;
}

function shell(
  ctx: CanvasRenderingContext2D,
  which: 0 | 1,
  r: number,
  reach: number,
  lobes: number,
  seed: number,
  turns: number,
  heat: number,
): void {
  const rad = Math.max(2, Math.round(r * reach));
  const step = ((Math.round(turns * STEPS) % STEPS) + STEPS) % STEPS;
  ctx.globalAlpha = heat;
  ctx.fillStyle = shellRamp(ctx, which, rad);
  ctx.fill(shellPath(rad, lobes, seed, step));
  ctx.globalAlpha = 1;
}

/**
 * The plumes, placed on a turning mass and blitted as one cached sprite each.
 *
 * A cached sprite rather than a gradient per plume, and that is what keeps a
 * fire this size free: `haloSprite` is keyed on a colour and a rounded radius,
 * both of which are constant here, so nine plumes on any number of torches are
 * one canvas.
 *
 * **The foreshortening is in the destination rectangle, not in a transform.**
 * It used to be `save`, `translate`, `scale`, `halo`, `restore` per plume —
 * ten canvas calls for one blit, nine times per torch, six torches in BULB
 * QUEEN's sockets. A `translate` and a `scale` about a blit's own centre are
 * exactly a destination rectangle of `w·sx` by `h·sy` centred on the same
 * point, so the rectangle is computed instead and the mark lands on the same
 * device pixels. A plume going round the limb still narrows the way everything
 * else on a surface does; it is the same arithmetic, done here rather than by
 * the context.
 *
 * `halo` is not called for the same reason: it reads and writes
 * `globalCompositeOperation` around every blit so that any caller may use it,
 * and every caller in this fire is already inside `lighter`. Six calls become
 * two.
 *
 * `nearOnly` is the veil's own pass over the stone's face, where the far half
 * would be drawing the back of the fire on top of the rock.
 *
 * **The caller's `globalAlpha` is overwritten, not multiplied**, exactly as it
 * was when this went through `halo`. `strength` is the way to ask for less:
 * the veil pass over the stone's face wanted a fifth of a plume and set
 * `globalAlpha` to get it, which this silently threw away for the creature's
 * whole life (`torch-veil.ts`). It defaults to one, so the ball's own pass is
 * unchanged.
 */
export function plumes(
  ctx: CanvasRenderingContext2D,
  r: number,
  theta: number,
  time: number,
  nearOnly = false,
  strength = 1,
): void {
  const sprite = haloSprite(PALETTE.ember, Math.max(2, Math.round(r * PLUME_SIZE)));
  const size = sprite.width;
  for (let i = 0; i < PLUME_PINS.length; i++) {
    const p = PLUME_PINS[i];
    if (!p) continue;
    const f = facet(p, theta);
    if (nearOnly && !f.near) continue;
    const heat = flicker(i, time) * surfaceDim(EMBER_FLOOR, Math.abs(f.sx));
    const w = size * Math.max(0.2, Math.abs(f.sx));
    const h = size * f.sy;
    ctx.globalAlpha = (f.near ? 0.34 : 0.24) * heat * strength;
    ctx.drawImage(sprite, f.x * r - w / 2, f.y * r - h / 2, w, h);
  }
  ctx.globalAlpha = 1;
}

/** One of the ball's two unforeshortened glows, blitted at its natural size.
 * The caller holds `lighter`; this only sets the alpha and puts the sprite
 * down. */
function heat(ctx: CanvasRenderingContext2D, radius: number, color: string, alpha: number): void {
  const sprite = haloSprite(color, Math.max(2, Math.round(radius)));
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.globalAlpha = 1;
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
  // cached sprite; what breathes is the alpha. Blitted rather than handed to
  // `halo`, for `plumes`'s reason one function up: the composite mode is
  // already `lighter` and setting it twice more per blit is four calls a torch
  // that change nothing.
  heat(ctx, r * BALL, PALETTE.ember, 0.26 * breath);
  heat(ctx, r * SHELL_IN, PALETTE.emberRim, 0.14 * breath);
  shell(ctx, 0, r, SHELL_OUT, 7, 11, time * 0.088, breath);
  shell(ctx, 1, r, SHELL_IN, 5, 23, -time * 0.127, breath);
  plumes(ctx, r, theta, time);
  ctx.restore();
}
