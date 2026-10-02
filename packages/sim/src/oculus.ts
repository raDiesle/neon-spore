import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE OCULUS: a lens of six leaves over the middle column, shut two at a time
 * by both seats at once, and then a socket that has to be shot in the colour
 * it shows (`docs/spec/bosses-choreographed.md` §27).
 *
 * **The rule is one sentence**: shut a pair of leaves together, then shoot
 * the open socket in its colour.
 *
 * **Three levels since 2 October 2026**, the owner's rework: the first pair
 * is shut by both thumbs **held** down, the second by both **tapping**, the
 * third by both **turning** a lever each round the rim, THE MAZE's gesture —
 * and after each, one shot at the core, which waits for it. Each seat has one
 * leaf, the pilot's `oculusLeafLeft` and the navigator's `oculusLeafRight`,
 * and the same leaf is the lever on a turn.
 *
 * **What a level has done is kept.** A thumb lifted, a tap missing, a lever
 * let go: the count stands where it was and goes on from there (the owner:
 * *when player stops hold, it should keep current position of process, and
 * not start again*). The wave goes on round the lens — the pair fight what
 * falls and work the lens in the gaps — so there is **no slow**, and what
 * presses is a fuse: a level that runs out springs its leaves open, the count
 * back to nought, and is lit again. Never a hull hit.
 *
 * **Its health is the three shots** the core takes. The glare, the look and
 * the reseal still play if a script asks for them; the wave no longer does.
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
 * **looking** aside, answered by a shot up the column it looks down. Then the
 * two later levels' shuts: a pair **tapped** shut, and a pair **turned** shut.
 */
export const OCULUS_ASKS = [
  "shut",
  "break",
  "fire",
  "reseal",
  "glare",
  "look",
  "tap",
  "turn",
] as const;
export type OculusAsk = (typeof OCULUS_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface OculusStep {
  ask: OculusAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /**
   * Beats: how long both leaves must be held for a hold step; for every other
   * step how long it stays lit — a tap's or a turn's fuse, a fire step's wait
   * for its shot, a break's show. **Nought is no fuse**: the step waits.
   */
  beats: number;
  /** Columns from the middle the eye looks down. Only a look step reads it. */
  offset?: number;
  /** What a tap or a turn owes: taps from the pair, or eighths of a turn from each lever. */
  need?: number;
  /** A hold step's fuse in beats, in place of its beats and the grace. */
  fuse?: number;
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
  /** Ticks of the lit hold step both leaves have been down together — kept when a thumb lifts. */
  heldTicks: number;
  /** Each seat's taps on the lit tap step, the pilot's then the navigator's. */
  taps: [number, number];
  /** Each seat's lever: how far round it has come since it was taken, in thousandths of a tile, wrapped whole. */
  leverAt: [number, number];
  /** The furthest round each lever has come since it was taken: travel back is never counted twice. */
  leverBest: [number, number];
  /** Each lever's turn on the lit turn step made while both were held, in thousandths of a degree. */
  turned: [number, number];
}

export function oculusBoss(world: World): OculusState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "oculus" ? boss : null;
}

/** The step lit, or null between steps. */
export function oculusLitStep(s: OculusState): OculusStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether a step is a hold: a pair shut, or the socket held open. */
export function oculusIsHold(step: OculusStep): boolean {
  return step.ask === "shut" || step.ask === "reseal";
}

/** Whether a step asks both seats for their leaf: a hold, a tap or a turn. */
export function oculusIsPair(step: OculusStep): boolean {
  return oculusIsHold(step) || step.ask === "tap" || step.ask === "turn";
}

/** Whether the lit step is a hold: a pair shut, or the socket held open. */
export function oculusHolding(s: OculusState): boolean {
  const step = oculusLitStep(s);
  return step !== null && oculusIsHold(step);
}

/** Whether the lit step asks both seats for their leaf, by any of the three gestures. */
export function oculusPairing(s: OculusState): boolean {
  const step = oculusLitStep(s);
  return step !== null && oculusIsPair(step);
}

/** The taps a tap step owes from each seat: half the pair's, rounded up. */
export function oculusTapsEach(step: OculusStep): number {
  return Math.ceil((step.need ?? 0) / 2);
}

/** A turn step's turn owed from each lever, in thousandths of a degree. */
export function oculusTurnNeedMilli(step: OculusStep): number {
  return (step.need ?? 0) * 45000;
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

/**
 * Whether a seat's leaf is asked for: a hold lit and that seat's thumb not
 * down, a tap lit and that seat's taps still owed, a turn lit and that seat's
 * lever not taken.
 */
export function oculusLeafAsks(s: OculusState, seat: 1 | 2): boolean {
  const step = oculusLitStep(s);
  if (step === null || !oculusIsPair(step)) return false;
  if (step.ask === "tap") return (s.taps[seat - 1] ?? 0) < oculusTapsEach(step);
  return !s.held[seat - 1];
}

/** Whether the core is asked for a shot: a fire step lit, the socket open. */
export function oculusCoreAsks(s: OculusState): boolean {
  return s.socketOpen && oculusLitStep(s)?.ask === "fire";
}

/** Whether the hull is asked: the shield under the eye for the glare, the cannon up the look's column. */
export function oculusHullAsks(s: OculusState): boolean {
  const ask = oculusLitStep(s)?.ask;
  return ask === "glare" || (ask === "look" && s.socketOpen);
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
    heldTicks: 0,
    taps: [0, 0],
    leverAt: [0, 0],
    leverBest: [0, 0],
    turned: [0, 0],
  };
}
