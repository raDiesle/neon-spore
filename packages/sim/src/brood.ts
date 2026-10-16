import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BROOD: a sac of slime hung over the field that grows the two enemies
 * the pair has just learnt — slicks and bulbs — on its rim. The owner's ask
 * of 16 October 2026: *a new cool boss, after the waves of 8, which is only
 * about "bulb" and "slick" of mechanics and enemies introduced so far.* A
 * field boss, the second kind in `.claude/skills/new-boss`, played on
 * STANDARD 2: the cannon, red and cyan, and nothing else.
 *
 * **The rule is one sentence**: shoot each bud in its colour before it drops.
 *
 * A **bud** swells on the rim over its column for `ripenBeats`: a red one is
 * a small slick, a cyan one a small bulb — one kind, one colour, one shape,
 * so the word the pair already has for it is the word it needs. A bolt of
 * its colour up its column **pops** it, and the sac loses a lobe. A bud that
 * ripens before it is shot **drops**: it falls from the rim as the ordinary
 * slick or bulb it was growing into, which is the threat carried out — one
 * more body for the pair to stop before the hull — and the lobe grows it
 * again `broodRegrowBeats` later. So a miss is never the end of the fight,
 * only more of it, and the sac is beaten only by popping every bud.
 *
 * **The split is the panel's own.** Player 1 has the cannon and player 2 has
 * both colours, so every bud is a column said one way and a colour said the
 * other; two or three ripening at once is which first, said by both.
 *
 * **Levels change the ask**, authored in content (`BROOD_SCRIPT`): one bud
 * at a time, then two of different colours at once, then three. Between two
 * steps it rests `broodRestBeats`, and after the last it is spent.
 *
 * **Its health is its lobes**: one for every bud still to pop, and no bar.
 *
 * The clock is `brood-step.ts`, the fingerprint `brood-hash.ts`, the numbers
 * `config-brood.ts`. This file is the shape and the questions asked of it.
 */

/** Where the fight is: coming down, buds growing, resting between steps, beaten. */
export const BROOD_PHASES = ["enter", "grow", "rest", "spent"] as const;
export type BroodPhase = (typeof BROOD_PHASES)[number];

/** One bud of a step, as content authors it. */
export interface BroodBudPlan {
  /** Columns from the middle it hangs over. */
  offset: number;
  color: Color;
}

/** One step of the script: the buds that grow together, and how long they take. */
export interface BroodStep {
  buds: readonly BroodBudPlan[];
  /** Beats a bud hangs before it drops. */
  ripenBeats: number;
}

/** What a wave authors: the whole script, in order. */
export interface BroodEntry {
  kind: "brood";
  steps: readonly BroodStep[];
}

/** One bud on the rim this step. */
export interface BroodBud {
  col: number;
  color: Color;
  /** `world.beat` it began to grow; it hangs from then, and is regrowing before it. */
  bornBeat: number;
  /** Shot in its colour: its lobe is gone. */
  popped: boolean;
}

/** Everything THE BROOD remembers between beats. */
export interface BroodState {
  kind: "brood";
  /** Copied at install and never written again. */
  steps: BroodStep[];
  phase: BroodPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step growing, or the next to grow. */
  cursor: number;
  /** This step's buds; empty outside `grow`. */
  buds: BroodBud[];
  /** Buds that have dropped so far, all steps together. */
  dropped: number;
}

/** THE BROOD when it is the boss, or `null`. */
export function broodBoss(world: World): BroodState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "brood" ? boss : null;
}

/** The step whose buds are growing, or `null` between steps. */
export function broodLitStep(s: BroodState): BroodStep | null {
  return s.phase === "grow" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether a bud is on the rim now, to be shot: not popped, and not regrowing. */
export function broodHangs(world: World, bud: BroodBud): boolean {
  return !bud.popped && world.beat >= bud.bornBeat;
}

/** The bud hanging over `col`, or `undefined`. */
export function broodBudIn(world: World, s: BroodState, col: number): BroodBud | undefined {
  if (s.phase !== "grow") return undefined;
  return s.buds.find((b) => b.col === col && broodHangs(world, b));
}

/** Beats a hanging bud has left before it drops; `0` for one not hanging. */
export function broodRipeIn(world: World, s: BroodState, bud: BroodBud): number {
  const step = broodLitStep(s);
  if (step === null || !broodHangs(world, bud)) return 0;
  return Math.max(0, bud.bornBeat + step.ripenBeats - world.beat);
}

/** Lobes left: one for every bud still to pop, this step and every step after it. */
export function broodLobes(s: BroodState): number {
  let n = 0;
  for (let i = s.cursor; i < s.steps.length; i++) {
    const step = s.steps[i];
    if (step === undefined) continue;
    n +=
      i === s.cursor && s.phase === "grow"
        ? s.buds.filter((b) => !b.popped).length
        : step.buds.length;
  }
  return s.phase === "spent" ? 0 : n;
}

/** Every lobe the sac starts with: one per bud in the script. */
export function broodLobesAll(s: BroodState): number {
  return s.steps.reduce((n, step) => n + step.buds.length, 0);
}

/** The column a planned bud hangs over, kept on the field. */
export function broodColOf(cfg: SimConfig, plan: BroodBudPlan): number {
  return Math.max(0, Math.min(cfg.cols - 1, midCol(cfg) + plan.offset));
}

/** Whether `col` is under the sac, where a bolt is met by its hide if no bud hangs there. */
export function broodCovers(cfg: SimConfig, col: number): boolean {
  return Math.abs(col - midCol(cfg)) <= cfg.broodSpan;
}

export function broodDone(s: BroodState): boolean {
  return s.phase === "spent";
}

export function freshBrood(beat: number, steps: readonly BroodStep[]): BroodState {
  return {
    kind: "brood",
    // Copied, never shared: the state is the world's, and a content list
    // edited in place would change a fight already under way.
    steps: steps.map((st) => ({ ripenBeats: st.ripenBeats, buds: st.buds.map((b) => ({ ...b })) })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    buds: [],
    dropped: 0,
  };
}
