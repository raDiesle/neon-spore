import { metColor, missedColor } from "./balance.js";
import { type GorgeIntake, type GorgeState, gorgeFull, gorgePried } from "./gorge.js";
import { nextInt } from "./rng.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **A bead in, a bead out, and THE GORGE's mouth**: what a shot does to an
 * intake that takes it as a bead, and to the one intake that is the mouth.
 * `gorge-step.ts` dispatches a shot here or pierces a full intake itself.
 */

/** One bead in, of `color`, and the intake full if that was the last. */
export function swallow(
  world: World,
  g: GorgeState,
  i: number,
  k: GorgeIntake,
  color: Color,
): void {
  const col = g.col + i;
  k.color = color;
  if (k.beads < world.cfg.gorgeFullBeads) {
    k.beads += 1;
    g.swallowed += 1;
  }
  world.events.push({ type: "gorgeSwallow", col, color, beads: k.beads });
  if (k.beads === world.cfg.gorgeFullBeads && k.fullBeat < 0) {
    k.fullBeat = world.beat;
    k.pierced = 0;
    world.events.push({ type: "gorgeFull", col, color });
  }
}

/** One bead out — the wrong colour went in — and the colour forgotten at none. */
export function empty(world: World, g: GorgeState, i: number, k: GorgeIntake): void {
  k.beads = Math.max(0, k.beads - 1);
  k.fullBeat = -1;
  k.pierced = 0;
  if (k.beads === 0) k.color = null;
  world.events.push({ type: "gorgeEmptied", col: g.col + i, beads: k.beads });
}

/**
 * The unruptured intake nearest the centre becomes the mouth, in the colour
 * it holds — or one off the rng when it is empty: the sack's own choice.
 */
export function openMouth(world: World, g: GorgeState): void {
  const centre = (g.intakes.length - 1) / 2;
  let best = -1;
  for (let i = 0; i < g.intakes.length; i++) {
    if (g.intakes[i]?.ruptured) continue;
    if (best < 0 || Math.abs(i - centre) < Math.abs(best - centre)) best = i;
  }
  if (best < 0) return;
  const k = g.intakes[best];
  if (k === undefined) return;
  if (k.color === null) k.color = nextInt(world.rng, 2) === 0 ? "red" : "cyan";
  g.mouth = best;
  g.spitBeat = world.beat;
  world.events.push({ type: "gorgeMouth", col: g.col + best, color: k.color });
}

/**
 * A shot into the mouth, intake `i`. The wrong colour takes a bead back out.
 * A beam in its colour while it is full clenches on a mouth nobody holds, and
 * on a pried one is a `gorgePryFill` — or, the `gorgePryFills`th, the end of
 * the fight. Anything else is a bead.
 */
export function mouthStruck(world: World, g: GorgeState, i: number, bullet: Bullet): void {
  const k = g.intakes[i];
  if (k === undefined) return;
  const cfg = world.cfg;
  const col = g.col + i;
  if (k.color !== null && k.color !== bullet.color) {
    missedColor(world);
    empty(world, g, i, k);
    return;
  }
  if (bullet.lance && gorgeFull(k, cfg)) {
    if (!gorgePried(g)) {
      world.events.push({ type: "gorgeClench", col });
      return;
    }
    metColor(world);
    g.pryFills += 1;
    if (g.pryFills < cfg.gorgePryFills) {
      const owed = cfg.gorgePryFills - g.pryFills;
      world.events.push({ type: "gorgePryFill", col, color: bullet.color, owed });
      return;
    }
    g.outBeat = world.beat;
    world.events.push({ type: "gorgeOut", col, beads: g.swallowed });
    return;
  }
  metColor(world);
  swallow(world, g, i, k, bullet.color);
}
