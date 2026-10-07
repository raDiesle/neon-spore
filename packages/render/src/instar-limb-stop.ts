import type { SeenRing } from "@neon-spore/content";
import { type Foot, outlineFoot, roundFoot } from "./core-stop.js";
import { frontLimbs, frontWings } from "./instar-front.js";
import { type Leg, legRings, profileLegs } from "./instar-legs.js";
import { nestPool, nestsAt } from "./instar-nest-place.js";
import type { Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import { heading, profileWings, type WingSeat } from "./instar-profile.js";
import { swimLook } from "./instar-serpent.js";
import { tailShape } from "./instar-tail.js";
import { bladePoints } from "./instar-tail-blade.js";
import { wingPoints } from "./instar-wing-rig.js";
import type { Layout } from "./layout.js";

/**
 * **Where a bolt meets THE INSTAR's wings, legs, tail and nests** (`instar-stop.ts`):
 * face-on the two wings off the shoulders, side-on the two wings off the back
 * and the slime under each nest that holds an egg, and in both views the four
 * legs under the belly (`profileLegs`, `frontLimbs`), the tail's tube and the
 * two fins of its fork — every one laid where its drawing lays it, from the
 * shapes the drawings hand out (`frontWings`, `profileWings`, `wingPoints`,
 * `tailShape`, `bladePoints`, `nestsAt`, `nestPool`), and then through `lay`,
 * the flight and the shake the stopper lays the tube through — `scale` its
 * stretch, for what is met as a round.
 *
 * A wing is met on its membrane's outline, not its arm or fingers, which run
 * inside it; the tail's spikes and the eggs stand above what is met.
 */
export function frontLimbFeet(
  l: Layout,
  look: Look,
  neck: Point,
  seen: readonly SeenRing[],
  lay: (p: Point) => Point,
  scale: Point,
): Foot[] {
  const limbs = frontLimbs(look, neck, seen);
  return [
    ...frontWings(look).map((seat) => wingFoot(look, seat, lay)),
    ...tailAndLegFeet(l, limbs.tailLook, limbs.rear, limbs.heading, limbs.legs, lay, scale),
  ];
}

/** The profile's wings, tail and nests, from the lines `profileLines` hands out. */
export function profileLimbFeet(
  l: Layout,
  still: Look,
  lines: {
    spine: readonly Point[];
    top: readonly Point[];
    bottom: readonly Point[];
    rear: Point;
  },
  lay: (p: Point) => Point,
  scale: Point,
): Foot[] {
  // The wings, the tail and the nests ride the wave the spine swims on, as `drawProfile` draws them.
  const look = swimLook(l, still);
  const { r } = look;
  const feet = profileWings(lines.top, lines.rear, r).map((seat) => wingFoot(look, seat, lay));
  const legs = profileLegs(lines.spine, lines.bottom, r, look.time);
  const { rear } = lines;
  feet.push(...tailAndLegFeet(l, look, rear, heading(lines.spine), legs, lay, scale));
  for (const nest of nestsAt(l, look)) {
    if (nest.n <= 0) continue;
    const pool = nestPool(nest.at, r);
    const at = lay(pool);
    feet.push(roundFoot(at.x, at.y, pool.rx * scale.x, pool.ry * scale.y));
  }
  return feet;
}

/** The tail out of `rear` going `along`, its two fins, and the legs — in either view. */
function tailAndLegFeet(
  l: Layout,
  look: Look,
  rear: Point,
  along: Point,
  legs: readonly Leg[],
  lay: (p: Point) => Point,
  scale: Point,
): Foot[] {
  const feet: Foot[] = [];
  const round = (c: Point, r: number) => {
    const at = lay(c);
    feet.push(roundFoot(at.x, at.y, r * scale.x, r * scale.y));
  };
  const tail = tailShape(l, look, rear, along);
  for (const ring of tail.seen) round({ x: rear.x + ring.c.x, y: rear.y + ring.c.y }, ring.r);
  for (const b of tail.blades)
    feet.push(outlineFoot(bladePoints(tail.fork, b.tip, b.s, look.r, look.time).map(lay)));
  for (const leg of legs) for (const ring of legRings(leg)) round(ring.c, ring.r);
  return feet;
}

function wingFoot(look: Look, seat: WingSeat, lay: (p: Point) => Point): Foot {
  return outlineFoot(wingPoints(look, seat.at, seat.w, seat.hinge, seat.side).map(lay));
}
