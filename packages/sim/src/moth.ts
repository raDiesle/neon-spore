import { midCol, type SimConfig } from "./config.js";
import { MILLI, type World } from "./world.js";

/**
 * THE MOTH: a great moth drawn to the cannon's light. The owner's ask of 19
 * October 2026: *a boss for "first step" … red cannon and to position it …
 * which only requires red shooting on parts of the enemy.* A field boss with
 * a script, the second kind in `.claude/skills/new-boss`, played on
 * STANDARD 1: player 1 carries the cannon, player 2 has red, and nothing else.
 *
 * **The rule is one sentence**: it comes to your light — shoot what glows red.
 *
 * **It follows the cannon.** Once the cannon has stood still in a column for
 * `mothNoticeBeats`, the moth drifts to hang over it, a column every
 * `mothDriftBeats`; over it, it **sinks**, half a row a beat, and after
 * `mothLandBeats` it **lands on the cannon** — the hull hit, its own blow
 * (`bossStrikesHull`). Moving the cannon breaks it off and it rises again.
 * So the pilot's column is the aim and the bait at once, which is the
 * question no shipped boss asks: **the pair steer the boss with the cannon**.
 *
 * **The levels change what is asked**, authored in content (`MOTH_SCRIPT`):
 *
 * - **wings** — red eyespots lit on its wings, `offset` columns off its body,
 *   all at once or one at a time (`inTurn`), the next on the far side of it.
 *   The cannon has to be under a spot to hit it, and the moment it stops
 *   there the moth starts turning toward it, so a spot is a column said and a
 *   shot fired before the moth arrives. A spot hit tears its wing. A step may
 *   **shed** a slick off a wing every `dustEvery` beats — FIRST STEP's red
 *   body, falling like any other.
 * - **belly** — every wing torn, it flies from the light now, hopping to a
 *   new column every `hopEvery` beats, and its only lit part is its belly,
 *   open **only while it sinks over the cannon** — which it does, as on every
 *   step, only once the cannon has stood still under it `mothNoticeBeats`. The pilot chases it, the
 *   moth comes down, the gunner fires into it before it lands; a hit throws
 *   it up and away. The bait the first levels taught to avoid is the answer.
 *
 * **The split is the panel's own**: the pilot's column and the gunner's
 * trigger, and every step is *go there — now*.
 *
 * **Its health is its silhouette**: a wing for every spot, a ring of belly
 * for every hit it still needs, and no bar.
 *
 * The clock is `moth-step.ts`, the fingerprint `moth-hash.ts`, the numbers
 * `config-moth.ts`. This file is the shape and the questions asked of it.
 */

/** Where the fight is: coming in, a step lit, resting between steps, beaten. */
export const MOTH_PHASES = ["enter", "flit", "rest", "spent"] as const;
export type MothPhase = (typeof MOTH_PHASES)[number];

/** The two kinds of step, in the order the content names them. */
export const MOTH_STEP_KINDS = ["wings", "belly"] as const;

/**
 * Red spots on its wings, `spots` columns off its body; it may shed a slick.
 * `inTurn` lights them one at a time in the order written, the next once the
 * last is torn; without it every spot glows at once.
 */
export interface MothWingsStep {
  kind: "wings";
  spots: readonly number[];
  inTurn?: boolean;
  /** Beats between two slicks shaken off its wings; none if absent. */
  dustEvery?: number;
}

/** Its belly, hit `hits` times as it sinks; it hops away every `hopEvery` beats. */
export interface MothBellyStep {
  kind: "belly";
  hits: number;
  hopEvery: number;
}

export type MothStep = MothWingsStep | MothBellyStep;

/** What a wave authors: the whole script, in order. */
export interface MothEntry {
  kind: "moth";
  steps: readonly MothStep[];
}

/** Everything THE MOTH remembers between beats. */
export interface MothState {
  kind: "moth";
  /** Copied at install and never written again. */
  steps: MothStep[];
  phase: MothPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** The column its body hangs over. */
  centre: number;
  /** This step's spots still lit, as offsets from its body; empty on a belly step. */
  spots: number[];
  /** Belly hits taken this step. */
  hits: number;
  /** Beats it has sunk over the cannon; 0 while it hangs at its row. */
  settle: number;
  /** The cannon's column when last looked at. */
  seenCol: number;
  /** `world.beat` the cannon came to stand in `seenCol`. */
  seenBeat: number;
  /** `world.beat` it last flew a column or hopped. */
  flitBeat: number;
  /** Slicks shed so far, all steps together. */
  shed: number;
  /** Times it has landed on the cannon. */
  landed: number;
}

