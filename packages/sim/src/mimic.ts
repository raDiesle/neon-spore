import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MIMIC: a soft mantle with eight arms whose skin wears a sign that only
 * one seat can see, and only the other seat can answer, by drawing it
 * (`docs/spec/bosses-choreographed.md` §42).
 *
 * **The rule is one sentence**: one of you sees the sign on its skin and says
 * what it is, and the other draws it.
 *
 * `signs` is the truth the screens split (`PerSeatTruth`, the Queen's two
 * marks turned on their side): the sign seat *k* must draw is
 * `signs[k - 1]`, and it is shown on the **other** seat's screen only
 * (`mimicReadBy`). The answer is the `glyph` command, an index into the five
 * of `glyphs.ts` recognised on the drawing phone (`mimic-hand.ts`). **A right
 * sign peels**, and draws every arm back up a step. **A wrong sign is
 * mimicked**: for `mimicMimicBeats` the skin wears what was drawn, on both
 * screens, and then an arm reaches a step down toward the hull. A window run
 * out with nothing drawn does the same with the skin left mottled.
 * `mimicReaches` reaches in one movement strike the hull, which is the wave.
 *
 * **Its health is its signs**: six peeled one at a time over two movements,
 * then two split skins each peeled by both seats at once, each baring a core
 * that takes one shot in the colour it is lit.
 */

/**
 * Where the scene is: flattened at the top and slapping into shape, a sign
 * on the skin, the skin wearing a wrong sign, flinching from a peel, rolling
 * over between movements, the core bare and lit, clenching from a hit, and
 * shapeless and falling, spent.
 */
export const MIMIC_PHASES = [
  "entering",
  "sign",
  "mimicking",
  "peeled",
  "rolling",
  "core",
  "clench",
  "spent",
] as const;
export type MimicPhase = (typeof MIMIC_PHASES)[number];

/**
 * What a step asks: one sign read by one seat and drawn by the other; a skin
 * split in two, each half read by one seat and drawn by the other at once; the
 * bare core shot; or a roll between movements, which asks nothing.
 */
export const MIMIC_ASKS = ["sign", "split", "core", "roll"] as const;
export type MimicAsk = (typeof MIMIC_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface MimicStep {
  ask: MimicAsk;
  /** The seat that sees a `sign` step's sign; the other draws it. A split's seats read each other's. */
  reader: 1 | 2;
  /** Whether the sign changes to another of the five `mimicChangeBeats` into its window. */
  changes: boolean;
  /** The colour a `core` step's shot must be, or `"either"`. */
  color: Color | "either";
  /** Beats the step's window stays open: a sign's to be drawn, the core's to be shot, a roll's to roll. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface MimicEntry {
  kind: "mimic";
  steps: readonly MimicStep[];
}

export interface MimicState {
  kind: "mimic";
  /** Copied at install and never written again. */
  steps: MimicStep[];
  phase: MimicPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** The sign each seat must draw, an index into `GLYPHS`, or -1 with nothing to draw. */
  signs: [number, number];
  /** What each seat drew wrong, shown on the skin while it is mimicked, or -1 for the mottle. */
  drawn: [number, number];
  /** Which seats have peeled their sign in the step that is on. */
  peeled: [boolean, boolean];
  /** Whether the step's sign has already changed. */
  changed: boolean;
  /** Arms reached down in this movement. */
  reaches: number;
  /** Signs peeled off in all. */
  peels: number;
  /** Shots the core has taken. */
  hits: number;
}

export function mimicBoss(world: World): MimicState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "mimic" ? boss : null;
}

/** The step lit, or null with none. */
export function mimicStep(s: MimicState): MimicStep | null {
  return s.steps[s.cursor] ?? null;
}

/** Whether a sign is on the skin to be drawn. */
export function mimicAsking(s: MimicState): boolean {
  return s.phase === "sign";
}

/** Whether `seat` has a sign to draw this instant: a pad of its own, and its half not yet peeled. */
export function mimicDraws(s: MimicState, seat: 1 | 2): boolean {
  return mimicAsking(s) && (s.signs[seat - 1] ?? -1) !== -1 && !s.peeled[seat - 1];
}

/**
 * **The sign `seat`'s screen shows**, or -1 for the mottle: the one the
 * *other* seat must draw, while it is still on the skin. The whole of the
 * split — the seat that can see is never the hand that can answer.
 */
export function mimicReadBy(s: MimicState, seat: 1 | 2): number {
  const other: 1 | 2 = seat === 1 ? 2 : 1;
  return mimicDraws(s, other) ? (s.signs[other - 1] ?? -1) : -1;
}

/** Whether the skin is wearing a wrong sign, or the mottle of a window run out. */
export function mimicMimicking(s: MimicState): boolean {
  return s.phase === "mimicking";
}

/** Whether the core is bare and lit to be shot. */
export function mimicFiring(s: MimicState): boolean {
  return s.phase === "core";
}

/** Shapeless and falling: the fight is over. */
export function mimicDone(s: MimicState): boolean {
  return s.phase === "spent";
}

/** A fresh mimic: flattened at the top, no sign on it, no arm reached. */
export function freshMimic(beat: number, steps: readonly MimicStep[]): MimicState {
  return {
    kind: "mimic",
    steps: steps.map((step) => ({ ...step })),
    phase: "entering",
    phaseBeat: beat,
    cursor: 0,
    signs: [-1, -1],
    drawn: [-1, -1],
    peeled: [false, false],
    changed: false,
    reaches: 0,
    peels: 0,
    hits: 0,
  };
}
