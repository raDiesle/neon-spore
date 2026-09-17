import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE ORRERY: whether you can agree on **when**.
 *
 * A core held inside three concentric rings of orbiting organs, each ring
 * with exactly one gap in it. A shot up the core's column reaches the core
 * only on a beat every unbroken ring's gap stands at the bottom of its own
 * orbit — and **the outer ring is drawn true on both screens, the middle on
 * player 1's alone and the inner on player 2's alone**, so neither seat can
 * work out that beat by itself. The prediction is the fight
 * (`docs/spec/bosses-choreographed.md` §2).
 *
 * **It asks which beat, and the Queen already asks which column.** That is
 * the page's own sentence about this concept, and it decides the geometry
 * rather than decorating it: the rings are concentric about the core, so a
 * shot that passes all three gaps arrives at the middle of the field and
 * nowhere else. The column is therefore never in question — it is
 * `orreryCoreCol`, and the cannon sits in it for the whole fight — and the
 * one thing the pair cannot compute apart is the moment. The design's own
 * beat list has player 2 calling *which column the gap will stand over*; that
 * would be a second Queen, and it is dropped here by name.
 *
 * **A gap's place is a function of the beat**, never a stored slot stepped
 * once a beat — THE THROAT's rule, which this boss needs for the reason that
 * rule was written down: `orreryNextOpen` answers a question about a beat
 * that has not happened, and a stepper cannot. Each ring carries where its
 * gap stood at `anchorBeat` and the arithmetic does the rest.
 *
 * **Health is the rings, and they go outermost first.** Every landed shot
 * takes the outermost one still standing, so the arithmetic gets *easier* as
 * the fight goes on — three gaps, then two, then one — while the blindness
 * gets worse: the last gap left is the inner one, which player 1 cannot see
 * at all, and he fires on her word alone. The core underneath takes nothing
 * but the lance (`orrery-shot.ts`).
 *
 * The clock, the core's own fire and the organs that come off a broken ring
 * are `orrery-step.ts`; what a shot does is `orrery-shot.ts`; the
 * fingerprint is `orrery-hash.ts`; the numbers are `config-orrery.ts`. This
 * file is the shape and the arithmetic every one of them calls.
 */

/** Rings, outermost first. Three, and the index is a wire value (`orrery-hash.ts`). */
export const ORRERY_RINGS = 3;

/**
 * The phases, in the order `orrery-hash.ts` numbers them by, and they only
 * ever advance.
 *
 * - `rings` — three orbits turning and nothing coming down. The pair is
 *   learning what each of them can see.
 * - `spitting` — a ring is off, and the core fires a rock down its own column
 *   every `orrerySpitBeats`. The column it fires down is the one the cannon
 *   has to stand in.
 * - `naked` — every ring broken. Only the lance reaches the core.
 * - `out` — the lance stood in it. The boss is beaten and going out.
 */
export const ORRERY_PHASES = ["rings", "spitting", "naked", "out"] as const;

export type OrreryPhase = (typeof ORRERY_PHASES)[number];

/** Everything THE ORRERY remembers between beats. */
export interface OrreryState {
  kind: "orrery";
  phase: OrreryPhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** Rings broken, outermost first: ring `i` is gone when `i < broken`. */
  broken: number;
  /**
   * Where each ring's gap stood on `anchorBeat`, as a slot of its own orbit —
   * 0 is the bottom of the ring, over the core's column.
   *
   * An anchor rather than a position: nothing steps these, and a hand on a
   * ring will write one of them and leave the rest alone (the lane after this
   * one).
   */
  from: number[];
  /** The beat `from` is read against. */
  anchorBeat: number;
  /**
   * The colour the core is showing, which is the colour a shot has to carry
   * to pass the shaft. It changes every time a ring comes off, so a pair that
   * learned it once has to read it again.
   */
  color: Color;
  /** `world.beat` a ring last broke on, or -1. The picture's, and the fight's clock. */
  brokeBeat: number;
  /** `world.beat` the core last spat a rock on, or -1. */
  spatBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function orreryBoss(world: World): OrreryState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "orrery" ? boss : null;
}

/**
 * **The one column this fight happens in**: the middle, where the core hangs.
 *
 * The design gives the core two columns. One, because the lance has to stand
 * somewhere and a body two columns wide would leave the pair a coin toss at
 * the end of a fight whose whole subject is agreeing — and because a shaft
 * through three rings is a straight line to the middle of a ring, which is
 * one place.
 */
