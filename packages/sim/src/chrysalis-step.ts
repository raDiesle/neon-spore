import {
  type ChrysalisState,
  type ChrysalisStep,
  chrysalisLeft,
  chrysalisLitStep,
  chrysalisNext,
  chrysalisPieceCol,
  freshChrysalis,
} from "./chrysalis.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE CHRYSALIS's clock: the cocoon coming in, each skin lighting, a sac
 * swelling and spraying, a skin peeling off or growing back, and the grub
 * dying after the last. THE BASTION's clock (`bastion-step.ts`) on a body
 * that is alive.
 *
 * The rub and the quills are heard on the tick (`chrysalis-hand.ts`), a shot
 * where it leaves the field (`chrysalis-shot.ts`) and the shield once a tick
 * (`chrysalisGuarded`); each takes its piece off there, the instant it is
 * done, through `chrysalisTakes`.
 *
 * **A skin's window is THE SLOW** — the owner's rule of 22 September 2026
 * for every choreographed step: opened as the skin lights, shut the instant
 * it comes off or runs out.
 */

export function installChrysalis(world: World, steps: readonly ChrysalisStep[]): ChrysalisState {
  const s = freshChrysalis(world.beat, steps);
  world.events.push({ type: "chrysalisEnter", col: midCol(world.cfg) });
  return s;
}

/** One beat of THE CHRYSALIS: a skin lit, a sac swelled and sprayed, a skin run out, the grub gone. */
export function stepChrysalis(world: World, s: ChrysalisState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.chrysalisSpentBeats) {
      world.events.push({ type: "chrysalisOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.chrysalisEnterBeats) light(world, s);
  else if (s.phase === "shed" && since >= cfg.chrysalisShedBeats) light(world, s);
  else if (s.phase === "regrow" && since >= cfg.chrysalisRegrowBeats) light(world, s);
  else if (s.phase === "skin") {
    const step = chrysalisLitStep(s);
    if (step !== null && since >= step.beats) regrow(world, s);
    else spray(world, s);
  }
}

/**
 * The next skin lights, every piece of it on. A thumb still down from before
 * keeps nothing: what it pulls or rubs is counted from its next lift.
 */
function light(world: World, s: ChrysalisState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "skin";
  s.phaseBeat = world.beat;
  s.goneMask = 0;
  s.pullMilli = [0, 0];
  s.tore = [s.down[0], s.down[1]];
  s.rubbed = [0, 0];
  s.sprayBeat = -1;
  s.nextSwellBeat = -1;
  world.events.push({ type: "chrysalisSkin", skin: step.skin, col: midCol(world.cfg) });
  openSlow(world, step.beats + 1, "ask");
  if (step.skin === "sacs") swell(world, s);
}

/** The next sac still on begins to swell over its column. */
function swell(world: World, s: ChrysalisState): void {
  const i = chrysalisNext(s);
  if (i < 0) return;
  s.sprayBeat = world.beat + world.cfg.chrysalisSwellBeats;
  s.swellTick = world.tick;
  s.nextSwellBeat = -1;
  world.events.push({ type: "chrysalisSwell", piece: i, col: chrysalisPieceCol(world, s, i) });
}

/**
 * A sac skin's beat: the next sac swelling once the gap is up, and a swollen
 * sac spraying its spores down with no shield raised under it — nothing is
 * hit, and the same sac swells again after the gap. A blocked one never gets
 * here: the shield took it on the tick (`chrysalisGuarded`).
 */
function spray(world: World, s: ChrysalisState): void {
  if (chrysalisLitStep(s)?.skin !== "sacs") return;
  if (s.sprayBeat < 0) {
    if (s.nextSwellBeat >= 0 && world.beat >= s.nextSwellBeat) swell(world, s);
    return;
  }
  if (world.beat < s.sprayBeat) return;
  const i = chrysalisNext(s);
  world.events.push({ type: "chrysalisSpray", piece: i, col: chrysalisPieceCol(world, s, i) });
  s.sprayBeat = -1;
  s.nextSwellBeat = world.beat + world.cfg.chrysalisGapBeats;
}

/** The skin ran out before its last piece: it grows back whole, and is lit again. */
function regrow(world: World, s: ChrysalisState): void {
  const step = chrysalisLitStep(s);
  if (step === null) return;
  closeSlow(world);
  s.phase = "regrow";
  s.phaseBeat = world.beat;
  s.sprayBeat = -1;
  s.nextSwellBeat = -1;
  world.events.push({ type: "chrysalisRegrow", skin: step.skin, col: midCol(world.cfg) });
}

/**
 * Piece `i` of the lit skin is off. The skin's last ends the skin, and the
 * script's last the fight. A sac skin swells its next sac after the gap.
 */
export function chrysalisTakes(world: World, s: ChrysalisState, i: number): void {
  const step = chrysalisLitStep(s);
  if (step === null) return;
  s.goneMask |= 1 << i;
  s.pieces += 1;
  if (step.skin === "sacs") {
    s.sprayBeat = -1;
    s.nextSwellBeat = world.beat + world.cfg.chrysalisGapBeats;
  }
  if (chrysalisLeft(s) > 0) return;
  closeSlow(world);
  s.cursor += 1;
  s.phaseBeat = world.beat;
  s.sprayBeat = -1;
  s.nextSwellBeat = -1;
  const col = midCol(world.cfg);
  world.events.push({ type: "chrysalisShed", skin: step.skin, col });
  if (s.cursor < s.steps.length) {
    s.phase = "shed";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "chrysalisSpent", col });
}
