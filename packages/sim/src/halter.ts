import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE HALTER: a wary seam over the middle column, in three segments, that
 * bares one only while one seat sends nothing at all and the other holds both
 * grips down — and then a centre that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §36).
 *
 * **The rule is one sentence**: one of you touches nothing while the other
 * holds both grips; hold it together and the seam opens; then shoot the bared
 * centre.
 *
 * The first tenant of `RestraintGate`: `restBeats` counts, per seat, the beats
 * that seat has sent the game **no command at all** — a drag, a press, a
 * slide of the cannon, every one resets it (`halter-hand.ts`). A seat is
 * *settled* when its count is up and it holds no grip. The other half is
 * `CHORD`, THE TRIVET's reading: `halterChordLeft` and `halterChordRight`
 * both down on one seat. The two are asked **together**, and either one
 * failing while they are clears both counters.
 *
 * A left step asks the navigator to rest and the pilot to grip; a right step
 * the other way round, §36's swap by movement. Both cracked bare the centre.
 * After that a rest-and-chord step is a **guard**, either pairing free, to
 * keep the plating off the centre; a guard not made shuts it, and it is
 * asked again until it is.
 *
 * **Its health is the two segments and the three shots.** A rest-and-chord
 * window that runs out is tried again; a shot that runs out is a hull hit,
 * which is the wave.
 */

/**
 * Where the scene is: shut and settling in, a step lit and waiting (for the
 * pair, or for a shot), the seam pausing between steps, and the seam spent.
 */
export const HALTER_PHASES = ["alarmed", "lit", "pause", "spent"] as const;
export type HalterPhase = (typeof HALTER_PHASES)[number];

/** What a step asks: the left segment, the right, a guard over the centre, or a shot at it. */
export const HALTER_ASKS = ["left", "right", "guard", "fire"] as const;
export type HalterAsk = (typeof HALTER_ASKS)[number];

/** Both grips down: the chord's mask, one bit a grip. */
export const HALTER_BOTH_GRIPS = 3;

/** One step of the script, authored on the wave. */
export interface HalterStep {
  ask: HalterAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step is lit: the pair's window, or how long a fire step waits for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface HalterEntry {
  kind: "halter";
  steps: readonly HalterStep[];
}

export interface HalterState {
  kind: "halter";
  /** Copied at install and never written again. */
  steps: HalterStep[];
  phase: HalterPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Whether each segment has cracked, the left then the right: nought or one. */
  cracks: [number, number];
  /** Shots the centre has taken. */
  hits: number;
  /** Whether the centre lies bare to be shot. */
  bared: boolean;
  /**
   * Each seat's rest, the pilot then the navigator: whole beats sent no
   * command, held at `halterRestThreshold` and zeroed as a step lights.
   */
  restBeats: [number, number];
  /** Whether each seat has sent a command since the last beat: that beat does not count. */
  stirred: [boolean, boolean];
  /** Each seat's grips down, as a mask: one for the left, two for the right. */
  grips: [number, number];
  /** Beats the lit step's pair has been held together. */
  heldBeats: number;
}

export function halterBoss(world: World): HalterState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "halter" ? boss : null;
}

/** The step lit, or null between steps. */
export function halterLitStep(s: HalterState): HalterStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The segment the lit step is about, nought for the left and one for the right; null otherwise. */
export function halterSide(s: HalterState): 0 | 1 | null {
  const ask = halterLitStep(s)?.ask;
  return ask === "left" ? 0 : ask === "right" ? 1 : null;
}

/** Whether the lit step is a guard over the bared centre. */
export function halterGuarding(s: HalterState): boolean {
  return halterLitStep(s)?.ask === "guard";
}

/**
 * The seats that may rest for the lit step: the navigator for the left, the
 * pilot for the right, either for a guard, none for a shot.
 */
export function halterResters(s: HalterState): readonly (1 | 2)[] {
  const ask = halterLitStep(s)?.ask;
  if (ask === "left") return [2];
  if (ask === "right") return [1];
  if (ask === "guard") return [1, 2];
  return [];
}

/** A seat's place in the per-seat pairs: nought for the pilot, one for the navigator. */
export function halterSeatIndex(seat: 1 | 2): 0 | 1 {
  return seat === 1 ? 0 : 1;
}

/** Whether a seat has both grips down. */
export function halterGripped(s: HalterState, seat: 1 | 2): boolean {
  return s.grips[halterSeatIndex(seat)] === HALTER_BOTH_GRIPS;
}

/** Whether a seat has rested its count out with nothing held: a thumb on a grip is touching something. */
export function halterSettled(world: World, s: HalterState, seat: 1 | 2): boolean {
  const i = halterSeatIndex(seat);
  return s.restBeats[i] >= world.cfg.halterRestThreshold && s.grips[i] === 0;
}

/**
 * The seat resting for a pair that holds together this instant — settled,
 * with the other seat's chord down — or null. What a beat counts.
 */
export function halterPairing(world: World, s: HalterState): 1 | 2 | null {
  for (const seat of halterResters(s)) {
    if (halterSettled(world, s, seat) && halterGripped(s, seat === 1 ? 2 : 1)) return seat;
  }
  return null;
}

/** The seam spent: the fight is over and it is only hanging open. */
export function halterDone(s: HalterState): boolean {
  return s.phase === "spent";
}

/** A fresh seam: alarmed and whole, the centre covered, nobody resting, no grip down. */
export function freshHalter(beat: number, steps: readonly HalterStep[]): HalterState {
  return {
    kind: "halter",
    steps: steps.map((step) => ({ ...step })),
    phase: "alarmed",
    phaseBeat: beat,
    cursor: 0,
    cracks: [0, 0],
    hits: 0,
    bared: false,
    restBeats: [0, 0],
    stirred: [false, false],
    grips: [0, 0],
    heldBeats: 0,
  };
}