export function orreryCoreCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/** Beats a ring takes to come round: one organ a beat, so it is the organ count. */
export function orreryOrbit(cfg: SimConfig, ring: number): number {
  if (ring <= 0) return cfg.orreryOuterOrgans;
  return ring === 1 ? cfg.orreryMiddleOrgans : cfg.orreryInnerOrgans;
}

/**
 * Which way a ring turns: the outer clockwise, the middle anticlockwise, the
 * inner clockwise, as the design has it.
 *
 * It does not change *which* beats a ring is open on — a gap comes back to
 * the bottom every orbit either way round — and that is the point of having
 * it here rather than in the picture: the direction is what the pair says out
 * loud ("mine is three organs out, coming back"), and both screens have to
 * draw the same sentence.
 */
export function orreryDir(ring: number): 1 | -1 {
  return ring === 1 ? -1 : 1;
}

/** Whether that ring is off the boss already. */
export function orreryRingBroken(b: OrreryState, ring: number): boolean {
  return ring < b.broken;
}

/**
 * Where a ring's gap stands on a beat, as a slot of its orbit: 0 is the
 * bottom of the ring, which is the only slot a shot can pass through.
 *
 * The slots above the bottom are the organs to one side and then the other —
 * a gap at slot `orbit / 2` is at the top of the ring, where a shot from the
 * hull can never reach it, and the picture's job is to make that obvious.
 */
export function orreryGapSlot(cfg: SimConfig, b: OrreryState, ring: number, beat: number): number {
  const orbit = orreryOrbit(cfg, ring);
  if (orbit <= 0) return 0;
  const step = b.from[ring] ?? 0;
  const at = (step + orreryDir(ring) * (beat - b.anchorBeat)) % orbit;
  return at < 0 ? at + orbit : at;
}

/** Whether that ring's gap is at the bottom of its orbit on that beat. */
export function orreryRingOpen(
  cfg: SimConfig,
  b: OrreryState,
  ring: number,
  beat: number,
): boolean {
  return orreryGapSlot(cfg, b, ring, beat) === 0;
}

/**
 * **The shaft**: whether a shot leaving the top of the core's column on this
 * beat reaches the core.
 *
 * True once every ring is broken, which is not a special case but the same
 * sentence — there is nothing left in the way. What stops a shot then is the
 * core's own armour, and that is `orrery-shot.ts`'s to say.
 */
export function orreryShaftOpen(cfg: SimConfig, b: OrreryState, beat: number): boolean {
  for (let ring = b.broken; ring < ORRERY_RINGS; ring++) {
    if (!orreryRingOpen(cfg, b, ring, beat)) return false;
  }
  return true;
}

/**
 * Beats from `beat` to the next one the shaft is open on, `0` if it is open
 * now, and `-1` if it is not inside `cap`.
 *
 * **Searched rather than solved**, and deliberately: the closed form is the
 * Chinese remainder theorem over three moduli that need not be coprime, which
 * is a page of arithmetic with a case in it for every pair of rings that
 * share a factor — and the first hand laid on a ring would invalidate the
 * lot. A loop over at most `cap` beats asking the question this file already
 * answers cannot be wrong in a way the rest of the fight is not also wrong.
 *
 * This is the one thing player 2's readout is made of, and it is why a gap is
 * a function of the beat rather than a slot stepped once a beat: nothing can
 * be stepped forward twenty-four beats to see where it gets to and then
 * stepped back.
 */
export function orreryNextOpen(cfg: SimConfig, b: OrreryState, beat: number, cap: number): number {
  for (let ahead = 0; ahead <= cap; ahead++) {
    if (orreryShaftOpen(cfg, b, beat + ahead)) return ahead;
  }
  return -1;
}

/**
 * The anchors a ring gets so that every ring's gap is at the bottom of its
 * orbit on `first`, counted from the beat the boss was installed.
 *
 * The only way the fight is guaranteed to have a first window at all: three
 * residues picked apart need not ever come together, and with orbits that
 * share factors they usually do not.
 */
export function orreryAnchors(cfg: SimConfig, first: number): number[] {
  const out: number[] = [];
  for (let ring = 0; ring < ORRERY_RINGS; ring++) {
    const orbit = orreryOrbit(cfg, ring);
    const at = (-orreryDir(ring) * first) % orbit;
    out.push(at < 0 ? at + orbit : at);
  }
  return out;
}
