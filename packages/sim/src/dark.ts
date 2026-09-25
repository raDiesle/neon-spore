import { ticksPerBeat } from "./config.js";
import { faultStepIn } from "./fault-clock.js";
import { faultOn } from "./fault-placed.js";
import type { World } from "./world.js";
import type { LitTile } from "./world-faults.js";

/**
 * THE DARK: **the field above the ship goes out, and a finger lights it.**
 *
 * While the fault is in force neither screen shows a body. Either seat may
 * put a thumb anywhere on the field, or drag one across it, and the squares
 * under it are lit for `darkLitBeats` — on *both* screens, because the light
 * is a `light` command through the one ordered stream and not a picture one
 * device drew for itself. Then that square is dark again.
 *
 * The owner asked for it on 25 September 2026 as another fault brush. It
 * swallows no press and breaks no button — THE FLIP's kind of fault, where
 * every control works and what has gone is what the pair can see. What it
 * adds is a job for a free hand: one thumb on the strip, the other sweeping
 * the dark, and whoever found the body saying where.
 *
 * **Why the light is in the simulation.** THE FLIP's lesson (`flip.ts`): a
 * picture the simulation never hears about has nothing to hash, nothing to
 * replay and nothing the director or a rehearsal can show. Nothing here
 * reaches a rule — a lit body falls and is shot exactly as a dark one is —
 * and render/ asks `litNow` what to uncover.
 */

/** Whether the dark is down on this beat. */
export function darkOn(world: World): boolean {
  return faultOn(world, "dark") !== null;
}

/** Whole beats the dark has been down, from 0 on the beat it falls; -1 while
 * it is up. For the picture's fade, which has nothing else to count from. */
export function darkBeats(world: World): number {
  const f = faultOn(world, "dark");
  return f === null ? -1 : faultStepIn(world, f.at);
}

/** Whether this wave puts the field out at all, in force or still to come. */
export function darkInWave(world: World): boolean {
  return world.faults.some((f) => f.kind === "dark");
}

/** The squares lit on this tick, oldest first. Empty while the dark is up. */
export function litNow(world: World): readonly LitTile[] {
  if (!darkOn(world)) return [];
  return world.lit.filter((t) => t.untilTick > world.tick);
}

/**
 * A finger on the dark, from either seat.
 *
 * A square already lit is lit again from now rather than lit twice, so a
 * thumb held still — or dragged back over its own path — keeps one entry per
 * square, and the list is never longer than the field has squares. The ones
 * gone out are dropped here, the one place the list grows. A press while the
 * dark is not down, or off the field, finds nothing and does nothing.
 */
export function lightTile(world: World, col: number, row: number): void {
  if (!darkOn(world)) return;
  if (col < 0 || col >= world.cfg.cols || row < 0 || row >= world.cfg.rows) return;
  const untilTick = world.tick + world.cfg.darkLitBeats * ticksPerBeat(world.cfg);
  world.lit = world.lit.filter((t) => t.untilTick > world.tick && (t.col !== col || t.row !== row));
  world.lit.push({ col, row, untilTick });
}
