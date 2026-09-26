import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE OCULUS: a lens of six leaves over the middle column, shut two at a time
 * by both seats holding at once, and then a socket that has to be shot in the
 * colour it shows (`docs/spec/bosses-choreographed.md` §27).
 *
 * **The rule is one sentence**: hold both leaves down together until they
 * shut, then shoot the open socket in its colour.
 *
 * Each seat has one leaf — the pilot's `oculusLeafLeft`, the navigator's
 * `oculusLeafRight` — and a hold step counts only the beats both are down.
 * Letting go while both were down slips the pair open again and starts the
 * count over. Three shuts bare the socket, which breaks open; after that the
 * script alternates a shot at the core with a hold that keeps the socket from
 * swallowing itself.
 *
 * **Its health is the three shots** the core takes. A hold that runs out is
 * tried again; a shot that runs out is a hull hit, which is the wave.
 */

/** The leaves round the lens — a figure of the silhouette, `SEAM_POINTS`' reason. */
export const OCULUS_LEAVES = 6;

/**
 * Where the scene is: settling, a step lit and waiting, the lens resting
 * between steps, and the lens shattered.
 */
export const OCULUS_PHASES = ["still", "lit", "rest", "shatter"] as const;
export type OculusPhase = (typeof OCULUS_PHASES)[number];

/**
 * What a step asks: a pair of leaves held shut, the socket breaking open (a
 * beat to look, no answer owed), a shot at the core, the socket held open
 * against its reseal — and the two story steps once it is open: the eye
 * **glaring** down at the hull, answered by the shield under it, and the eye
 * **looking** aside, answered by a shot up the column it looks down.
 */
export const OCULUS_ASKS = ["shut", "break", "fire", "reseal", "glare", "look"] as const;
export type OculusAsk = (typeof OCULUS_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface OculusStep {
  ask: OculusAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /**
   * Beats: how long both leaves must be held for a hold step, how long a fire
   * step waits for its shot, how long a break shows.
   */
  beats: number;
  /** Columns from the middle the eye looks down. Only a look step reads it. */
  offset?: number;
}

/** What a wave authors: the whole script, in order. */
export interface OculusEntry {
  kind: "oculus";
  steps: readonly OculusStep[];
}

export interface OculusState {
  kind: "oculus";
  /** Copied at install and never written again. */
  steps: OculusStep[];
  phase: OculusPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** `world.tick` the lit step lit: a shield pressed before it answers no glare. */
  litTick: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Leaves shut so far: nought up to `OCULUS_LEAVES`. */
  leavesShut: number;
  /** Shots the core has taken. */
  hits: number;
  /** Whether the socket stands open to be shot. */
  socketOpen: boolean;
  /** Whether each seat's leaf is held down: the pilot's, then the navigator's. */
  held: [boolean, boolean];
  /** Beats of the lit hold step both leaves have been down together. */
  heldBeats: number;
}

export function oculusBoss(world: World): OculusState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "oculus" ? boss : null;
}

/** The step lit, or null between steps. */
export function oculusLitStep(s: OculusState): OculusStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step is a hold: a pair shut, or the socket held open. */
export function oculusHolding(s: OculusState): boolean {
  const ask = oculusLitStep(s)?.ask;
  return ask === "shut" || ask === "reseal";
}

/** Whether both leaves are down this instant. */
export function oculusBothHeld(s: OculusState): boolean {
  return s.held[0] && s.held[1];
}

/** Whether the lit step is the glare, answered by the shield under the eye. */
export function oculusGlaring(s: OculusState): boolean {
  return oculusLitStep(s)?.ask === "glare";
}

/** The column a look step's eye looks down: the middle, moved by its offset. */
export function oculusLookCol(mid: number, step: OculusStep): number {
  return mid + (step.offset ?? 0);
}

/** The lens shattered: the fight is over and it is only falling. */
export function oculusDone(s: OculusState): boolean {
  return s.phase === "shatter";
}

/** A fresh lens: every leaf open, the socket shut, nothing held. */
export function freshOculus(beat: number, steps: readonly OculusStep[]): OculusState {
  return {
    kind: "oculus",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    litTick: 0,
    cursor: 0,
    leavesShut: 0,
    hits: 0,
    socketOpen: false,
    held: [false, false],
    heldBeats: 0,
  };
}
