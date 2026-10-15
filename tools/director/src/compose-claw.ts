import type { Wave, WaveEntry } from "@neon-spore/content";
import { nextInt, type PodEntry, type Rng } from "@neon-spore/sim";
import type { Step } from "./compose-steps.js";

/**
 * **THE CLAW's block, on THE CLAW's panel.** The panel has no colours and no
 * shield: a rock is answered only by a pod the arm takes from the air and the
 * maw swallows — a ward over the shield's column, a purge over the field.
 * AUTO clears THE CLAW with its pods and loses every wave of rocks alone, so
 * the ordinary steps, which place a pod only as a lever among slicks and
 * bulbs, cannot be played here. These place **groups**: a pod crossing in
 * from an edge, then the rocks it answers.
 *
 * The steps keep their order and their ramp — R1 the gentlest, R5 the dip —
 * and each changes one lever: which pods, from which side, how many rocks
 * each, how fast the pod crosses. The figures are AUTO's: with the arm waiting
 * under a pod falling home (`autopilot-claw.ts`), groups four beats apart
 * clear, and a group's rocks a beat or three apart.
 */

export interface ClawStep {
  groups: readonly [number, number];
  /** Beats from a group's last rock to the next pod. */
  gaps: readonly [number, number];
  /** Rocks after each pod. */
  rocks: readonly [number, number];
  kinds: readonly PodEntry["kind"][];
  /** Whether pods come in from the right edge as well as the left. */
  both?: true;
  /** Whether a pod may cross at THE CLAW's quick speed (its third pod). */
  quick?: true;
  /** Whether a purge's rocks may come two at once. */
  twins?: true;
}

const WARD = ["ward"] as const;
const PURGE = ["purge"] as const;
const EITHER = ["ward", "purge"] as const;

export const CLAW_STEPS: Readonly<Record<Step["id"], ClawStep>> = {
  R1: { groups: [3, 4], gaps: [6, 8], rocks: [1, 1], kinds: WARD },
  R2: { groups: [3, 4], gaps: [5, 7], rocks: [1, 1], kinds: PURGE },
  R3: { groups: [3, 4], gaps: [5, 6], rocks: [1, 1], kinds: EITHER, both: true },
  R4: { groups: [3, 5], gaps: [4, 6], rocks: [2, 2], kinds: EITHER, both: true },
  R5: { groups: [3, 4], gaps: [6, 8], rocks: [1, 2], kinds: EITHER, both: true },
  R6: { groups: [4, 5], gaps: [5, 6], rocks: [1, 2], kinds: EITHER, both: true, quick: true },
  R7: { groups: [4, 6], gaps: [4, 6], rocks: [1, 3], kinds: EITHER, both: true, twins: true },
  R8: {
    groups: [5, 7],
    gaps: [4, 4],
    rocks: [1, 3],
    kinds: EITHER,
    both: true,
    quick: true,
    twins: true,
  },
};

/** The beats from the first arrival to the last a claw wave may take. */
const SPAN: readonly [number, number] = [12, 56];

const LAST_COL = 10;
/** The shield's column, which a ward covers: the panel has no shield to move. */
const SHIELD_COL = 5;
/** Beats from a pod to its first rock: THE CLAW's own. */
const LEAD = 2;
/** The rows a pod crosses on, and the quick speed — THE CLAW's. */
const ROWS: readonly [number, number] = [3, 6];
const QUICK = 3;
const ROCKS = ["meteor", "meteor", "meteorMedium"] as const;

const between = (rng: Rng, [lo, hi]: readonly [number, number]): number =>
  lo + nextInt(rng, hi - lo + 1);
const pick = <T>(rng: Rng, list: readonly T[]): T => list[nextInt(rng, list.length)] as T;

/** A step as the claw's block has it: its gaps, span and count, the rest the same. */
export function clawStep(step: Step): Step {
  const c = CLAW_STEPS[step.id];
  const [fewRocks, manyRocks] = c.rocks;
  const arrivals = [
    c.groups[0] * (1 + fewRocks),
    c.groups[1] * (1 + manyRocks) + (c.twins ? c.groups[1] : 0),
  ] as const;
  const { twins: _t, jump: _j, ...rest } = step;
  return { ...rest, cols: [0, LAST_COL], gaps: c.gaps, span: SPAN, arrivals };
}

/** The step's wave, drawn once from `rng`. */
export function placeClaw(step: Step, rng: Rng): Pick<Wave, "entries" | "pods"> {
  const c = CLAW_STEPS[step.id];
  const entries: WaveEntry[] = [];
  const pods: PodEntry[] = [];
  const groups = between(rng, c.groups);
  let beat = 0;
  for (let g = 0; g < groups; g++) {
    const kind = pick(rng, c.kinds);
    const left = !c.both || nextInt(rng, 2) === 0;
    const quick = c.quick && nextInt(rng, 3) === 0;
    let at = beat + LEAD;
    const rocks: WaveEntry[] = [];
    for (let r = between(rng, c.rocks); r > 0; r--) {
      const col = kind === "ward" ? SHIELD_COL : between(rng, [0, LAST_COL]);
      rocks.push({ beat: at, col, kind: pick(rng, ROCKS), color: null });
      if (c.twins && kind === "purge" && nextInt(rng, 2) === 0) {
        rocks.push({
          beat: at,
          col: (col + 5) % (LAST_COL + 1),
          kind: pick(rng, ROCKS),
          color: null,
        });
      }
      at += between(rng, [1, 3]);
    }
    const last = Math.max(...rocks.map((e) => e.beat));
    if (last > SPAN[1]) break;
    pods.push({
      beat,
      col: left ? 0 : LAST_COL,
      row: between(rng, ROWS),
      kind,
      cross: left ? 1 : -1,
      ...(quick ? { speed: QUICK } : {}),
    });
    entries.push(...rocks);
    beat = last + between(rng, c.gaps);
  }
  entries.sort((a, b) => a.beat - b.beat || a.col - b.col);
  return { entries, pods };
}
