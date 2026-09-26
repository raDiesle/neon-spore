import { stepAntiphon } from "./antiphon-step.js";
import { stepBaton } from "./baton-step.js";
import { stepLateBoss } from "./boss-others-b.js";
import type { QueenState } from "./boss-state.js";
import type { BossState } from "./boss-union.js";
import { stepCurtain } from "./curtain-step.js";
import { stepFilament } from "./filament-step.js";
import { stepGimbal } from "./gimbal-step.js";
import { stepGorge } from "./gorge-step.js";
import { stepHasp } from "./hasp-step.js";
import { stepHive } from "./hive-step.js";
import { stepInstar } from "./instar-step.js";
import { stepKeel } from "./keel-step.js";
import { stepLead } from "./lead-step.js";
import { stepLedger } from "./ledger-step.js";
import { stepMantle } from "./mantle-step.js";
import { stepMirror } from "./mirror.js";
import { stepOculus } from "./oculus-step.js";
import { stepRime } from "./rime-step.js";
import { stepScuttle } from "./scuttle-step.js";
import { stepSeam } from "./seam-step.js";
import { stepSinew } from "./sinew-step.js";
import { stepSpool } from "./spool-step.js";
import { stepStare } from "./stare-step.js";
import { stepSurge } from "./surge-step.js";
import { stepTaster } from "./taster-step.js";
import { stepThroat } from "./throat-step.js";
import { stepUndertow } from "./undertow-step.js";
import { stepValve } from "./valve-step.js";
import { stepVise } from "./vise-step.js";
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
  // THE INSTAR and THE NETTLE on the beat are the script's clock; the thumbs are on the tick (`instar-hand.ts`).
  if (boss.kind === "instar" || boss.kind === "nettle") {
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
  // THE MANTLE is almost all beat too: a handle's depth is where the thumb has
  // it, and whether the sum crosses this movement's threshold is a beat's
  // question, not a tick's (`mantle-step.ts`).
  if (boss.kind === "mantle") {
    stepMantle(world, boss);
    return;
  }
  // THE KEEL is a beat list: a joint lighting, its window running out, the
  // socket and the rock are every one of them a beat's question (`keel-step.ts`).
  if (boss.kind === "keel") {
    stepKeel(world, boss);
    return;
  }
  // THE VALVE: the windows, the list and the spark (`valve-step.ts`).
  if (boss.kind === "valve") {
    stepValve(world, boss);
    return;
  }
  // THE SEAM: each step lit and run out, and the split (`seam-step.ts`).
  if (boss.kind === "seam") {
    stepSeam(world, boss);
    return;
  }
  // THE OCULUS: steps lit, holds counted, and the shatter (`oculus-step.ts`).
  if (boss.kind === "oculus") {
    stepOculus(world, boss);
    return;
  }
  // THE VISE: steps lit, pinches counted, and the split (`vise-step.ts`).
  if (boss.kind === "vise") {
    stepVise(world, boss);
    return;
  }
  // THE RIME: steps lit, the frost regrowing, and the shatter (`rime-step.ts`).
  if (boss.kind === "rime") {
    stepRime(world, boss);
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
  // And the six that are not stepped here at all, with THE RATCHET, THE VANE,
  // THE CAIRN, THE MAZE, THE SPLICE, THE FLEET and THE WELL, are on the
  // second page (`boss-others-b.ts`). The first hand-across was on 22 September 2026, when
  // THE GIMBAL's branch took this one over its 250-line limit, and a later
  // boss's put it back there the same week. Both times the **last** rows
  // went, never the boss being worked on, whose branch stays under the comment
  // that explains it. The close goes with them, because the arm that catches
  // what nobody named has to stand at the foot of whichever page ends the
  // chain.
  stepLateBoss(world, boss);
}
