import { midCol } from "./config.js";
import type { World } from "./world.js";

/**
 * THE MATRON: a mother slime hung over the field with her pods on her lobes,
 * the boss of FINALE, the last wave of the tutorial arc. The owner's ask of
 * 16 October 2026: *a new boss wave after SALVAGE — FINALE — which is about
 * all mechanics so far, in particular the suck enemies.* A field boss, the
 * second kind in `.claude/skills/new-boss`: the ordinary field, falling, and
 * the default panel.
 *
 * **The rule is one sentence**: take every pod off her before its ring runs
 * out.
 *
 * **Her health is her pods**, and no bar: each pod hangs off the tip of one
 * of her lobes, and a pod swallowed takes its lobe with it. When the last is
 * taken she is beaten.
 *
 * **A level is a clutch**: she hangs its pods all at once and throws the
 * arc's kit down at the pair while they hang — the two colours, rocks for the
 * shield, a torch — every throw authored, never rolled. **The level waits**
 * until every pod in it is swallowed (the owner's beat list that will not
 * advance until it is performed, `owner.md`); then she rears back and grows
 * the next. Whatever she had not thrown yet stays in her.
 *
 * **Every pod is the ordinary pod** (`pods.ts`), on the ordinary clock: shot
 * loose by the navigator, chased and swallowed by the pilot — the split is
 * SALVAGE's, and every hand the arc taught is needed again around it. A pod
 * whose ring runs out loses the wave the way any pod does (`cargoLost`), so
 * the threat is the clock, and there is no strike of her own.
 */

/** Where she is: coming in, a clutch hanging, rearing back between, beaten. */
export const MATRON_PHASES = ["enter", "hang", "rear", "spent"] as const;
export type MatronPhase = (typeof MATRON_PHASES)[number];

/** What she throws: a body in each colour, a rock for the shield, a torch. */
export const MATRON_THROWS = ["red", "cyan", "rock", "torch"] as const;
export type MatronThrowKind = (typeof MATRON_THROWS)[number];

/** One throw of a level: on which beat of it, down which column, what. */
export interface MatronThrow {
  /** Beats after the clutch is hung. */
  at: number;
  /** Columns from the middle. */
  offset: number;
  what: MatronThrowKind;
}

/** One level of the script, authored on the wave. */
export interface MatronStep {
  /** Beats each pod of the clutch has on its ring, from the beat it is hung. */
  beats: number;
  /** Where each pod hangs: columns from the middle, one per lobe. */
  pods: number[];
  /** What she throws while they hang, in the order of `at`. */
  throws: MatronThrow[];
}

/** What a wave authors: the whole script, in order. */
export interface MatronEntry {
  kind: "matron";
  steps: readonly MatronStep[];
}

export interface MatronState {
  kind: "matron";
  /** Copied at install, its throws in beat order, and never written again. */
  steps: MatronStep[];
  phase: MatronPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level hanging, or the next to hang. */
  cursor: number;
  /** The lit clutch's pods by id, in the level's own order; -1 before it is hung. */
  hung: number[];
  /** The lit clutch's pods swallowed, one bit each. */
  takenMask: number;
  /** Pods swallowed in every level so far: her lobes gone. */
  taken: number;
  /** How many of the lit level's throws have been thrown. */
  thrown: number;
}

export function matronBoss(world: World): MatronState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "matron" ? boss : null;
}

/** The level hanging, or null between levels. */
export function matronLitStep(s: MatronState): MatronStep | null {
  return s.phase === "hang" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether pod `i` of the lit clutch has been swallowed. */
export function matronTaken(s: MatronState, i: number): boolean {
  return (s.takenMask & (1 << i)) !== 0;
}

/** The lit clutch's pods still hanging or falling. */
export function matronLeft(s: MatronState): number {
  const step = matronLitStep(s);
  if (step === null) return 0;
  let left = 0;
  for (let i = 0; i < step.pods.length; i++) if (!matronTaken(s, i)) left += 1;
  return left;
}

/** Pods in the whole script: her lobes, and her health. */
export function matronLobesAll(s: MatronState): number {
  return s.steps.reduce((sum, step) => sum + step.pods.length, 0);
}

/** Her lobes still on her. */
export function matronLobesLeft(s: MatronState): number {
  return matronLobesAll(s) - s.taken;
}

/** The column pod `i` of a level hangs over. */
export function matronPodCol(world: World, step: MatronStep, i: number): number {
  return midCol(world.cfg) + (step.pods[i] ?? 0);
}

/** She is beaten: the fight is over. */
export function matronDone(s: MatronState): boolean {
  return s.phase === "spent";
}

/** A fresh matron: every lobe on her, nothing hung, nothing thrown. */
export function freshMatron(beat: number, steps: readonly MatronStep[]): MatronState {
  return {
    kind: "matron",
    steps: steps.map((step) => ({
      beats: step.beats,
      pods: [...step.pods],
      throws: [...step.throws].sort((a, b) => a.at - b.at).map((t) => ({ ...t })),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    hung: [],
    takenMask: 0,
    taken: 0,
    thrown: 0,
  };
}