/** THE MOTH when it is the boss, or `null`. */
export function mothBoss(world: World): MothState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "moth" ? boss : null;
}

/** The step lit, or `null` outside `flit`. */
export function mothLitStep(s: MothState): MothStep | null {
  return s.phase === "flit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The spots glowing now, as offsets: the first one left on a step taken in turn. */
export function mothLitSpots(s: MothState): readonly number[] {
  const step = mothLitStep(s);
  if (step?.kind !== "wings") return [];
  return step.inTurn === true ? s.spots.slice(0, 1) : s.spots;
}

/** Whether the cannon has stood still long enough for the moth to turn to it. */
export function mothSeesLight(world: World, s: MothState): boolean {
  return world.beat - s.seenBeat >= world.cfg.mothNoticeBeats;
}

/** Whether its belly is open to a bolt: a belly step, and sinking over the cannon. */
export function mothBellyOpen(s: MothState): boolean {
  return mothLitStep(s)?.kind === "belly" && s.settle > 0;
}

/** Whether a bolt up `col` meets its body or wings. */
export function mothCovers(cfg: SimConfig, s: MothState, col: number): boolean {
  return Math.abs(col - s.centre) <= cfg.mothSpan;
}

/** The row its parts are met on, in thousandths: its row, and lower as it sinks. */
export function mothMeetMilli(cfg: SimConfig, s: MothState): number {
  return cfg.mothRow * MILLI + s.settle * cfg.mothSinkMilli;
}

/** Beats before it lands on the cannon, or -1 when it is not sinking. */
export function mothLandsIn(cfg: SimConfig, s: MothState): number {
  return s.settle > 0 ? Math.max(0, cfg.mothLandBeats - s.settle) : -1;
}

/** Parts it has left to lose: a wing for every spot, a ring for every belly hit. */
export function mothLobes(s: MothState): number {
  if (s.phase === "spent") return 0;
  let n = 0;
  for (let i = s.cursor; i < s.steps.length; i++) {
    const step = s.steps[i];
    if (step === undefined) continue;
    const now = i === s.cursor && s.phase === "flit";
    if (step.kind === "wings") n += now ? s.spots.length : step.spots.length;
    else n += now ? Math.max(0, step.hits - s.hits) : step.hits;
  }
  return n;
}

/** Every part it starts with: one per spot and one per belly hit in the script. */
export function mothLobesAll(s: MothState): number {
  return s.steps.reduce((n, st) => n + (st.kind === "wings" ? st.spots.length : st.hits), 0);
}

/** Wings torn so far: every spot of every step before this one, and this one's hit. */
export function mothTorn(s: MothState): number {
  let n = 0;
  for (let i = 0; i < Math.min(s.cursor, s.steps.length); i++) {
    const st = s.steps[i];
    if (st?.kind === "wings") n += st.spots.length;
  }
  const now = s.steps[s.cursor];
  if (now?.kind === "wings" && s.phase === "flit") n += now.spots.length - s.spots.length;
  return n;
}

/** A column its body may hang over, its wings kept on the field. */
export function mothClampCentre(cfg: SimConfig, col: number): number {
  const span = Math.min(cfg.mothSpan, Math.floor((cfg.cols - 1) / 2));
  return Math.max(span, Math.min(cfg.cols - 1 - span, col));
}

export function mothDone(s: MothState): boolean {
  return s.phase === "spent";
}

export function freshMoth(world: World, steps: readonly MothStep[]): MothState {
  return {
    kind: "moth",
    // Copied, never shared: the state is the world's, and a content list
    // edited in place would change a fight already under way.
    steps: steps.map((st) => (st.kind === "wings" ? { ...st, spots: [...st.spots] } : { ...st })),
    phase: "enter",
    phaseBeat: world.beat,
    cursor: 0,
    centre: midCol(world.cfg),
    spots: [],
    hits: 0,
    settle: 0,
    seenCol: world.cannonCol,
    seenBeat: world.beat,
    flitBeat: world.beat,
    shed: 0,
    landed: 0,
  };
}
