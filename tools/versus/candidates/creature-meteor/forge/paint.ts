import { LIGHT_HALF } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { keyAxis, rgba } from "../../../../../packages/render/src/meteor-look.js";

/**
 * The paint FORGE is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * Everything here is drawn from the numbers it is handed — `r`, `time` and the
 * key axis — and nothing caches a frame. A candidate lives inside two
 * renderers stepping one world; a module-level cache here would be state
 * shared between the two sides of the pair, which is the one thing the pair
 * promises it does not have.
 */

/** Cold armour, hot seams. The amber is the whole of what makes the rock
 * read as *made* rather than as broken off something. */
const STEEL = "#2B3346";
const STEEL_DARK = "#0F1219";
const AMBER = "#FFAA00";
const HOT = "#FFE600";

/** A lava mouth: black bowl, amber rim, and a white-hot centre that is the
 * only pure white on the rock. Used for the rock's own central caldera and
 * for every hole a shot opens, so a cratered rock reads as the same body
 * cracked further rather than as a different material underneath. */
export function caldera(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number): void {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = STEEL_DARK;
  ctx.fill();

  const core = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.72);
  core.addColorStop(0, "#FFFFFF");
  core.addColorStop(0.4, HOT);
  core.addColorStop(0.8, AMBER);
  core.addColorStop(1, rgba(AMBER, 0));
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = core;
  ctx.fill();

  const ring = new Path2D();
  ring.arc(x, y, rad, 0, Math.PI * 2);
  strokeGlow(ctx, ring, AMBER, 0.7, 0.35);
}

/**
 * The armour: a flat cold base, the shipped key light over it, then the seams.
 *
 * `litRound` is called rather than a gradient of this file's own, for the
 * reason `meteor-look.ts` states about the shipped rock — a light glued to a
 * turning stone is a painted stone. The candidate argues about the material,
 * not about where the sun is.
 */
export function armour(ctx: CanvasRenderingContext2D, path: Path2D, r: number, turn: number): void {
  // The metal itself: a value ramp along the key axis, which `keyAxis` hands
  // over rather than this file working out where the light is. That is the
  // whole distinction the candidate is allowed — *which* greys a rock is made
  // of is a material question; where the sun is, is not.
  const { dx, dy } = keyAxis(turn);
  const metal = ctx.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
  metal.addColorStop(0, "#5C6880");
  metal.addColorStop(0.45, STEEL);
  metal.addColorStop(1, "#12151C");
  ctx.fillStyle = metal;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);

  // Plate seams: two chords, dark, so the body reads as panelled metal rather
  // than as one poured lump. Kept to two — at a tile's width a third is noise.
  ctx.strokeStyle = STEEL_DARK;
  ctx.lineWidth = Math.max(0.8, r * 0.07);
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.18);
  ctx.lineTo(r * 0.35, -r * 0.62);
  ctx.moveTo(r * 0.2, r);
  ctx.lineTo(r * 0.75, r * 0.1);
  ctx.stroke();

  // Lava seams: four short runs out of the centre, which is where the
  // caldera sits. They are what the amber is for.
  const veins = new Path2D();
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + 0.4;
    veins.moveTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
    veins.lineTo(Math.cos(a + 0.28) * r * 0.92, Math.sin(a + 0.28) * r * 0.92);
  }
  strokeGlow(ctx, veins, AMBER, Math.max(0.8, r * 0.055), 0.65);
  ctx.restore();

  // The armour ridge: an amber neon edge with a hot filament inside it. This
  // is the line that survives at a tile's width when nothing else does.
  strokeGlow(ctx, path, AMBER, Math.max(1, r * 0.075), 0.95);
  ctx.strokeStyle = "#FFF6D8";
  ctx.lineWidth = 0.6;
  ctx.stroke(path);

  caldera(ctx, 0, 0, r * 0.2);
}

/**
 * The fitted field, and the one thing on the rock that does not turn with it.
 *
 * It breathes on its own slow clock and carries a brighter arc across its
 * leading edge — the bottom, because a rock in this game only ever falls. The
 * arc is the whole reason a field belongs on a meteor rather than on anything
 * else: the rule the player has to learn is that a shot does nothing and the
 * shield is the only answer, and a rock that is visibly already shielded says
 * that before anybody says it out loud.
 */
export function field(ctx: CanvasRenderingContext2D, r: number, time: number): void {
  const pulse = 1 + Math.sin(time * 2.1) * 0.03;
  const rad = r * 1.36 * pulse;

  // Round, where the rock is faceted, and that opposition is the whole of how
  // it reads as a field rather than as a second hull. A shell cut from the
  // same `crystalPath` sat a second amber octagon a few degrees off the
  // first — two outlines arguing about where the rock ends.
  const glow = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, rad);
  glow.addColorStop(0, rgba(AMBER, 0));
  glow.addColorStop(0.72, rgba(AMBER, 0.09));
  glow.addColorStop(1, rgba(HOT, 0.26));
  ctx.beginPath();
  ctx.arc(0, 0, rad, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba("#FFF6D8", 0.42);
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // The shockwave across the leading edge — the bottom, because a rock in
  // this game only ever falls. Stroked by hand rather than through
  // `strokeGlow`, which ends by putting `globalAlpha` back to 1 and laying a
  // solid pass: the flicker is what makes this arc read as re-entry, and it
  // is the one thing that helper will not carry.
  ctx.globalAlpha = 0.5 + Math.sin(time * 3.3) * 0.25;
  ctx.strokeStyle = "#FFF6D8";
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.beginPath();
  ctx.arc(0, 0, rad * 1.06, Math.PI * 0.24, Math.PI * 0.76);
  ctx.stroke();
  ctx.restore();
}
