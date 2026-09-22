import { bearingApart, NO_BEARING, TURN } from "./bearing.js";
import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE GIMBAL: a sealed drum hung inside two nested rings set at right angles,
 * and **the one boss whose question is whether the same turn means the same
 * thing to both of you** (`docs/spec/bosses-choreographed.md` §18).
 *
 * Every split boss before it divides what the two of you can *see*. This one
 * keeps the sight nearly shared and divides the **geometry**: the outer ring
 * is the pilot's and the inner is the navigator's, they are one wheel gripped
 * from its two opposite faces, and a turn that reads clockwise on his screen
 * is drawn counter-clockwise on hers because that is honestly which way it is
 * going, seen from there. Neither screen ever says so, and *turn it
 * clockwise* called across a phone connection is the sentence this boss
 * exists to make the pair get wrong once.
 *
 * **The rule is one sentence**: each of you turns your own ring to your own
 * mark and holds it there, and when both sit true together a latch-tooth
 * shears off each ring.
 *
 * **Its health is six latch-teeth**, three to a ring, and they shear in
 * pairs — one from each ring, only ever together, because an alignment is
 * both rings or it is nothing. So the count is `gimbalTeeth`, read off the
 * cursor, rather than two numbers on the state that could never honestly
 * disagree. No bar: the rim is the health and every gap in it is drawn.
 *
 * **A ring nobody is holding falls back to rest**, `gimbalDriftMilli` a beat
 * (`bearingToward`). That is the whole of what a missed window costs on this
 * boss — the design's *it drifts back to rest*, rows 2 and 3 — and it is the
 * one thing that makes letting go to talk expensive.
 *
 * **One hazard, once.** With two tooth pairs gone the drum swings loose in
 * its cradle and a spark leaks from the seam; either seat shoots it in either
 * colour inside `gimbalSeamBeats`, or it reaches the hull, which is the wave
 * (`gimbal-shot.ts`, row 9).
 *
 * The alignments themselves are a wave's (`packages/content/src/gimbal-script.ts`),
 * read by index with the cursor in the hash, the way THE INSTAR's steps and
 * THE FILAMENT's filaments are.
 */

/** The outer ring, the pilot's — always, and the geometry is what says so. */
export const OUTER = 0;
/** The inner ring, the navigator's, gripped from the other face. */
export const INNER = 1;
export type GimbalRing = typeof OUTER | typeof INNER;
/** Both, in the order everything on this boss keeps them in. */
export const GIMBAL_RINGS: readonly GimbalRing[] = [OUTER, INNER];

/** The seam shut, and the column value that says so. */
export const NO_SEAM = -1;

/**
 * One alignment the pair has to find: where each ring's mark sits on the true
 * wheel, and how far the marks creep each beat.
 *
 * `creepMilli` is a distance rather than a pair of them, and the outer mark
 * takes it forward while the inner takes it back: the two marks chase in
 * opposite **true** senses, which is what makes the second movement hard —
 * on her own face hers looks like it is running from her turn, and on his it
 * does not (§18, rows 6 and 7). Nought is a mark that sits still.
 */
export interface GimbalMark {
  /** The outer ring's mark, in thousandths of a turn on the true wheel. */
  outerMilli: number;
  /** The inner ring's mark, true — not as her face shows it. */
  innerMilli: number;
  /** How far both marks creep a beat, in thousandths. Nought is still. */
  creepMilli: number;
}

/** What a wave authors: the alignments, in order, and nothing else. */
export interface GimbalEntry {
  kind: "gimbal";
  marks: readonly GimbalMark[];
}

/**
 * Where the scene is: the drum dark and still between two dead rings, the
 * marks up and the rings being turned, a tooth pair shearing, or the hatch
 * swung open.
 */
export const GIMBAL_PHASES = ["still", "turn", "shear", "open"] as const;
export type GimbalPhase = (typeof GIMBAL_PHASES)[number];

