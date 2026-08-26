import { releaseBait, right, settle, wrong } from "./mirror-round.js";
import {
  currentSteps,
  enterPhase,
  MIRROR_HOLD_BEATS,
  MIRROR_LEAD_BEATS,
  type MirrorState,
  type MirrorStep,
  mirrorListenBeats,
} from "./simon.js";
import { MILLI, type World } from "./world.js";

/**
 * THE MIRROR's whole choreography: Simon Says, played on the pair's own
 * controls.
 *
 * It performs a sequence at its own ship, the pair performs it back, and
 * whoever gets it wrong first is answered by a rock out of the mirror's body
 * into the column the cannon happens to be standing in. Whoever gets it right
 * breaks the mirror in exactly the same place, by exactly the same means —
 * that symmetry is the boss. Nothing here is random: the rounds are authored
 * in the director, so the whole fight is the same fight on both devices
 * without a single draw from the rng.
 */

/**
 * The timing, as choreography rather than as a knob. Changing one of these
 * writes a different fight, not a different difficulty, which is why they sit
 * here and not in `SimConfig` — the same argument `PHASES` makes in `boss.ts`.
 */
/** Beats one performed step takes. Two, so a step is a gesture and not a twitch. */
const SHOW_BEATS = 2;

/** Beats the verdict stands before the next round begins. */
const VERDICT_BEATS = 3;

/**
 * One beat of the boss.
 *
 * A phase that ends on this beat hands it straight to the next one rather than
 * to the next beat — the beat a demonstration begins on is the beat its first
 * step is performed on. Without that the show quietly loses its opening step
 * to the beat it spent being announced, which is the kind of off-by-one nobody
 * notices as a bug: the sequence simply gets shorter than the one written down.
 */
export function stepMirror(world: World, m: MirrorState): void {
  // Outside a demonstration it stands over the ship it is a copy of. That is
  // the whole of its idle behaviour, and it is deliberately unsettling.
  if (m.phase !== "show") m.cannonCol = world.cannonCol;

  // At most one transition per phase, so a beat can never loop.
  for (let hop = 0; hop < 4; hop++) {
    const since = world.beat - m.phaseBeat;
    const steps = currentSteps(m);

    if (m.phase === "lead") {
      if (since < MIRROR_LEAD_BEATS) return;
      enterPhase(m, "show", world.beat, world.cannonCol);
      continue;
    }
    if (m.phase === "show") {
      const performed = steps.length * SHOW_BEATS;
      // The whole sequence stands for `MIRROR_HOLD_BEATS` after the beat its
      // last step was struck on — not after that step's slot runs out, which
      // would be a hold of a different length for no reason anyone could see.
      const lastStruck = Math.max(0, steps.length - 1) * SHOW_BEATS;
      if (since >= lastStruck + MIRROR_HOLD_BEATS) {
        enterPhase(m, "listen", world.beat, world.cannonCol);
        releaseBait(world);
        continue;
      }
      if (since < performed && since % SHOW_BEATS === 0) perform(world, m, steps);
      return;
    }
    if (m.phase === "listen") {
      // Silence is an answer too, and it is the wrong one.
      if (since >= mirrorListenBeats(steps.length)) wrong(world, m, "silence");
      return;
    }
    if (since < VERDICT_BEATS) return;
    settle(world, m);
    return;
  }
}

/**
 * One performed step. The cannon steps for real — the mirror's own `cannonCol`
 * moves — so what the pair is shown is the ship doing the thing, never a
 * symbol standing in for it.
 *
 * The direction is *not* flipped. It is a mirror in the picture only: an
 * upside-down ship that also swapped left for right would be a puzzle about
 * handedness, and this boss is a puzzle about memory.
 */
function perform(world: World, m: MirrorState, steps: MirrorStep[]): void {
  const step = steps[m.shown];
  if (step === undefined) return;
  if (step === "cannonLeft") m.cannonCol = Math.max(0, m.cannonCol - 1);
  if (step === "cannonRight") m.cannonCol = Math.min(world.cfg.cols - 1, m.cannonCol + 1);
  m.shown += 1;
  world.events.push({
    type: "mirrorShow",
    step,
    index: m.shown,
    of: steps.length,
    col: m.cannonCol,
  });
}

/**
 * One control, as the world heard it. Called from `applyCommand` for every
 * command that has a step to its name, whether or not the command itself did
 * anything — a shot swallowed by the cooldown was still a shot the pair meant
 * to take, and judging the ship's reaction instead of the player's intent
 * would fail a round for a reason nobody at either screen can see.
 */
export function mirrorHeard(world: World, step: MirrorStep): void {
  const m = world.boss;
  if (m === null || m.kind !== "mirror" || m.phase !== "listen") return;
  const steps = currentSteps(m);
  const want = steps[m.matched];
  if (want === undefined) return;
  if (step !== want) {
    wrong(world, m, "step");
    return;
  }
  m.matched += 1;
  world.events.push({ type: "mirrorEcho", step, index: m.matched, of: steps.length });
  if (m.matched >= steps.length) right(world, m);
}

/** A fresh mirror, at full hull, on the round it is authored to open with. */
export function installMirror(world: World, rounds: MirrorStep[][]): MirrorState {
  return {
    kind: "mirror",
    rounds: rounds.map((r) => [...r]),
    round: 0,
    phase: "lead",
    phaseBeat: world.beat,
    matched: 0,
    shown: 0,
    cannonCol: world.cannonCol,
    hullMilli: 100 * MILLI,
    scars: [],
    verdict: 0,
    verdictCol: -1,
  };
}

/**
 * True while THE MIRROR has the controls: the count-in and the demonstration.
 *
 * The pair cannot fly, fire, ward or swallow while a sequence is being shown —
 * not "it does not count", but nothing happens at all. Two reasons it is a
 * rule of the simulation and not a coat of paint on the band: both devices
 * have to agree exactly which ticks were dead, and a control that silently
 * did nothing would otherwise leave a shot in the air with no explanation.
 *
 * Call this rather than testing the phase by hand — `purity.test.ts` holds
 * everything else to it.
 */
export function mirrorHoldsControls(world: World): boolean {
  const boss = world.boss;
  if (boss === null || boss.kind !== "mirror") return false;
  return boss.phase === "lead" || boss.phase === "show";
}
