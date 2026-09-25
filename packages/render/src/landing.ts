import { type Creature, isWardable, type SimConfig, spanOf } from "@neon-spore/sim";
import { flatRadius } from "./creature-place.js";
import { drawnRow } from "./depth.js";
import { smoothstep } from "./ease.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCY } from "./layout.js";
import { rockFallY } from "./rock-fall.js";
import { rockRadius } from "./rock-size.js";

/**
 * **Where a body's last glide ends: half-sunk in the ship's skin, not on the
 * centre of the ship's row.**
 *
 * The hull row's centre is under the membrane — a tile is taller than the
 * plating is thick — so a body glided there the way every other row is glided
 * to (`creatureCenter`) goes in under the skin and is painted over by the hull
 * for the last part of its landing beat.
 *
 * **It was written for rocks and it is the same defect for everything else.**
 * The owner's first report, 11 September 2026: a meteor vanished into the ship
 * and popped back up, because the sim removed it and `RockImpactFx` drew it
 * stuck *on* the skin. His second, 22 September 2026: *the first animation of
 * red colour on the hull and the electric wave is happening not in the exact
 * moment the enemy damages the ship.* That one is this rule missing rather than
 * a clock being wrong — the strike fires on the `breach` tick and always has
 * (`breach-strike.ts`), but a slick spent the whole landing beat sliding a full
 * tile down through the plating, so the pair read the hit five eighths of a
 * second before the ship answered it. A body that comes to rest **on** the skin
 * at the end of that beat is a body whose contact and whose flash are the same
 * moment.
 *
 * **Half-sunk and not resting tangent on it** — for everything living. A rock
 * is the exception and ends its beat tangent, touching: the half-sink is the
 * hit itself, drawn by the replay after the hull breaks (`rock-fall.ts`). For a
 * living body the number is its own: a body one row above the hull is already
 * drawn touching the skin, so a glide that ended tangent would not move at
 * all, and a landing nothing moves on is a landing the pair cannot see happen. Sunk by half, the last beat is a
 * short press into the plating that finishes on the beat the hull breaks.
 *
 * Every other row is left alone: the clamp only ever *raises* the end of a
 * glide, and a row's centre above the skin is above the rest as well. A wide
 * rock rests by its own radius, the same one the crater is dug to.
 *
 * **And the beat is a gather and a strike, not a slide.** The owner's third
 * report, 22 September 2026: *when the enemy touches the hull it immediately
 * must damage the ship — right now it touches the ship for some moments then
 * switches to it.* Resting the body on the skin fixed where the beat *ends*
 * and left what it looks like all the way through it: the row above the hull
 * is one body-radius above the plating, so a body arriving there is already
 * drawn lying on the ship, and the even glide moved it half a finger's width
 * over five eighths of a second. The pair watched a body sitting on the hull
 * for a beat and then the hull broke. A fall needs height to fall from, so the
 * body is lifted clear of the plating over the first `GATHER` of the beat and
 * comes down through the rest of it on a cube, which puts the whole of the
 * approach in the last few ticks: the frame it is seen to touch is the frame
 * the ship answers. It reads as the thing rearing back to hit the hull, which
 * is what it is doing.
 *
 * **A rock does not gather**: a meteor hopping before it landed would be a
 * meteor with muscles. It kept an even glide into the half-sunk rest until
 * 25 September 2026, and the owner's fourth report is what that looked like —
 * the rock on the plating a beat before the hull broke. Its last rows are bent
 * instead (`rock-fall.ts`), so that it *touches* the skin at the end of this
 * beat, and the press into the hole is the replay's, after the hit
 * (`rock-impact.ts`). `isWardable` is the same split `restRadius` below
 * already makes, for the same reason — what is falling and what is alive.
 */
export function landingY(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  glide: number,
  /** The plating without the cannon (`skinSampler`): the crater is dug in
   * the skin under whatever lobe stands over the column, and the rock lands
   * where its hole is — the same query `RockImpactFx` rests it by. */
  skinY: SurfaceY | undefined,
): number {
  if (!skinY) return y;
  const r = restRadius(l, cfg, c);
  const skin = skinY(x);
  if (isWardable(c.kind)) return rockFallY(l, drawnRow(c, glide), y, skin - r);
  const yEnd = Math.min(tileCY(l, c.row), skin - r * SUNK);
  if (yEnd === tileCY(l, c.row)) return y;
  const yStart = Math.min(tileCY(l, c.fromRow), yEnd);
  return strike(yStart, yEnd, skin - r * CLEAR, glide);
}

/** How deep in the plating a landing beat comes to rest, in body radii. */
const SUNK = 0.5;

/**
 * How far clear of the plating the gather lifts a living body, in radii — so
 * the gap under it at the top of the gather is `CLEAR - 1` of one.
 *
 * Nearly a radius, which on a phone is about a finger's width of open sky
 * under the body. Less than that and it still reads as resting on the ship;
 * much more and the beat stops being a last step down the grid and becomes a
 * jump, which is a thing the field does not have.
 */
const CLEAR = 1.8;

/** The share of the landing beat spent gathering, before the fall. */
const GATHER = 0.38;

/**
 * A living body's last beat: up clear of the plating, then down onto it.
 *
 * `smoothstep` up so the lift settles rather than stopping, and a **cube**
 * down so the fall is slow at the top and fast at the bottom — the body is
 * still a body's width clear at four fifths of the way through the beat and
 * covers the rest in the handful of ticks before the hull answers. A linear
 * fall would put it on the skin halfway through and hand back the beat this
 * exists to take away.
 *
 * `clear` below `start` is a body already further from the plating than the
 * gather would lift it — a tall lobe under the column, or a kind drawn small.
 * There is nothing to gather from there and the even glide is the honest
 * picture, so it takes it.
 */
function strike(start: number, end: number, clear: number, g: number): number {
  if (clear >= start) return start + (end - start) * g;
  if (g < GATHER) return start + (clear - start) * smoothstep(g / GATHER);
  const t = (g - GATHER) / (1 - GATHER);
  return clear + (end - clear) * t * t * t;
}

/**
 * The radius the rest is measured by: the body's own, at the size it is drawn
 * standing there.
 *
 * A rock asks `rockRadius` flat, which is what it asked before this rule
 * covered anything else and what `RockImpactFx` still rests it by — the two
 * have to be the same number to the pixel or the hand-over from the field pass
 * to the replay is a jump. Everything else asks `flatRadius` at the end of the
 * glide, which is the perspective-grown size the body actually draws at on the
 * nearest row (`depth.ts`); a slick rested by its flat radius would sit a
 * sixteenth of a body too high on the one row where the growth is largest.
 */
function restRadius(l: Layout, cfg: SimConfig, c: Creature): number {
  return isWardable(c.kind) ? rockRadius(l, spanOf(c)) : flatRadius(l, cfg, c, 1);
}
