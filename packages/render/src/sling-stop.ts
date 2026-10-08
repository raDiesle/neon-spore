import { slingVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { coreStopper, lowestFoot, outlineFoot, rodFoot, roundFoot } from "./core-stop.js";
import type { Layout } from "./layout.js";
import { STROKE } from "./palette.js";
import {
  type Point,
  slingCupRadius,
  slingHandle,
  slingTinePoints,
  slingTip,
} from "./sling-shape.js";
import { slingRung } from "./sling-twang.js";

/**
 * **Where a bolt meets THE SLING**, for `BoltStops` (`bolt-stop.ts`): the
 * cup in its crotch, rung on a fire step with the yoke lit, at its near
 * rim, and otherwise the lowest of the cup, the two tines stood `out` and
 * the cords drawn to `tension` — all about `home`, and each tine and its
 * cord carried round by the ring after a loose (`sling-twang.ts`).
 */
export function slingStopper(
  l: Layout,
  world: World,
  home: Point,
  out: number,
  tension: readonly [number, number],
  ring: number,
): Stopper {
  const r = slingCupRadius(l);
  const feet = [roundFoot(home.x, home.y - r * 0.2, r, r * 0.8)];
  for (const side of [0, 1] as const) {
    const rung = (p: Point): Point => slingRung(p, side, ring);
    const at = (p: Point): Point => {
      const q = rung(p);
      return { x: home.x + q.x, y: home.y + q.y };
    };
    feet.push(outlineFoot(slingTinePoints(l, side, out).map(rung), home.x, home.y));
    const cord = [at(slingTip(l, side, 1)), at(slingHandle(l, side, tension[side]))] as const;
    feet.push(rodFoot(cord[0], cord[1], STROKE.inner / 2));
  }
  return coreStopper(world, slingVerdict, home.y + r * 0.6, lowestFoot(feet));
}
