import { offBeat } from "./boss-off-beat.js";
import type { QueenState } from "./boss-state.js";
import type { BossState } from "./boss-union.js";
import { stepCairn } from "./cairn.js";
import { stepCyst } from "./cyst-step.js";
import { stepFleet } from "./fleet.js";
import { stepGrindstone } from "./grindstone-step.js";
import { stepHalter } from "./halter-step.js";
import { stepHasp } from "./hasp-step.js";
import { stepMaze } from "./maze-round.js";
import { stepRatchet } from "./ratchet-step.js";
import { stepSplice } from "./splice-round.js";
import { stepSpool } from "./spool-step.js";
import { stepVane } from "./vane.js";
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
 * **Four more arrived on 22 September 2026**, by the same rule and for the
 * same reason: THE BELLOWS put the first page back over the limit, so THE
 * VANE, THE CAIRN, THE MAZE and THE SPLICE — the last four on the chain —
 * came across ahead of THE FLEET. The order inside the page decides nothing
 * (every arm returns on its own kind); what it records is which end of the
 * chain a row came off, and the lane after the next one reads that rather
 * than guessing.
 *
 * **THE RATCHET came across on 26 September 2026**, the last row on the first
 * page when THE RIME's branch filled it, and **THE HASP** the same day, when
 * THE PLUMB's did, and **THE SPOOL** after it, when THE SLING's did, and
 * **THE GRINDSTONE** after that, when THE CYST's did, and **THE CYST** after
 * that, when THE DAVIT's did.
 *
 * **The check next door is unchanged.** `stepOtherBoss` ends by calling this
 * rather than by falling off its own end, so a boss stepped nowhere still
 * arrives at `offBeat` below and still has to say, by name, that it is
 * stepped somewhere else (`boss-off-beat.ts`).
 */
export function stepLateBoss(world: World, boss: Exclude<BossState, QueenState>): void {
  // THE HALTER: rests counted, pairs held together, windows shut, and the split (`halter-step.ts`).
  if (boss.kind === "halter") {
    stepHalter(world, boss);
    return;
  }
  // THE CYST: steps lit, taps waited for, pinches counted, and the split (`cyst-step.ts`).
  if (boss.kind === "cyst") {
    stepCyst(world, boss);
    return;
  }
  // THE GRINDSTONE: grit regrown, clamps counted, and the snap free (`grindstone-step.ts`).
  if (boss.kind === "grindstone") {
    stepGrindstone(world, boss);
    return;
  }
  // THE SPOOL is nearly all clock, because a brake is a level rather than an
  // edge: the line paying out, the zone moving under a correction, the slip and
  // the rib easing are every one of them a beat's question (`spool-step.ts`).
  if (boss.kind === "spool") {
    stepSpool(world, boss);
    return;
  }
  // THE HASP on the beat is the latches, the heat, the one bolt and the row
  // swinging clear — and the *saying* of the gate, once per change. Whether
  // the wheel turns at all is asked on the tick, where the hand is
  // (`hasp-hand.ts`).
  if (boss.kind === "hasp") {
    stepHasp(world, boss);
    return;
  }
  // THE RATCHET on the beat is the pawl lighting, a window running out, the
  // climb, the bolt and the open or the jam. A press is judged on the tick,
  // against her hand (`ratchet-hand.ts`).
  if (boss.kind === "ratchet") {
    stepRatchet(world, boss);
    return;
  }
  if (boss.kind === "vane") {
    stepVane(world, boss);
    return;
  }
  // THE CAIRN has exactly one thing on the beat, and it is the clock the pile
  // keeps on the pair: a stack that has stood `cairnShedBeats` lets a rock go
  // by itself. The hand that takes one apart answers on the tick, with the
  // other carries (`grip-push.ts`) — a gesture lands when the finger has
  // travelled, and only the clock belongs to the beat (`cairn.ts`).
  if (boss.kind === "cairn") {
    stepCairn(world, boss);
    return;
  }
  if (boss.kind === "maze") {
    stepMaze(world, boss);
    return;
  }
  // THE SPLICE is on the beat and on the field, like THE MIRROR: the hull,
  // the cannon and the maw under it are the ship's own, and what this clock
  // does is land a number that is already on its way down, give way to the
  // next tangle, and run a round's beats out (`splice-round.ts`). Its one
  // verb arrives on the tick, through the SUCK the pair already has.
  if (boss.kind === "splice") {
    stepSplice(world, boss);
    return;
  }
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