export interface GimbalState {
  kind: "gimbal";
  /** The alignments, copied at install and never written to again. */
  marks: GimbalMark[];
  /** Which alignment is up; `marks.length` once the last has sheared. */
  cursor: number;
  phase: GimbalPhase;
  /** `world.beat` the phase began — and, while the marks are up, the beat
   * they lit, which is what the creep is counted from. */
  phaseBeat: number;
  /** Each ring's bearing on the **true** wheel: outer, then inner. Neither
   * screen is shown this number; each is shown its own face's (`gimbalShownMilli`). */
  atMilli: [number, number];
  /** Where each hand last reported, in its own face's frame, `NO_BEARING`
   * while it is off — the reference a step is measured from (`bearing.ts`). */
  handMilli: [number, number];
  /** Beats both rings have sat true together; nought the moment either slips. */
  heldBeats: number;
  /** The column the seam leaks in, `NO_SEAM` while it is shut. */
  seamCol: number;
  /** `world.beat` the seam opened. */
  seamBeat: number;
}

export function gimbalBoss(world: World): GimbalState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gimbal" ? boss : null;
}

/** Whether the hands count: the marks are up and nothing is shearing. */
export function gimbalTurning(s: GimbalState): boolean {
  return s.phase === "turn";
}

/**
 * How many latch-teeth are left on **each** ring — the one health this boss
 * has. Read off the cursor rather than counted beside it: they only ever
 * shear in pairs, so two fields would be one fact written twice and the
 * first thing to drift.
 */
export function gimbalTeeth(s: GimbalState): number {
  return Math.max(0, s.marks.length - s.cursor);
}

/**
 * **`MirroredBearing`**: what a ring looks like on the face that grips it.
 *
 * `PerSeatTruth` spent on a turn instead of on a body. The outer ring faces
 * the pilot and is drawn as it is; the inner faces the navigator from the
 * other side, so every bearing on it is reflected — her nought is the
 * wheel's nought and her clockwise is the wheel's counter-clockwise. One
 * function, called by the hand going in and by the picture coming out, so
 * the two can never disagree about which way round her ring is.
 */
export function gimbalShownMilli(trueMilli: number, ring: GimbalRing): number {
  return ring === OUTER ? trueMilli : (TURN - (trueMilli % TURN)) % TURN;
}

/**
 * Where a ring's mark sits on the true wheel this beat, or `NO_BEARING` once
 * every alignment is spent.
 *
 * The creep is counted from `phaseBeat` rather than banked in a field of its
 * own: the marks lit on that beat and have crept a fixed amount a beat since,
 * so the position is a product of two integers and two devices on the same
 * beat cannot come out with different marks.
 */
export function gimbalMarkMilli(s: GimbalState, beat: number, ring: GimbalRing): number {
  const mark = s.marks[s.cursor];
  if (mark === undefined) return NO_BEARING;
  const crept = Math.max(0, beat - s.phaseBeat) * mark.creepMilli;
  const at = ring === OUTER ? mark.outerMilli + crept : mark.innerMilli - crept;
  return ((at % TURN) + TURN) % TURN;
}

/** Whether one ring sits on its own mark, within the tolerance a thumb has. */
export function gimbalRingTrue(
  s: GimbalState,
  cfg: SimConfig,
  beat: number,
  ring: GimbalRing,
): boolean {
  const mark = gimbalMarkMilli(s, beat, ring);
  if (mark === NO_BEARING) return false;
  return bearingApart(s.atMilli[ring], mark) <= cfg.gimbalTrueMilli;
}

/** Whether both rings sit true at once, which is the only thing that shears. */
export function gimbalAligned(s: GimbalState, cfg: SimConfig, beat: number): boolean {
  return (
    gimbalTurning(s) && gimbalRingTrue(s, cfg, beat, OUTER) && gimbalRingTrue(s, cfg, beat, INNER)
  );
}

/** Whether the seam is leaking and there is something to shoot at. */
export function gimbalLeaking(s: GimbalState): boolean {
  return s.seamCol !== NO_SEAM;
}

/** The rings spinning loose with the drum split open, and nothing left to grip. */
export function gimbalOpen(s: GimbalState): boolean {
  return s.phase === "open";
}
