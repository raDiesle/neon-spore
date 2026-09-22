import { stepAntiphon } from "./antiphon-step.js";
import { stepBaton } from "./baton-step.js";
import { stepLateBoss } from "./boss-others-b.js";
import type { QueenState } from "./boss-state.js";
import type { BossState } from "./boss-union.js";
import { stepCairn } from "./cairn.js";
import { stepCandle } from "./candle-step.js";
import { stepCurtain } from "./curtain-step.js";
import { stepDiastole } from "./diastole-step.js";
import { stepFilament } from "./filament-step.js";
import { stepGimbal } from "./gimbal-step.js";
import { stepGorge } from "./gorge-step.js";
import { stepHive } from "./hive-step.js";
import { stepInstar } from "./instar-step.js";
import { stepLead } from "./lead-step.js";
import { stepLedger } from "./ledger-step.js";
import { stepMaze } from "./maze-round.js";
import { stepMirror } from "./mirror.js";
import { stepOrrery } from "./orrery-step.js";
import { stepScuttle } from "./scuttle-step.js";
import { stepSinew } from "./sinew-step.js";
import { stepSplice } from "./splice-round.js";
import { stepStare } from "./stare-step.js";
import { stepSurge } from "./surge-step.js";
import { stepTaster } from "./taster-step.js";
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
  // THE CURTAIN on the beat is the fabric's clock: the soft lobes redrawn,
  // the roll-back, the core's fire. The shove is the carry's, before this
  // (`grip-push.ts`), and the shots are on the tick (`curtain-shot.ts`).
  if (boss.kind === "curtain") {
    stepCurtain(world, boss);
    return;
  }
  // THE TASTER on the beat is the fan's own clock: a blade out of the crest,
  // its colour setting off the ledger of what the pair has spent, and the
  // re-edge once it is hurrying. What a shot does to it is on the tick, from
  // `bullets.ts` and `lance-burn.ts` (`taster-shot.ts`).
  if (boss.kind === "taster") {
    stepTaster(world, boss);
    return;
  }
  // THE LEDGER on the beat is the cord's clock: the returns reaching the
  // socket and warded there or not, the root walking one column along the hull
  // with each of them, and the tear. Both halves of what a shot costs are on
  // the tick — one at the top of the field and one at the muzzle
  // (`ledger-shot.ts`).
  if (boss.kind === "ledger") {
    stepLedger(world, boss);
    return;
  }
  // THE SINEW on the beat is the tendon's clock: the sum read against the
  // zone, the hold, the part, the snap-back, the slack, the fall. The two
  // hands are on the tick (`sinew-hand.ts`, from `step.ts`).
  if (boss.kind === "sinew") {
    stepSinew(world, boss);
    return;
  }
  // THE SURGE on the beat is the bulb's clock: the charge, the leak, the
  // feeding, the burst at the top. The two thumbs and the lift they are
  // judged by are on the tick (`surge-hand.ts`, from `step.ts`).
  if (boss.kind === "surge") {
    stepSurge(world, boss);
    return;
  }
  // THE LEAD on the beat is the body's clock: the pace, the shots judged
  // against where it now is, the run's litter, the still and the pass. The
  // shot leaving the top of the field is on the tick (`lead-shot.ts`).
  if (boss.kind === "lead") {
    stepLead(world, boss);
    return;
  }
  // THE SCUTTLE on the beat is the frame's clock: the count, the throw, the
  // next part loose, the wind-up and the collapse. A shot striking a hanging
  // part off is on the tick (`scuttle-shot.ts`).
  if (boss.kind === "scuttle") {
    stepScuttle(world, boss);
    return;
  }
  // THE ANTIPHON on the beat is the body's clock: the rest, the growth, the
  // window run out, the still and the ship, the collapse. A shot naming an
  // organ or a decoy is on the tick (`antiphon-shot.ts`).
  if (boss.kind === "antiphon") {
    stepAntiphon(world, boss);
    return;
  }
  // THE HIVE on the beat is the underside's clock: the swell, the openings
  // and the spill. The bolt that seals a breach is on the tick (`hive-shot.ts`).
  if (boss.kind === "hive") {
    stepHive(world, boss);
    return;
  }
  // THE INSTAR on the beat is the script's clock; the thumbs are on the tick (`instar-hand.ts`).
  if (boss.kind === "instar") {
    stepInstar(world, boss);
    return;
  }
  // THE FILAMENT on the beat is the pauses between filaments; the thumbs are on the tick (`filament-hand.ts`).
  if (boss.kind === "filament") {
    stepFilament(world, boss);
    return;
  }
  // THE GIMBAL is almost all beat: a ring is a position rather than an event,
  // so the hands only move rings and every judgement — true, slip, shear,
  // seam — is here (`gimbal-step.ts`).
  if (boss.kind === "gimbal") {
    stepGimbal(world, boss);
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
  // And THE FLEET, THE WELL and the six that are not stepped here at all are
  // on the second page (`boss-others-b.ts`), handed across on 22 September
  // 2026 when THE GIMBAL's branch took this one over its 250-line limit.
  // Those three were the last on the chain, which is this repository's seam
  // everywhere it splits a full page: the **last** rows go, never the boss
  // being worked on, whose branch stays under the comment that explains it.
  // The close goes with them, because the arm that catches what nobody named
  // has to stand at the foot of whichever page ends the chain.
  stepLateBoss(world, boss);
}
