import type { Color, Scar } from "./types.js";

/**
 * The vocabulary of a Simon round: what a step is, and everything the mirror
 * remembers between two beats. The choreography that moves it lives in
 * `mirror.ts`; this file is only the words, so `types.ts` can name a
 * `MirrorState` in the boss union without pulling the whole boss in.
 */

/**
 * One step of a sequence, named the way a player would say it out loud.
 *
 * Deliberately not every command the ship has. A lobe's *position* is aiming,
 * not a gesture, so only the cannon's direction of travel is in the alphabet
 * and the shield's is not: sliding the shield while answering is never a
 * mistake. That matters for more than tidiness — one test key moves both lobes
 * at once (`apps/game/src/input.ts`), and a shield step would turn that single
 * key press into two gestures.
 */
export type MirrorStep = "fireRed" | "fireCyan" | "guard" | "intake" | "cannonLeft" | "cannonRight";

/** Every step, in the order the director offers them. */
export const MIRROR_STEPS: readonly MirrorStep[] = [
  "fireRed",
  "fireCyan",
  "guard",
  "intake",
  "cannonLeft",
  "cannonRight",
];

/**
 * The step a shot of this colour is. The single source of that pairing — call
 * it rather than spelling out `color === "red" ? "fireRed" : "fireCyan"`,
 * which is the same rule written a second time and free to disagree with this
 * one the moment a third colour exists.
 */
export function fireStep(color: Color): MirrorStep {
  return color === "red" ? "fireRed" : "fireCyan";
}

/**
 * Which part of a round the mirror is in. `lead` is the beat or two of quiet
 * that says a sequence is coming, `show` is the demonstration, `listen` is the
 * pair's turn, `verdict` is the pause that shows how it went.
 */
/**
 * Why a round was lost. The pair can fail three different ways and only one of
 * them is "you pressed the wrong thing" — being told which is the difference
 * between learning the fight and resenting it.
 */
export type MirrorVerdictReason = "step" | "silence" | "bait";

export type MirrorPhase = "lead" | "show" | "listen" | "verdict";

/**
 * Beats of quiet before a sequence is performed, and so the length of the
 * count-in the pair sees: three beats, three numbers. Exported because
 * `render/` counts them down on screen and `mirror.ts` counts them off the
 * beat — one number, or the count would finish on a beat the sequence had
 * already started on.
 */
export const MIRROR_LEAD_BEATS = 3;

/**
 * Beats the finished sequence stays on screen after its last step, before the
 * pair's turn begins. Roughly three seconds at the default tempo: a sequence
 * that vanished on the beat it completed gave the pair nothing to fix it in
 * memory with, and the last step is the one they were still watching.
 */
export const MIRROR_HOLD_BEATS = 5;

/**
 * How long the pair has to answer, in beats: this much per step, plus a flat
 * allowance on top. Generous on purpose — the whole fight is memory across a
 * voice channel with a delay on it, never reaction time (docs/spec/latency.md),
 * and a pair still saying "no, shield *first*" has not failed at anything the
 * boss is testing.
 *
 * Call `mirrorListenBeats`; `render/` draws the clock from the same number the
 * simulation runs out, or the bar would empty on a different beat from the one
 * that ends the round.
 */
export const MIRROR_LISTEN_PER_STEP = 4;
export const MIRROR_LISTEN_SLACK = 8;

export function mirrorListenBeats(steps: number): number {
  return steps * MIRROR_LISTEN_PER_STEP + MIRROR_LISTEN_SLACK;
}

/**
 * The phases in a fixed order, so the world fingerprint can push one as a
 * number. `hashWorld` needs an integer for every field it covers, and an
 * index into this list is the one that cannot drift from the type above.
 */
export const MIRROR_PHASES: readonly MirrorPhase[] = ["lead", "show", "listen", "verdict"];

/**
 * The mirror: an exact copy of the ship, upside down at the top of the field,
 * that performs sequences of the pair's own controls and asks for them back.
 *
 * It has no petals and is never shot. It has a hull, the way the ship does,
 * and a correct round breaks it exactly as a miss breaks the ship — which is
 * why what it carries is a `hullMilli` and a list of `Scar`s, the same two
 * fields the ship's own damage lives in and the same two `render/` already
 * knows how to draw.
 */
export interface MirrorState {
  kind: "mirror";
  /** The authored sequences, one per round. */
  rounds: MirrorStep[][];
  /** Which round is being played. */
  round: number;
  phase: MirrorPhase;
  /** The beat the current phase began on. */
  phaseBeat: number;
  /** Steps of the current round the pair has already answered correctly. */
  matched: number;
  /** Steps of the current round it has performed so far. */
  shown: number;
  /**
   * The column its own cannon stands in: its own while it demonstrates,
   * yours for the rest of the round, because it shadows the ship it copies.
   */
  cannonCol: number;
  /** Its hull, in thousandths, 0..100000. The ship's own field, mirrored. */
  hullMilli: number;
  /** Where it broke. The same shape the ship's damage is kept in. */
  scars: Scar[];
  /** The last verdict: 1 right, -1 wrong, 0 none yet. */
  verdict: -1 | 0 | 1;
  /** The column that verdict landed in — where the echo hit, or where it broke. */
  verdictCol: number;
}

/** The steps of the round being played, or nothing past the last one. */
export function currentSteps(m: MirrorState): MirrorStep[] {
  return m.rounds[m.round] ?? [];
}

/**
 * Move to a phase and start its clock. Entering `lead` is also where a round
 * is wiped clean, because that is the only way into one — from the count-in,
 * whether the last round was answered or missed.
 *
 * It lives here rather than in `mirror.ts` so that the choreography and the
 * round's outcome can be separate files without either importing the other.
 */
export function enterPhase(
  m: MirrorState,
  phase: MirrorPhase,
  beat: number,
  cannonCol: number,
): void {
  m.phase = phase;
  m.phaseBeat = beat;
  if (phase === "lead") {
    m.matched = 0;
    m.shown = 0;
    m.cannonCol = cannonCol;
  }
}
