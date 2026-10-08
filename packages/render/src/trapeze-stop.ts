import { type TrapezeState, trapezeShooting, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import type { Layout } from "./layout.js";
import { trapezeAlienCircle } from "./trapeze-grip.js";
import type { Point } from "./trapeze-shape.js";

/**
 * **Where a bolt meets THE TRAPEZE**, for `BoltStops` (`bolt-stop.ts`): the
 * alien, while a level asks for shots, at the foot of its circle, laid `off`
 * the way the drawer has moved it. Whether the shot pushes or slows the swing
 * is the simulation's (`sim/trapeze-shot.ts`); every shot that meets the
 * alien is the thing a shot level asks for, so each is a `target`. In a swipe
 * level a bolt goes past the swing — nothing asks for it, and the simulation
 * lets it through (`trapezeAlong`).
 */
export function trapezeStopper(
  l: Layout,
  world: World,
  s: TrapezeState,
  off: Point,
): Stopper | null {
  if (!trapezeShooting(s)) return null;
  const c = trapezeAlienCircle(l, world.cfg, s);
  return (_col, x) => {
    const dx = x - (c.x + off.x);
    if (Math.abs(dx) > c.r) return null;
    return { y: c.y + off.y + Math.sqrt(c.r * c.r - dx * dx), hit: "target" };
  };
}
