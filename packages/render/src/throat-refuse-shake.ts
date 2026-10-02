import { type Creature, throatBoss, ticksPerBeat, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";

/**
 * **A body the mouth would not take shakes where it stands.** The owner, 1
 * October 2026: *sucking in wrong mode … enemy shakes but stays on original
 * position and not be defeated*. The simulation leaves it where it was and
 * writes down which body and when (`refusedId`, `refusedTick`,
 * `sim/throat-suck.ts`), and writes it again while the body is still in the
 * circle, so the shake lasts as long as the wrong colour is held on it.
 *
 * Sideways only, and off the tick and the beat's phase rather than the wall
 * clock, so both screens shake the same body the same way; it fades over the
 * refusal's own window. Nothing is held between frames.
 */
export function throatRefuseShake(l: Layout, world: World, c: Creature, beatPhase: number): number {
  const b = throatBoss(world);
  if (b === null || b.refusedId !== c.id || b.refusedTick < 0) return 0;
  const tpb = ticksPerBeat(world.cfg);
  // The ticks since, and how far into the next one this frame is: the beat's
  // phase carries the fraction between two ticks.
  const between = beatPhase * tpb - Math.floor(beatPhase * tpb);
  const since = world.tick - b.refusedTick + between;
  const span = world.cfg.throatRefuseTicks;
  if (since < 0 || since >= span) return 0;
  const fade = 1 - since / span;
  // Three swings a beat: quick enough to read as a no, slow enough to see.
  return Math.sin((since / tpb) * Math.PI * 2 * SWINGS) * l.tile * AMPLITUDE * fade;
}

/** How far a refused body swings each way, in tiles. */
const AMPLITUDE = 0.14;

/** Swings per beat. */
const SWINGS = 3;
