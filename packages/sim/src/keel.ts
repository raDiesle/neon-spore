import type { SimConfig } from "./config.js";
import { geometrySeat } from "./geometry-seat.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE KEEL: a six-segment spine arched along the top of the field, and the
 * boss that asks **whose thumb the next step wants when nobody authored it**
 * (`docs/spec/bosses-choreographed.md` §24).
 *
 * Every other boss with more than one gesture gives each step a seat once, in
 * its script. Here there is one tap target, `keelJoint`, and it walks: the
 * seat that may press it is the one whose half of the screen the joint sits
 * over when it lights (`geometrySeat`). Both screens draw the same spine. It
 * is not THE BATON's `Alternation` — nothing refuses a repeat, and two joints
 * in a row on one half are one thumb twice.
 *
 * **Its health is the six segments.** A joint answered in its window locks
 * its segment rigid; a spine with every segment locked is ready for the
 * cannon's two steps and then snaps straight.
 *
 * **Three movements.** The first lights the ends inward, alternating — the
 * leftmost loose segment, then the rightmost, then the leftmost again — until
 * two are left. The second splits the midpoint: a socket flashes the wave's
 * colour and that cannon fires it, which locks the left-middle segment for
 * free, then the right-middle joint lights on a shorter window. The third dims
 * every joint and re-lights the wave's own three at tempo, and a miss there
 * loosens that segment again until it is answered. Then the spine holds one
 * beat, the tail throws a rock the cannon must shoot, and the fight ends.
 *
 * **The story between** (§24 rows 9, 10 and 15, `keel-story.ts`): with the
 * spine first rigid, at the end of the second movement, it bows the wrong way
 * — the flip, arrested by both thumbs holding its two end joints down at once;
 * then a marrow seam lights down its middle, sealed by both colours up the
 * middle column; and after the rock the locked segments bank one by one while
 * both hands stay off.
 */

export const KEEL_PHASES = [
  "still",
  "joint",
  "rest",
  "split",
  "socket",
  "flip",
  "marrow",
  "rigid",
  "rock",
  "cool",
  "straight",
] as const;
export type KeelPhase = (typeof KEEL_PHASES)[number];

/** No joint lit anywhere on the spine. */
export const NO_JOINT = -1;
/** No rock in the air. */
export const NO_ROCK = -1;

/** What a wave authors: the socket's colour and the tempo run's order. */
export interface KeelEntry {
  kind: "keel";
  /** The colour the midpoint's socket flashes: the cannon of this colour
   * fires it (movement 2). */
  socket: Color;
  /** The segments the third movement re-lights, in order, by index from the
   * left — never a seat: the seat is wherever the segment sits. */
  reprise: readonly number[];
}

export interface KeelState {
  kind: "keel";
  /** Copied at install and never written to again (`keel-hash.ts`). */
  socket: Color;
  /** Copied at install and never written to again. */
  reprise: number[];
  phase: KeelPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** 1, 2 or 3: which part of the beat list the spine is in. */
  movement: 1 | 2 | 3;
  /** The segment the joint sits at, `NO_JOINT` while none is lit. */
  joint: number;
  /** One per segment, left to right: locked rigid, or loose. */
  locked: boolean[];
  /** How far through `reprise` the third movement is. */
  repriseCursor: number;
  /** The column the tail's rock falls in, `NO_ROCK` while none is thrown. */
  rockCol: number;
  /** `world.beat` the rock was thrown. */
  rockBeat: number;
  /** Whether each seat's thumb is down on its end joint, P1's then P2's —
   * kept in every phase, so a chord already down counts when the flip comes. */
  held: [boolean, boolean];
  /** Beats in a row the flip has had both end joints held. */
  chordBeats: number;
  /** Which colours have hit the marrow line, red's then cyan's. */
  marrow: [boolean, boolean];
  /** Beats reflex taps have added to the cooldown. */
  flares: number;
}

