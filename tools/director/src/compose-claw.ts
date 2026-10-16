import type { Wave } from "@neon-spore/content";
import { nextInt, type PodEntry, type Rng } from "@neon-spore/sim";
import type { Step } from "./compose-steps.js";

/**
 * **THE CLAW's block, on THE CLAW's panel.** The panel has no colours and no
 * shield, so it places nothing but **pods**: each crossing in from an edge, to
 * be taken from the air by the arm and swallowed before its clock runs out.
 *
 * It placed rocks too while a pod carried a cargo — a ward over the shield's
 * column, a purge over the field — and each pod was the answer to the rocks
 * after it. The owner rejected both cargoes on 16 October 2026
 * (`sim/pod-types.ts`), which left a rock on this panel with no answer at all.
 *
 * The steps keep their order and their ramp — R1 the gentlest, R5 the dip —
 * and each changes one lever: how many pods, how far apart, from which side,
 * how fast one crosses. The figures are AUTO's (`autopilot-claw.ts`): the arm
 * has to be home before it can reach for the next, so the gaps are the round
 * trip and a little over.
 */

export interface ClawStep {
  /** How many pods the wave carries. */
  groups: readonly [number, number];
  /** Beats from one pod to the next. */
  gaps: readonly [number, number];
  /** Whether pods come in from the right edge as well as the left. */
  both?: true;
  /** Whether a pod may cross at THE CLAW's quick speed (its third pod). */
  quick?: true;
}

export const CLAW_STEPS: Readonly<Record<Step["id"], ClawStep>> = {
  R1: { groups: [3, 4], gaps: [10, 12] },
  R2: { groups: [3, 4], gaps: [9, 11] },
  R3: { groups: [3, 4], gaps: [8, 10], both: true },
  R4: { groups: [4, 5], gaps: [8, 9], both: true },
  R5: { groups: [3, 4], gaps: [10, 12], both: true },
  R6: { groups: [4, 5], gaps: [8, 9], both: true, quick: true },
  R7: { groups: [5, 6], gaps: [7, 9], both: true },
  R8: { groups: [5, 7], gaps: [7, 8], both: true, quick: true },
};

/** The beats from the first arrival to the last a claw wave may take. */
const SPAN: readonly [number, number] = [12, 56];

const LAST_COL = 10;
/** The rows a pod crosses on, and the quick speed — THE CLAW's. */
const ROWS: readonly [number, number] = [3, 6];
const QUICK = 3;

const between = (rng: Rng, [lo, hi]: readonly [number, number]): number =>
  lo + nextInt(rng, hi - lo + 1);

/** A step as the claw's block has it: its gaps, span and count, the rest the same. */
export function clawStep(step: Step): Step {
  const c = CLAW_STEPS[step.id];
  const { twins: _t, jump: _j, ...rest } = step;
  return { ...rest, cols: [0, LAST_COL], gaps: c.gaps, span: SPAN, arrivals: c.groups };
}

/** The step's wave, drawn once from `rng`. */
export function placeClaw(step: Step, rng: Rng): Pick<Wave, "entries" | "pods"> {
  const c = CLAW_STEPS[step.id];
  const pods: PodEntry[] = [];
  const groups = between(rng, c.groups);
  let beat = 0;
  for (let g = 0; g < groups && beat <= SPAN[1]; g++) {
    const left = !c.both || nextInt(rng, 2) === 0;
    const quick = c.quick && nextInt(rng, 3) === 0;
    pods.push({
      beat,
      col: left ? 0 : LAST_COL,
      row: between(rng, ROWS),
      kind: "pod",
      cross: left ? 1 : -1,
      ...(quick ? { speed: QUICK } : {}),
    });
    beat += between(rng, c.gaps);
  }
  return { entries: [], pods };
}

/** The gap, in beats, under which a pod comes sooner than the arm is easily
 * home, and how many beats under it cost one more. R1's widest gap is twelve. */
const EASY_GAP = 12;
const GAP_PER_POINT = 4;

/**
 * **A claw wave's pressure**, read off its pods. `wavePressure` reads entries
 * and nothing else, and a claw wave has none since the cargoes went, so every
 * draw scored 0 and no step could rise (`docs/queue.md`, 16 October 2026).
 * Each pod costs one, one more when it comes from the other edge than the
 * pod before (the arm crosses the field), one more when it crosses at the
 * quick speed, and a quarter for every beat it comes sooner than `EASY_GAP`
 * after the one before. More pods, closer, from both sides and quicker — the
 * four levers `CLAW_STEPS` turns — each raise it. To one decimal, as
 * `wavePressure` is.
 */
export function clawPressure(wave: Pick<Wave, "pods">): number {
  const pods = [...(wave.pods ?? [])].sort((a, b) => a.beat - b.beat);
  let sum = 0;
  for (const [i, p] of pods.entries()) {
    const prev = pods[i - 1];
    const crossed = prev && prev.col !== p.col ? 1 : 0;
    const quick = p.speed === QUICK ? 1 : 0;
    const soon = prev ? Math.max(0, EASY_GAP - (p.beat - prev.beat)) / GAP_PER_POINT : 0;
    sum += 1 + crossed + quick + soon;
  }
  return Math.round(sum * 10) / 10;
}
