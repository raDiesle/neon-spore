import {
  type BastionState,
  type BastionStep,
  bastionLeft,
  bastionLitStep,
  bastionNext,
  bastionPieceCol,
  freshBastion,
} from "./bastion.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE BASTION's clock: the moon coming in, each shell lighting, a node
 * charging and throwing its lightning, a shell coming off or growing back,
 * and the core blowing after the last.
 *
 * The plates and the rim are heard on the tick (`bastion-hand.ts`), a shot
 * where it meets the moon (`bastion-shot.ts`) and the shield once a tick
 * (`bastionGuarded`); each takes its piece off there, the instant it is
 * done, through `bastionTakes`.
 *
 * **A shell's window is THE SLOW** — the owner's rule of 22 September 2026
 * for every choreographed step: opened as the shell lights, shut the instant
 * it comes off or runs out.
 */

export function installBastion(world: World, steps: readonly BastionStep[]): BastionState {
  const s = freshBastion(world.beat, steps);
  world.events.push({ type: "bastionEnter", col: midCol(world.cfg) });
  return s;
}

/** One beat of THE BASTION: a shell lit, a node charged and loosed, a shell run out, the moon gone. */
export function stepBastion(world: World, s: BastionState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.bastionSpentBeats) {
      world.events.push({ type: "bastionOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.bastionEnterBeats) light(world, s);
  else if (s.phase === "shed" && since >= cfg.bastionShedBeats) light(world, s);
  else if (s.phase === "regrow" && since >= cfg.bastionRegrowBeats) light(world, s);
  else if (s.phase === "layer") {
    const step = bastionLitStep(s);
    if (step !== null && since >= step.beats) regrow(world, s);
    else discharge(world, s);
  }
}

/**
 * The next shell lights, every piece of it on. A thumb still on a plate from
 * before keeps nothing: what it has pulled is measured from here.
 */
function light(world: World, s: BastionState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "layer";
  s.phaseBeat = world.beat;
  s.goneMask = 0;
  s.pullMilli = [0, 0];
  s.tore = [s.down[0], s.down[1]];
  s.dischargeBeat = -1;
  s.nextChargeBeat = -1;
  world.events.push({ type: "bastionLayer", layer: step.layer, col: midCol(world.cfg) });
  openSlow(world, step.beats + 1, "ask");
  if (step.layer === "lattice") charge(world, s);
}

/** The next node still on begins to charge over its column. */
function charge(world: World, s: BastionState): void {
  const i = bastionNext(s);
  if (i < 0) return;
  s.dischargeBeat = world.beat + world.cfg.bastionChargeBeats;
  s.chargeTick = world.tick;
  s.nextChargeBeat = -1;
  world.events.push({ type: "bastionCharge", piece: i, col: bastionPieceCol(world, s, i) });
}

/**
 * A lattice's beat: the next node charging once the gap is up, and a charged
 * node throwing its lightning down with no shield raised under it — nothing
 * is hit, and the same node charges again after the gap. A blocked one never
 * gets here: the shield took it on the tick (`bastionGuarded`).
 */
function discharge(world: World, s: BastionState): void {
  if (bastionLitStep(s)?.layer !== "lattice") return;
  if (s.dischargeBeat < 0) {
    if (s.nextChargeBeat >= 0 && world.beat >= s.nextChargeBeat) charge(world, s);
    return;
  }
  if (world.beat < s.dischargeBeat) return;
  const i = bastionNext(s);
  world.events.push({ type: "bastionArc", piece: i, col: bastionPieceCol(world, s, i) });
  s.dischargeBeat = -1;
  s.nextChargeBeat = world.beat + world.cfg.bastionGapBeats;
}

/** The shell ran out before its last piece: it grows back whole, and is lit again. */
function regrow(world: World, s: BastionState): void {
  const step = bastionLitStep(s);
  if (step === null) return;
  closeSlow(world);
  s.phase = "regrow";
  s.phaseBeat = world.beat;
  s.dischargeBeat = -1;
  s.nextChargeBeat = -1;
  world.events.push({ type: "bastionRegrow", layer: step.layer, col: midCol(world.cfg) });
}

/**
 * Piece `i` of the lit shell is off. The shell's last ends the shell, and
 * the script's last the fight. A lattice charges its next node after the gap.
 */
export function bastionTakes(world: World, s: BastionState, i: number): void {
  const step = bastionLitStep(s);
  if (step === null) return;
  s.goneMask |= 1 << i;
  s.pieces += 1;
  if (step.layer === "lattice") {
    s.dischargeBeat = -1;
    s.nextChargeBeat = world.beat + world.cfg.bastionGapBeats;
  }
  if (bastionLeft(s) > 0) return;
  closeSlow(world);
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.dischargeBeat = -1;
  s.nextChargeBeat = -1;
  const col = midCol(world.cfg);
  world.events.push({ type: "bastionShed", layer: step.layer, col });
  if (s.cursor < s.steps.length) {
    s.phase = "shed";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "bastionSpent", col });
}
