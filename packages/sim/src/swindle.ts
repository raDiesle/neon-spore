import { midCol } from "./config.js";
import type { PodKind } from "./pod-types.js";
import type { World } from "./world.js";

/**
 * THE SWINDLE: a slime that hangs real pods and husks side by side and
 * shuffles them, the boss of THE HUSK's block. The owner's ask of 16 October
 * 2026: *after root wave of "real" … "hollow", then again some boss for it,
 * focusing on the concept to iterate both* — and his pick of the three, the
 * shell game. A field boss, the second kind in `.claude/skills/new-boss`: the
 * ordinary field, falling, and the arc's panel.
 *
 * **The rule is one sentence**: swallow every real pod she lets go, and none
 * of the hollow ones.
 *
 * **A level is a hand of pods**, real and hollow, hung in a row over the
 * field. She trades two of them across on the level's beats, one pair at a
 * time and gliding, so the pilot — whose screen draws a husk as a pod — cannot
 * follow which is which; the navigator sees the mark on every husk the whole
 * time (`render/husk-mark.ts`) and calls each one as it comes. Then she lets
 * them go, one on each authored beat, and every pod falls the ordinary way and
 * homes to the cannon: the pilot opens the maw for a real one and keeps it
 * shut for a husk. The navigator may shoot one loose early, any colour, and
 * it falls the same.
 *
 * **Every pod is the ordinary pod** (`pods.ts`) with no clock (`NO_DUE`): she
 * lets every one of them go, so a ring would only be a second clock on the
 * same catch. The receipt is the ordinary one (`pod-arrive.ts`) — a real pod
 * missed and a husk swallowed both lose the wave — so there is no strike of
 * her own. **Her health is her real pods**: the last swallowed beats her.
 *
 * **The level waits** until every pod of it has left the field, swallowed or
 * refused; then she rears back and deals the next.
 */

/** Where she is: coming in, a hand hung, rearing back between, beaten. */
export const SWINDLE_PHASES = ["enter", "hang", "rear", "spent"] as const;
export type SwindlePhase = (typeof SWINDLE_PHASES)[number];

/** One pod of a hand: where it hangs, columns from the middle, and what it is. */
export interface SwindlePod {
  offset: number;
  kind: PodKind;
}

/** Two pods trading places, by their index in the hand, from beat `at`. */
export interface SwindleSwap {
  at: number;
  a: number;
  b: number;
}

/** A pod let go, by its index in the hand, on beat `at`. */
export interface SwindleDrop {
  at: number;
  pod: number;
}

/** One level of the script, authored on the wave. Beats count from the hand
 * being hung. */
export interface SwindleStep {
  pods: SwindlePod[];
  /** In the order of `at`, never two at once. */
  swaps: SwindleSwap[];
  /** In the order of `at`, every pod once. */
  drops: SwindleDrop[];
}

/** What a wave authors: the whole script, in order. */
export interface SwindleEntry {
  kind: "swindle";
  steps: readonly SwindleStep[];
}

export interface SwindleState {
  kind: "swindle";
  /** Copied at install, swaps and drops in beat order, and never written again. */
  steps: SwindleStep[];
  phase: SwindlePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level hanging, or the next to hang. */
  cursor: number;
  /** The hand's pods by id, in the level's own order; empty between hands. */
  hung: number[];
  /** How many of the lit level's swaps have begun. */
  swapped: number;
  /** How many of the lit level's drops are done. */
  dropped: number;
  /** The pods gliding by id, and the column each is gliding to in thousandths;
   * both empty while nothing glides. */
  glide: number[];
  glideTo: number[];
  /** Beats after the hand was hung that the glide ends on. */
  glideEnd: number;
  /** Real pods of hers swallowed in every level so far. */
  taken: number;
}

export function swindleBoss(world: World): SwindleState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "swindle" ? boss : null;
}

/** The level hanging, or null between levels. */
export function swindleLitStep(s: SwindleState): SwindleStep | null {
  return s.phase === "hang" ? (s.steps[s.cursor] ?? null) : null;
}

/** Real pods in the whole script: her health. */
export function swindleRealAll(s: SwindleState): number {
  let n = 0;
  for (const step of s.steps) for (const p of step.pods) if (p.kind === "pod") n += 1;
  return n;
}

/** Real pods of hers not yet swallowed. */
export function swindleRealLeft(s: SwindleState): number {
  return swindleRealAll(s) - s.taken;
}

/** The column pod `i` of a level is first hung over. */
export function swindlePodCol(world: World, step: SwindleStep, i: number): number {
  return midCol(world.cfg) + (step.pods[i]?.offset ?? 0);
}

/** Her pods of the levels after the lit one: what she still holds back. */
export function swindleHeld(s: SwindleState): number {
  const from = s.phase === "hang" ? s.cursor + 1 : s.cursor;
  return s.steps.slice(from).reduce((n, step) => n + step.pods.length, 0);
}

/** She is beaten: the fight is over. */
export function swindleDone(s: SwindleState): boolean {
  return s.phase === "spent";
}

/** A fresh swindle: nothing hung, nothing swapped, nothing taken. */
export function freshSwindle(beat: number, steps: readonly SwindleStep[]): SwindleState {
  return {
    kind: "swindle",
    steps: steps.map((step) => ({
      pods: step.pods.map((p) => ({ ...p })),
      swaps: [...step.swaps].sort((a, b) => a.at - b.at).map((w) => ({ ...w })),
      drops: [...step.drops].sort((a, b) => a.at - b.at).map((d) => ({ ...d })),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    hung: [],
    swapped: 0,
    dropped: 0,
    glide: [],
    glideTo: [],
    glideEnd: 0,
    taken: 0,
  };
}
