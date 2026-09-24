import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GORGE: what not to do.
 *
 * **The question no other boss asks** — *whether the pair can stop shooting.*
 * Every wave in this game is answered with the cannon; this one makes that
 * habit the failure state. A wide sack hangs across the top of the field,
 * seven columns of it with a puckered **intake** under each, and every shot
 * that reaches the top of the field without meeting a body is swallowed by
 * the intake in its column and hangs inside as a **bead** — the pair's own
 * ammunition, inside the enemy (`docs/spec/bosses-choreographed.md` §3).
 *
 * **Health runs backwards.** The sack starts empty and the only way to hurt
 * it is to overfeed exactly one part of it: an intake fills only on beads of
 * one colour, a wrong colour takes a bead back out, and at `gorgeFullBeads`
 * it is **full** — pierceable by `gorgeVentShots` more shots, which
 * **rupture** it for good, but only for `gorgeVentBeats`, after which it **vents** a torch down
 * its own column and is empty again. So the sentence is *stop shooting,
 * except at one column, in one colour.*
 *
 * The fight has four movements, and the phase is read off the state rather
 * than kept (`gorgePhase`):
 *
 * - **feeding** — the rule above and nothing else.
 * - **spitting**, after `gorgeSpitRuptures` ruptures — every
 *   `gorgeSpitBeats` the sack returns a bead down its own column as a body of
 *   that colour, from the emptiest intake that holds one: what comes back is
 *   what the pair threw away.
 * - **gorged**, after `gorgeMouthRuptures` ruptures — the unruptured intake
 *   nearest the centre becomes the **mouth**: it fills itself a bead a spit,
 *   holds at full and never vents, and only the beam in its colour, standing
 *   in its column `gorgePryFills` times inside one pry, ends the fight.
 * - **out** — every bead it ever held leaves at once, and the boss stays
 *   `gorgeOutBeats` more so the wave cannot end on the same beat.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it falls
 * but what it vents and spits, and the arrivals under it are the wave's own.
 * The sack **sinking** a row per `gorgeSinkPer` beads it holds is a picture
 * and no rule — `gorgeSink` reads it off the beads for render — because a
 * sack that reached the hull would be a second way to lose a fight whose
 * whole point is that nothing falls unless the pair makes it.
 *
 * The clock is `gorge-step.ts`, the fingerprint `gorge-hash.ts`, the numbers
 * `config-gorge.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The movements, in the order render and the tests name them by. Derived,
 * not stored, so there is nothing here for `gorge-hash.ts` to number.
 */
export const GORGE_PHASES = ["feeding", "spitting", "gorged", "out"] as const;

export type GorgePhase = (typeof GORGE_PHASES)[number];

/** One intake: what it holds, in what colour, and whether it still can. */
export interface GorgeIntake {
  /** Beads inside, `0` to `gorgeFullBeads`. */
  beads: number;
  /** The colour it fills with; `null` while empty. */
  color: Color | null;
  /** `world.beat` it came full on, and the vent counts from; `-1` while not full. */
  fullBeat: number;
  /** Shots that have gone into it full, toward `gorgeVentShots`; `0` whenever it is not full. */
  pierced: number;
  /** Pierced, and hanging open for good: a shot up this column meets nothing. */
  ruptured: boolean;
}

/** Everything THE GORGE remembers between beats. */
export interface GorgeState {
  kind: "gorge";
  /** The leftmost column of the sack; intake `i` hangs over `col + i`. */
  col: number;
  intakes: GorgeIntake[];
  /** Intakes pierced so far: what moves the fight along. */
  ruptures: number;
  /** Beads swallowed over the whole fight, spat or not: what leaves at the end. */
  swallowed: number;
  /** `world.beat` it last spat on, or the mouth last fed itself on. */
  spitBeat: number;
  /** Index of the mouth in `intakes`; `-1` until the sack is gorged. */
  mouth: number;
  /** `world.beat` the beam ended it on; `-1` while it stands. */
  outBeat: number;
  /**
   * The intake under player 1's thumb, held from venting; `-1` while none is.
   * The pinch and the pry below, and why they are one seat's each: `gorge-hand.ts`.
   */
  pinch: number;
  /** The mouth under player 2's thumb, held open for the beam; `-1` while it is not. */
  pry: number;
  /** `world.beat` the pry was taken on, and the clench counts from; `-1` while it is not. */
  pryBeat: number;
  /** Beams in the mouth's colour inside this pry, toward `gorgePryFills`; `0` while it is not pried. */
  pryFills: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function gorgeBoss(world: World): GorgeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gorge" ? boss : null;
}

/** Which movement the sack is in, read off what has happened to it. */
export function gorgePhase(g: GorgeState, cfg: SimConfig): GorgePhase {
  if (g.outBeat >= 0) return "out";
  if (g.mouth >= 0) return "gorged";
  if (g.ruptures >= cfg.gorgeSpitRuptures) return "spitting";
  return "feeding";
}

/** The intake hanging over `col`, or `-1` where the sack does not reach. */
export function gorgeIntakeAt(g: GorgeState, col: number): number {
  const i = col - g.col;
  return i >= 0 && i < g.intakes.length ? i : -1;
}

/** Whether intake `i` is held from venting under player 1's thumb. */
export function gorgePinched(g: GorgeState, i: number): boolean {
  return g.pinch === i;
}

/** Whether the mouth is held open under player 2's thumb: the one state the beam ends. */
export function gorgePried(g: GorgeState): boolean {
  return g.mouth >= 0 && g.pry === g.mouth;
}

/** Whether an intake is full: transparent, pierceable, and about to vent. */
export function gorgeFull(k: GorgeIntake, cfg: SimConfig): boolean {
  return !k.ruptured && k.beads >= cfg.gorgeFullBeads;
}

/** Beads inside the sack now, every intake together. */
export function gorgeBeads(g: GorgeState): number {
  let n = 0;
  for (const k of g.intakes) n += k.beads;
  return n;
}

/** Rows the sack has sunk under what it holds. A picture, never a rule. */
export function gorgeSink(g: GorgeState, cfg: SimConfig): number {
  return Math.floor(gorgeBeads(g) / cfg.gorgeSinkPer);
}

/**
 * The intake nearest full that is not ruptured and not the mouth, and its
 * colour — what player 2 is shown. `-1` when there is none.
 */
export function gorgeNearestFull(g: GorgeState): number {
  let best = -1;
  for (let i = 0; i < g.intakes.length; i++) {
    const k = g.intakes[i];
    if (k === undefined || k.ruptured || i === g.mouth) continue;
    if (best < 0 || k.beads > (g.intakes[best]?.beads ?? 0)) best = i;
  }
  return best;
}
