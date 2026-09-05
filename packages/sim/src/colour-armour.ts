import { msToTicks, type SimConfig } from "./config.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * What a shot of the wrong colour leaves behind on an ordinary body: a window
 * in which nothing at all reaches it.
 *
 * **It is the rule docs/spec/structure.md has carried unbuilt since the spec
 * was written** — *a missed shot in the wrong colour: brief invulnerability*.
 * What existed instead was a grey outline render/ held for a third of a
 * second, which looked exactly like a penalty and was not one: the reload gap
 * is half a beat, so the second bolt was already loaded and the body died on
 * the beat it would have died on anyway. The owner watched that and said the
 * plain thing about it — *it is not long enough to hurt*.
 *
 * So the window is real now, and it is `colourArmourMs` long. Two things
 * follow from that, and both are the point rather than a side effect. The
 * wrong colour costs the *next* shot as well as the one that was fired, which
 * is what makes "a wrong colour is spent, not missed" a sentence with a price
 * behind it. And a body that is standing there refusing everything is the one
 * moment where the pair has to say the colour again rather than louder.
 *
 * **A shot into the window is not a colour mistake and is not booked as one.**
 * `resolveThrob` makes the same argument next door about the same distinction:
 * getting the ammunition wrong is the navigator's, and firing at the wrong
 * *moment* is nobody's in particular. Charging the second one to the colour
 * balance would read one mistake to the wrong player twice.
 *
 * Its own file, and three functions rather than a comparison written wherever
 * it is wanted: the shot the simulation refuses and the grey body render/
 * draws are one fact, and a second copy of the window is how a bolt comes to
 * land in a body that is still visibly dead to it (`packages/sim/test/purity.test.ts`).
 */

/** How many ticks a wrong colour keeps an ordinary body shut. */
export function colourArmourTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.colourArmourMs);
}

/**
 * A body nothing has missed. Far enough back that the window has always
 * expired — `VEIL_UNSTRUCK`'s sentinel and its reason: tick 0 is a real tick,
 * so 0 would armour every body on the first frame of a wave.
 */
export const COLOUR_UNSTRUCK = -1_000_000;

/** Whether this body is refusing shots. Call it rather than comparing ticks. */
export function colourIsArmoured(world: World, c: Creature): boolean {
  return world.tick - (c.colourStruckTick ?? COLOUR_UNSTRUCK) < colourArmourTicks(world.cfg);
}

/**
 * How far through the window this body is, 0..1, or 1 when it is answerable
 * again. Render's whole reading of the grey body, so the look cannot outlive
 * the rule or stop before it.
 */
export function colourArmourPhase(world: World, c: Creature): number {
  const ticks = colourArmourTicks(world.cfg);
  if (ticks <= 0) return 1;
  const since = world.tick - (c.colourStruckTick ?? COLOUR_UNSTRUCK);
  return Math.max(0, Math.min(1, since / ticks));
}

/** Seconds of the window this body has left, or 0 — what render draws by. */
export function colourArmourLeft(world: World, c: Creature): number {
  const ticks = colourArmourTicks(world.cfg);
  const since = world.tick - (c.colourStruckTick ?? COLOUR_UNSTRUCK);
  return Math.max(0, (ticks - since) / world.cfg.tickHz);
}
