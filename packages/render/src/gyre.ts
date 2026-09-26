import { type Creature, GYRE_RADIUS, gyreSucked, type World } from "@neon-spore/sim";
import { drawWheel } from "./gyre-wheel.js";
import type { Layout } from "./layout.js";

/**
 * THE GYRE's armature: a membrane, a rim through the six bodies, the spokes
 * that hold it out and the organelle in the middle (`gyre-core.ts`).
 *
 * **Only the wheel is drawn here.** The six on the rim are `mount`s, which
 * `wornKind` resolves to an ordinary slick or bulb, so `drawCreatures` draws
 * them exactly as it draws a body in a lane — same contour, same colour, same
 * own-motion, same size. That is the creature rather than a saving: what the
 * pair has to read off a wheel is *the colour standing in a column*, which is
 * the sentence they already know, and a mount that looked like anything else
 * would be a new word to learn instead of an old one that expires.
 *
 * **The rim runs through the bodies, and it cannot be a circle.** The six stand
 * on tiles, and a tile ring is not round: two of them are two tiles from the hub
 * and the other four are `sqrt(5)`, a quarter of a tile further out (`GYRE_RING`
 * in gyre-rim.ts). No circle holds all six the same way — one through the near
 * pair cuts the far four in half, one through the far four leaves the near pair
 * floating inside it. So it is a curve through their own centres, which says the
 * true thing once: every body sits in the middle of the border, and the border is
 * what carries it. **A curve rather than the six straight lines it used to be** —
 * a hexagon is a machined part, and nothing else on this field has a corner in
 * it. It is built from where the bodies are actually *drawn*, so it glides with
 * them between beats and the joint can never come apart — and a shot-away body
 * leaves its corner behind, because losing one costs the wheel an arm and not
 * its shape.
 *
 * **Violet rather than metal.** The armature used to be `rock` grey, the safe
 * answer to a real constraint: red and cyan are *words* on this field, and a
 * wheel painted in either would be saying one of them six times over. The palette
 * already keeps a neon that means no colour — `wisp`, chosen for a body that
 * either shot kills — and that is what a wheel is: the thing between the two
 * colours rather than one of them. Under a pull it is lit the shield's cyan,
 * which is the colour the ship's own suck is drawn in, the arrangement
 * `claspResonance` already has for the ward.
 *
 * It is drawn in a pass of its own, **before** the bodies rather than inside
 * their loop, because a wheel is one object spanning five rows: `byDepth` sorts
 * body by body, so a hub taking its turn in that order would have its spokes over
 * the mounts above it and under the ones below.
 */

/** Every wheel on the field — asked once a frame, by `frame-field.ts`, and
 * handed to the armature and the wind rather than asked by each. */
export function gyres(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "gyre");
}

/** How far the outermost body reaches from the hub, in pixels — the whole
 * footprint of a wheel, and what the wind leaves from. */
export function gyreRadiusPx(l: Layout): number {
  return l.tile * GYRE_RADIUS;
}

/**
 * The armature of every wheel on the field. `pull` is 0..1, how hard the ship is
 * dragging — the same number `drawGyreWind` brightens with, so the two ends of
 * the pull can never light on different frames.
 */
export function drawGyres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  live: readonly Creature[],
  beatPhase: number,
  time: number,
): void {
  if (live.length === 0) return;
  const pull = gyreSucked(world) ? 1 : 0;
  const carried = gyreCarried(world, live);
  for (const c of live) drawWheel(ctx, l, world, c, carried.get(c.id) ?? [], beatPhase, time, pull);
}

/**
 * The bodies each wheel is actually carrying, so the rim is built from the
 * things it holds rather than from an angle they ought to be at — sorted into
 * their wheels in one pass over the field, in the field's own order, rather
 * than the whole field read again for every wheel.
 */
export function gyreCarried(world: World, live: readonly Creature[]): Map<number, Creature[]> {
  const carried = new Map<number, Creature[]>(live.map((c) => [c.id, []]));
  for (const m of world.creatures) if (m.gyreId !== undefined) carried.get(m.gyreId)?.push(m);
  return carried;
}
