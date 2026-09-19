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
 * gap stood at `anchorBeat` and the arithmetic does the rest, next door
 * (`orrery-beat.ts`).
 *
 * **Health is the rings, and they go outermost first.** Every landed shot
 * takes the outermost one still standing, so the arithmetic gets *easier* as
 * the fight goes on — three gaps, then two, then one — while the blindness
 * gets worse: the last gap left is the inner one, which player 1 cannot see
 * at all, and he fires on her word alone. The core underneath takes nothing
 * but the lance (`orrery-shot.ts`).
 *
 * **A shot does not take a ring off. It cracks it, and the crack is a second
 * gesture.** The hit jams the ring with its gap short of the bottom, and the
 * pilot has to wind it home with his thumb before it comes away — so the
 * fight is two things said in order, *shoot it* and *turn it home*, and it
 * says them three times with the pilot seeing less of the ring each round.
 * That is the `seized` phase below, and it is the only one that recurs.
 *
 * The arithmetic over the beat — where a gap stands on a beat that has not
 * happened, and which of those beats a shot gets through — is
 * `orrery-beat.ts`; where a gap is on the *field* is `orrery-gap.ts`; the
 * clock, the core's own fire and the organs that come off a broken ring are
 * `orrery-step.ts`; what a shot does is `orrery-shot.ts`; the pilot's hand on
 * a ring is `orrery-hand.ts`; the fingerprint is `orrery-hash.ts`; the
 * numbers are `config-orrery.ts`. This file is the shape every one of them
 * is written against.
 */

/** Rings, outermost first. Three, and the index is a wire value (`orrery-hash.ts`). */
export const ORRERY_RINGS = 3;

/**
 * The phases, in the order `orrery-hash.ts` numbers them by.
 *
 * **`seized` is the one that comes round again**, three times over, and the
 * rest still only ever advance. A shot does not take a ring off: it cracks
 * it, and the ring has to be turned home by hand before it comes off
 * (`orrery-shot.ts`, `orrery-hand.ts`). So the fight reads *shoot it, then
 * turn it home*, three times, and the seat that turns it is blinder each
 * time.
 *
 * - `rings` — three orbits turning and nothing coming down. The pair is
 *   learning what each of them can see.
 * - `seized` — the outermost ring still standing has been hit. Its gap is
 *   knocked `orreryCrackOrgans` short of the bottom and it **stops drifting**,
 *   so the shaft is shut and no shot counts until the pilot's thumb has wound
 *   it back to the bottom. The gesture, not the beat.
 * - `spitting` — a ring is off, and the core fires a rock down its own column
 *   every `orrerySpitBeats`. The column it fires down is the one the cannon
 *   has to stand in.
 * - `naked` — every ring broken. Only the lance reaches the core.
 * - `out` — the lance stood in it. The boss is beaten and going out.
 */
export const ORRERY_PHASES = ["rings", "seized", "spitting", "naked", "out"] as const;

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
   * An anchor rather than a position: nothing steps these, and **the pilot's
   * hand writes one of them and leaves the rest alone** — which is the whole
   * reason a gap is arithmetic rather than a stored slot, because a hand is
   * the one thing that can move a gap off a beat the pair has already agreed
   * on (`orrery-hand.ts`).
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
  /**
   * Where the pilot's thumb is on the ring it has hold of, in thousandths of
   * a turn, or `NO_BEARING` for no hand on it — a **bearing**, exactly as THE
   * CLAW's crank reports one, and for the crank's own reason
   * (`orrery-hand.ts`).
   */
  handAtMilli: number;
  /**
   * Thumb travel banked against the ring's next detent, in thousandths of a
   * turn, signed the way the gap's slot numbers run.
   *
   * The ring turns in whole organs and nothing else, so what a turn shorter
   * than a detent buys is kept here until it is paid. Nothing moves it but a
   * hand: this is not a flywheel (`orrery-hand.ts`).
   */
  windMilli: number;
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
 * **Whether that ring is the cracked one**, which is the outermost still
 * standing and only while the boss is in `seized`.
 *
 * One ring at a time and never two: a shot only ever reaches the outermost
 * one standing, and while it is cracked the shaft is shut, so nothing can
 * crack a second. The pair therefore never has two things to turn home, which
 * is the whole of why this phase is worth having — one hit, one gesture, in
 * that order.
 */
export function orrerySeized(b: OrreryState, ring: number): boolean {
  return b.phase === "seized" && ring === b.broken;
}
