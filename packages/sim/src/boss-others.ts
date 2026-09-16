import { stepBaton } from "./baton-step.js";
import type { BossState, QueenState } from "./boss-state.js";
import { stepCairn } from "./cairn.js";
import { stepDiastole } from "./diastole-step.js";
import { stepFleet } from "./fleet.js";
import { stepMaze } from "./maze-round.js";
import { stepMirror } from "./mirror.js";
import { stepSplice } from "./splice-round.js";
import { stepStare } from "./stare-step.js";
import { stepVane } from "./vane.js";
import { stepWarden } from "./warden.js";
import type { World } from "./world.js";

/**
 * **One beat of whichever boss is not the queen**, which is now thirteen of
 * the fourteen.
 *
 * Cut out of `boss.ts` when THE STARE took that file eight lines over its
 * 250-line limit, and the seam is the one `step-round.ts` already cut one
 * clock along: next door is the **queen's own beat** — her phases, her walk,
 * her blooms, and the private helpers that only she uses — and this is the
 * dispatch that has to say *not her* thirteen times before it gets there.
 * Nine more rounds are designed and each is a branch here, so this is the half
 * that grows, and it took a dozen imports with it.
 *
 * **A boss that does nothing on the beat still says so**, by name and with the
 * reason, rather than falling off the end. Three of them are stepped on the
 * *tick* from `step`'s own early return because their pictures need that
 * resolution; one is a projection with no behaviour of its own; one answers
 * presses and nothing else. A silent fall-through would make all five look
 * like oversights.
 */
export function stepOtherBoss(world: World, boss: Exclude<BossState, QueenState>): void {
  if (boss.kind === "mirror") {
    stepMirror(world, boss);
    return;
  }
  if (boss.kind === "warden") {
    stepWarden(world, boss);
    return;
  }
  // THE STARE is the eye's own cycle and nothing else: away, turning,
  // looking, back. It touches no body and answers no press here — what a press
  // costs while it is looking is decided where presses arrive, above the
  // switch in `commands.ts` (`stare-step.ts`).
  if (boss.kind === "stare") {
    stepStare(world, boss);
    return;
  }
  // THE DIASTOLE is four phases and nothing else: a contraction is derived
  // from the beat and the origin, and a hit arrives on the tick a shot leaves
  // through the top of a column. What the beat owns is when a cadence moves
  // and when the bridge has finished bursting (`diastole-step.ts`).
  if (boss.kind === "diastole") {
    stepDiastole(world, boss);
    return;
  }
  // THE BATON on the beat is the arm's own clock: a bead lands, a bead that
  // sat too long is shaken home, a dead segment lets go. Both presses — the
  // launch and the strike — arrive on the tick, from `commands.ts` and
  // `bullets.ts` (`baton-press.ts`).
  if (boss.kind === "baton") {
    stepBaton(world, boss);
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
  // THE GAUGE, SNAKE and PINBALL never reach this. All three are stepped on
  // the tick from `step`'s own early return, and the field's beat does not run
  // while any of them stands — so the branch is here to say that out loud
  // rather than to do anything.
  if (boss.kind === "gauge" || boss.kind === "snake" || boss.kind === "pinball") return;
  // THE SCOUT is the fourth of them and the same sentence: the little ship is
  // flown on the tick, and the field has no beat while it is out.
  if (boss.kind === "scout") return;
  if (boss.kind === "pulse") return;
  // And THE WELL never does anything here at all, on any clock: it is the
  // field drawn inside out and the field's own rules are the whole of its
  // behaviour, so a beat of it is a beat of the wave its author wrote
  // (`well.ts`).
  if (boss.kind === "well") return;
  // Nor THE REPRISE, and for the opposite reason: what it does on the beat is
  // put bodies on the field, so it is stepped from `onBeat` beside the only
  // other thing that does and *before* it (`reprise.ts`).
  if (boss.kind === "reprise") return;
}
