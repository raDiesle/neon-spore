import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CAPSTAN: a squat drum over the middle column on a cradle that rocks
 * one face or the other toward the pair, a grated band on each face, and a
 * core under its cap that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §37).
 *
 * **The rule is one sentence**: one of you leans the phone to turn a band
 * toward the other, who rubs it bright; then shoot the bared core.
 *
 * Two readings already built, paired. The lean is THE PLUMB's `LevelTilt`
 * (`plumb-hand.ts`): `capstanLean`, thousandths of a degree off level, and a
 * lean past `capstanLeanMilli` rocks the cradle to bare that side's face. The
 * rub is THE RIME's `RubCount` (`rime-hand.ts`): `capstanRub`, the reversals
 * a wiping thumb has made. **Only the bared face takes them** — the hidden
 * face's wear holds exactly where it was, spending nothing and losing
 * nothing, until the cradle rocks back to it: a pause, never a reset.
 *
 * **The seat steering is never the seat rubbing.** A left step is the pilot's
 * lean and the navigator's thumb, a right step the other way round, §37's
 * swap by movement; and a band cracks bright only while its own mark is lit,
 * so a wrong face rubbed is kept one reversal short of cracking, for later.
 * Both bright bare the core. After that a **hold** step has the rust creeping
 * back: either seat leans, the other keeps rubbing, and beats with both
 * happening keep the core bare; a hold not made covers it, and it is asked
 * again until it is.
 *
 * **Its health is the two bands and the three shots.** A band window that
 * runs out is tried again, its wear kept; a shot that runs out is a hull hit,
 * which is the wave.
 */

/**
 * A seat's lean before its phone has said anything, or after it stopped:
 * level, which rocks nothing. THE PLUMB's unread is the far end instead,
 * because there a lean is judged by being *near* level.
 */
export const CAPSTAN_UNREAD = 0;

/**
 * Where the scene is: rusted and settling in, a step lit and waiting, the
 * drum resting between steps, and the cap swung open, spent.
 */
export const CAPSTAN_PHASES = ["rusted", "lit", "rest", "open"] as const;
export type CapstanPhase = (typeof CAPSTAN_PHASES)[number];

/**
 * What a step asks: the left band rubbed bright under the pilot's lean, the
 * right under the navigator's, a shot at the core, or a hold against the
 * rust creeping back over it.
 */
export const CAPSTAN_ASKS = ["left", "right", "fire", "hold"] as const;
export type CapstanAsk = (typeof CAPSTAN_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface CapstanStep {
  ask: CapstanAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step is lit: the pair's window, or how long a fire step waits for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface CapstanEntry {
  kind: "capstan";
  steps: readonly CapstanStep[];
}

export interface CapstanState {
  kind: "capstan";
  /** Copied at install and never written again. */
  steps: CapstanStep[];
  phase: CapstanPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Reversals worn into each band, the left then the right, up to `capstanWearThreshold`. */
  wear: [number, number];
  /** Shots the core has taken. */
  hits: number;
  /** Whether the core lies bare to be shot. */
  bared: boolean;
  /** Each seat's lean this instant, the pilot then the navigator, thousandths of a degree. */
  tiltMilli: [number, number];
  /** The reversal count last heard from each seat's thumb, so only fresh ones wear; nought with none down. */
  rubs: [number, number];
  /** Whether a fresh reversal landed on a bared face since the last beat: what a hold beat counts. */
  rubbed: boolean;
  /** Beats of the lit hold step kept so far — a beat missed is not counted, and not a reset. */
  heldBeats: number;
}

export function capstanBoss(world: World): CapstanState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "capstan" ? boss : null;
}

/** The step lit, or null between steps. */
export function capstanLitStep(s: CapstanState): CapstanStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The band the lit step is about, nought for the left and one for the right; null otherwise. */
export function capstanBand(s: CapstanState): 0 | 1 | null {
  const ask = capstanLitStep(s)?.ask;
  return ask === "left" ? 0 : ask === "right" ? 1 : null;
}

/** A seat's place in the per-seat pairs: nought for the pilot, one for the navigator. */
export function capstanSeatIndex(seat: 1 | 2): 0 | 1 {
  return seat === 1 ? 0 : 1;
}

/** The face a lean rocks the cradle to: nought left, one right, null inside `leanMilli` of level. */
export function capstanLeanFace(tiltMilli: number, leanMilli: number): 0 | 1 | null {
  if (tiltMilli <= -leanMilli) return 0;
  if (tiltMilli >= leanMilli) return 1;
  return null;
}

/**
 * The seat steering the cradle for the lit step: the pilot on the left band,
 * the navigator on the right; on a hold, whichever seat leans past the mark,
 * the pilot first. Null on a shot, between steps, or on a hold nobody leans.
 */
export function capstanSteerer(world: Pick<World, "cfg">, s: CapstanState): 1 | 2 | null {
  const ask = capstanLitStep(s)?.ask;
  if (ask === "left") return 1;
  if (ask === "right") return 2;
  if (ask !== "hold") return null;
  const lean = world.cfg.capstanLeanMilli;
  for (const seat of [1, 2] as const) {
    if (capstanLeanFace(s.tiltMilli[capstanSeatIndex(seat)], lean) !== null) return seat;
  }
  return null;
}

/** The seat whose thumb the lit step wears with: never the one steering. */
export function capstanWearer(world: Pick<World, "cfg">, s: CapstanState): 1 | 2 | null {
  const steer = capstanSteerer(world, s);
  return steer === null ? null : steer === 1 ? 2 : 1;
}

/** The face the cradle bares this instant, by the steering seat's lean; null when centred. */
export function capstanFace(world: Pick<World, "cfg">, s: CapstanState): 0 | 1 | null {
  const steer = capstanSteerer(world, s);
  if (steer === null) return null;
  return capstanLeanFace(s.tiltMilli[capstanSeatIndex(steer)], world.cfg.capstanLeanMilli);
}

/** Whether a band is worn bright for good. */
export function capstanBright(world: World, s: CapstanState, side: 0 | 1): boolean {
  return s.wear[side] >= world.cfg.capstanWearThreshold;
}

/** The cap swung open: the fight is over and the drum is only standing spent. */
export function capstanDone(s: CapstanState): boolean {
  return s.phase === "open";
}

/** A fresh drum: rusted, the cradle centred, both bands dull, the core covered. */
export function freshCapstan(beat: number, steps: readonly CapstanStep[]): CapstanState {
  return {
    kind: "capstan",
    steps: steps.map((step) => ({ ...step })),
    phase: "rusted",
    phaseBeat: beat,
    cursor: 0,
    wear: [0, 0],
    hits: 0,
    bared: false,
    tiltMilli: [CAPSTAN_UNREAD, CAPSTAN_UNREAD],
    rubs: [0, 0],
    rubbed: false,
    heldBeats: 0,
  };
}