export function keelBoss(world: World): KeelState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "keel" ? boss : null;
}

/** Segments still loose — the one health this boss has. */
export function keelLoose(s: KeelState): number {
  return s.locked.filter((l) => !l).length;
}

/**
 * The column segment `seg` of `segments` sits over: the spine spans the field
 * edge to edge, each segment an equal share, so on eleven columns six
 * segments sit over 0, 2, 4, 6, 8 and 10 and the middle column is between two.
 */
export function keelSegCol(seg: number, segments: number, cols: number): number {
  return Math.floor(((2 * seg + 1) * cols) / (2 * segments));
}

/** Where the lit joint is, as a column, or `NO_JOINT`. */
export function keelJointCol(s: KeelState, cols: number): number {
  return s.joint === NO_JOINT ? NO_JOINT : keelSegCol(s.joint, s.locked.length, cols);
}

/** The seat the lit joint accepts, or `null` when none is lit — or when it
 * sits over the middle column and either thumb may take it. */
export function keelSeat(s: KeelState, cols: number): 1 | 2 | null {
  if (s.joint === NO_JOINT) return null;
  return geometrySeat(keelJointCol(s, cols), cols);
}

/** Whether a joint is lit and waiting for its tap. */
export function keelLit(s: KeelState): boolean {
  return s.phase === "joint" && s.joint !== NO_JOINT;
}

/** Whether the tail's rock is in the air and there is something to shoot. */
export function keelThrown(s: KeelState): boolean {
  return s.rockCol !== NO_ROCK;
}

/**
 * The lit joint's window, by movement: long, shorter, at tempo. The clock
 * judges a miss by it (`keel-step.ts`) and the picture closes the joint's ring
 * over it (`render/keel-draw.ts`), one number.
 */
export function keelWindowBeats(cfg: SimConfig, s: KeelState): number {
  if (s.movement === 1) return cfg.keelJointBeats;
  if (s.movement === 2) return cfg.keelLastJointBeats;
  return cfg.keelTempoBeats;
}

/** The arch bowed the wrong way, waiting for the chord on its two ends. */
export function keelFlipping(s: KeelState): boolean {
  return s.phase === "flip";
}

/** The marrow seam lit down the spine's middle, waiting for both colours. */
export function keelMarrowLit(s: KeelState): boolean {
  return s.phase === "marrow";
}

/** The locked segments banking after the rock, hands off. */
export function keelCooling(s: KeelState): boolean {
  return s.phase === "cool";
}

/** The end joint a seat holds in the flip: P1 the leftmost, P2 the rightmost. */
export function keelEndSeg(s: KeelState, seat: 1 | 2): number {
  return seat === 1 ? 0 : s.locked.length - 1;
}

/** The spine snapped straight: the fight is over and it is only hanging. */
export function keelDone(s: KeelState): boolean {
  return s.phase === "straight";
}

/**
 * The segment the next joint lights at, or `NO_JOINT` when the movement has
 * nothing left to light.
 *
 * The first two movements alternate ends by how many are locked: even, the
 * leftmost loose; odd, the rightmost. A miss locks nothing, so the count is
 * unchanged and the joint re-lights where it was — the design's *same place*
 * without a field to remember it. The third reads the wave's order, then any
 * segment a miss loosened, leftmost first.
 */
export function keelNextJoint(s: KeelState): number {
  if (s.movement === 3 && s.repriseCursor < s.reprise.length) {
    return s.reprise[s.repriseCursor] ?? NO_JOINT;
  }
  const loose = s.locked.flatMap((l, i) => (l ? [] : [i]));
  if (loose.length === 0) return NO_JOINT;
  if (s.movement === 3) return loose[0] ?? NO_JOINT;
  const even = (s.locked.length - loose.length) % 2 === 0;
  return (even ? loose[0] : loose[loose.length - 1]) ?? NO_JOINT;
}
