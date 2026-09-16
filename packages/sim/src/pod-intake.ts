import { markMoment } from "./balance.js";
import { msToTicks, type SimConfig } from "./config.js";
import { mirrorBaitTaken } from "./mirror-round.js";
import { purge, ward } from "./pod-effects.js";
import type { PodKind } from "./pod-types.js";
import { failWave } from "./wave-fail.js";
import type { World } from "./world.js";

/**
 * **The mouth**: whether it is open, and what happens to a cargo that reaches
 * it either way.
 *
 * Split out of `pods.ts` when THE MOULT arrived and needed the second half of
 * this file without needing any of the first. The seam is a real one and it is
 * the one the two files are named along: everything left next door is about a
 * *pod* — a thing that hangs, is knocked loose and sinks — and everything here
 * is about the **ship**, which does not care what shape the thing arriving at
 * it was. A moult is not a pod: it is a body that falls down a lane and is
 * wearing a pod for five beats when it lands. But what the pair has to do
 * about one is the same two conditions, and what it costs them to miss is the
 * same lost wave, so the rule is written once and both callers read it.
 *
 * `pods.ts` re-exports `mawOpen`, so nothing that already asked the package
 * index for it had to move.
 */

/** Ticks the maw stays open, from `intakeWindowMs` at this tick rate. */
export function intakeWindowTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.intakeWindowMs);
}

/**
 * Whether the maw is open this tick — the one place that decides it.
 *
 * `resolveIntake` asks it of an arriving pod, `moultArrives` of an arriving
 * body, and the button and the sound ask the same question rather than writing
 * the window out again. They used `<` where this uses `<=`, so the mouth drew
 * and sounded shut one tick before it stopped swallowing.
 */
export function mawOpen(world: World): boolean {
  const windowTicks = intakeWindowTicks(world.cfg);
  return world.tick - world.intakeTick <= windowTicks && world.intakeTick <= world.tick;
}

/**
 * Swallowed: the cargo lands, all at once, on the tick of the catch. There is
 * no pickup that waits to be spent.
 *
 * `col` is where it went in, which is the cannon's column by construction —
 * both callers only reach this after checking that — and it is passed rather
 * than read off the world so the event says where the picture happened rather
 * than where the cannon has since slid to.
 */
export function takeCargo(world: World, col: number, kind: PodKind): void {
  world.balance.podsTaken += 1;
  markMoment(world, true);
  switch (kind) {
    case "purge":
      purge(world);
      break;
    case "ward":
      ward(world);
      break;
  }
  // A boss may have been hanging this out as bait — see `mirrorBaitTaken`.
  mirrorBaitTaken(world);
  world.events.push({ type: "podTaken", col, kind });
}

/**
 * Not swallowed, at the hull or off the side: **the wave is lost.** The owner's
 * rule of 12 September 2026 lists *sucked* beside destroyed, evaded and
 * shielded as the ways a wave is passed, so a cargo that breaks on the skin or
 * gets away is a hit and not a missed gift.
 */
export function cargoLost(world: World, col: number): void {
  world.balance.podsLost += 1;
  markMoment(world, false);
  failWave(world);
  world.events.push({ type: "podLost", col: clampCol(world, col) });
}

/** The column an event may name, which is one that exists. A cargo blown a
 * tile past the wall is still lost in the wall's own column. */
function clampCol(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, col));
}
