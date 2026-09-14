import { type SimEvent, step, type World } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";

/**
 * **One tick of a pose's world**, and the one thing four tests and the seat
 * probe want out of `versus-pair.ts` without wanting a `Pair` at all.
 *
 * Its own file, split off when that one reached the 250-line ceiling, along
 * the seam its importers had already drawn: next door is a *pair of phones* —
 * two canvases, a crop window, BLINK, a settle hash, a freeze — and this is
 * the step underneath it, which knows about a world and a rebuild and nothing
 * about a screen. `versus-seat.ts` steps a world to sample it and builds no
 * pair; `versus-cadence`, `versus-crop-follow`, `versus-hand` and
 * `versus-loop` each test the step alone.
 */

/**
 * One tick, rebuilding on `needWave` rather than discarding what the fresh
 * world carries. `pose-kit.ts`'s `runUntil` returns on the exact tick its
 * named state arrives, so a rebuilt world's own `events` already holds the
 * `fire` or `deflect` that moment produced — a shield candidate's shockwave
 * is drawn from that event alone, since the rock it caught left no scar and
 * no lasting body. Handing back `[]` here on every rebuild, as this file used
 * to, is why that shockwave never played (`test/versus-loop.test.ts`). `pose`
 * matters only with `cadenceSeconds` set: `needWave` is then left to `startPair`,
 * and its `hand` says what a pose's hand does this tick (`Pose.hand`).
 */
type StepResult = { world: World; events: SimEvent[] };
export function advance(world: World, build: () => World, pose?: Pose): StepResult {
  step(world, pose?.hand ? pose.hand(world) : []);
  if (pose?.cadenceSeconds === undefined && world.events.some((e) => e.type === "needWave")) {
    const rebuilt = build();
    return { world: rebuilt, events: [...rebuilt.events] };
  }
  return { world, events: [...world.events] };
}
