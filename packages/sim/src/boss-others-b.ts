import { offBeat } from "./boss-off-beat.js";
import type { QueenState } from "./boss-state.js";
import type { BossState } from "./boss-union.js";
import { stepFleet } from "./fleet.js";
import { stepWell } from "./well-step.js";
import type { World } from "./world.js";

/**
 * **The tail of `boss-others.ts`**, cut off it on 22 September 2026 when THE
 * GIMBAL's branch took that page over its 250-line limit.
 *
 * The seam is the page's own build order, the rule every overflowing page
 * here carries in its header: a full page hands its **last** rows across,
 * never the boss being worked on, whose branch stays with the comment that
 * explains it. THE FLEET and THE WELL were the last two on the chain, and
 * `offBeat` comes with them because it is not a branch at all — it is the
 * close, and the close has to stand at the foot of whichever page ends the
 * chain.
 *
 * **The check next door is unchanged.** `stepOtherBoss` ends by calling this
 * rather than by falling off its own end, so a boss stepped nowhere still
 * arrives at `offBeat` below and still has to say, by name, that it is
 * stepped somewhere else (`boss-off-beat.ts`).
 */
export function stepLateBoss(world: World, boss: Exclude<BossState, QueenState>): void {
  // THE FLEET has exactly one thing on the beat and it is the clock. Its
  // salvo and its sights answer a press on the tick, from `step` — a shot
  // that waited for the next beat would put a queue between the sentence and
  // the square it named (`fleet.ts`).
  if (boss.kind === "fleet") {
    stepFleet(world, boss);
    return;
  }
  // THE WELL turns its own face and nothing else: the field's rules are still
  // the wave's author's, and what walks on the beat is where the picture puts
  // them (`well-step.ts`).
  if (boss.kind === "well") {
    stepWell(world, boss);
    return;
  }
  // And six never reach this at all — five stepped on the tick, one stepped
  // before it — each with its reason written beside it, so a boss doing
  // nothing here is still a boss that says so (`boss-off-beat.ts`).
  if (offBeat(boss.kind)) return;
}
