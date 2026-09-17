import { stepBaton } from "./baton-step.js";
import type { QueenState } from "./boss-state.js";
import type { BossState } from "./boss-union.js";
import { stepCairn } from "./cairn.js";
import { stepCandle } from "./candle-step.js";
import { stepDiastole } from "./diastole-step.js";
import { stepFleet } from "./fleet.js";
import { stepGorge } from "./gorge-step.js";
import { stepMaze } from "./maze-round.js";
import { stepMirror } from "./mirror.js";
import { stepOrrery } from "./orrery-step.js";
import { stepSplice } from "./splice-round.js";
import { stepStare } from "./stare-step.js";
import { stepThroat } from "./throat-step.js";
import { stepUndertow } from "./undertow-step.js";
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
  // THE THROAT: the eversion's clock, the phase its slack rings have earned,
  // and then the inhale — swallow what is in the mouth, then haul everything
  // else in the column a row closer (`throat-step.ts`).
  if (boss.kind === "throat") {
    stepThroat(world, boss);
    return;
  }
  // THE UNDERTOW on the beat is the floor's own clock: a push, a plate
  // parting, a breach widening, a lobe withdrawing, the hold counted. The
  // two answers — the maw and the beam — arrive on the tick, from
  // `commands.ts` and `lance-burn.ts` (`undertow-press.ts`).
  if (boss.kind === "undertow") {
    stepUndertow(world, boss);
    return;
  }
  // THE ORRERY on the beat is three orbits that nothing steps — where a gap
  // is is arithmetic over its anchor — so what is left for the clock is the
  // core's own fire, the organs coming off a ring that has just been taken,
  // and THE SLOW opened as an alignment comes up (`orrery-step.ts`). The one
  // thing that takes a ring off arrives from the top of a column
  // (`orrery-shot.ts`).
  if (boss.kind === "orrery") {
    stepOrrery(world, boss);
    return;
  }
  // THE CANDLE on the beat is the glow's clock: the drift, the turn, and the
  // black beats after the last step. The two moments a shot meets it are on
  // the tick, from `bullets.ts` and `lance-burn.ts` (`candle-step.ts`).
  if (boss.kind === "candle") {
    stepCandle(world, boss);
    return;
  }
  // THE GORGE on the beat is the sack's clock: the vent, the spit, the mouth
  // feeding itself. The one moment a shot meets it is on the tick, from
  // `bullets.ts` and `lance-burn.ts` (`gorge-step.ts`).
  if (boss.kind === "gorge") {
    stepGorge(world, boss);
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
