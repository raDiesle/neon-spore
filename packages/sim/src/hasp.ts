import { NO_BEARING } from "./bearing.js";
import type { SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE HASP: three sealed clasps down the middle of the field, each a lobed
 * cover over a wheel-hub, and **the one boss whose question is whether a
 * grip nobody can see is the one holding the door**
 * (`docs/spec/bosses-choreographed.md` §20).
 *
 * The pilot holds a latch that shows him nothing at all beyond his own
 * hand's rising heat. The navigator winds a wheel that turns only while,
 * somewhere she cannot see, that latch is held. Neither screen ever says why
 * the other's half is doing what it is doing: his heat is his alone, her
 * seizing is hers alone, and the sentence that joins them has to be said out
 * loud or the fight does not move.
 *
 * **The rule is one sentence**: he holds the latch, she winds the wheel, and
 * the wheel only turns while he is holding.
 *
 * **Its health is the three hasps.** Each opens once, wound further than the
 * last, and the third opening ends the fight. No bar: a hasp is sealed or it
 * has swung, and the row is the count.
 *
 * **The gate is not a primitive.** It is one read of both hands in this
 * boss's own step and in its own hand file — the finding §20 was written to
 * make, and the reason this lane added nothing to the engine but two
 * `DragTarget` names (`hasp-hand.ts`).
 *
 * **One ordinary hazard, once.** The second hasp's spring throws a loose
 * bolt down the centre column, shot out in either colour inside
 * `haspBoltBeats` (`hasp-shot.ts`, row 7), or it reaches the hull, which is
 * the wave.
 *
 * **The wave authors nothing.** Three hasps is the silhouette and every
 * figure in the fight is a beat count or a distance the pair has to feel, so
 * THE HASP is one of the clocks that take an entry with a `kind` and no data
 * (`boss-entries-clocks.ts`).
 */

/** No hand on the latch, and the depth that says so. */
export const NO_LATCH = -1;
/** The latch cool and takeable, and the beat value that says so. */
export const NO_BURN = -1;
/** No bolt loose, and the column value that says so. */
export const NO_BOLT = -1;

/**
 * The hasps in the row at the top of the fight — the health, and a figure of
 * the **silhouette** rather than a tuning, which is why it is here rather
 * than in `config-hasp.ts`: the picture draws three clasps down a centre
 * line and a wave that sealed four would be a different door.
 */
export const HASP_COUNT = 3;

/**
 * Where the scene is: the row sealed and the wheels dark, a latch lit and a
 * wheel to be wound, a hasp swinging open, or the whole row swung clear.
 */
export const HASP_PHASES = ["still", "work", "swing", "clear"] as const;
export type HaspPhase = (typeof HASP_PHASES)[number];

export interface HaspState {
  kind: "hasp";
  phase: HaspPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** Hasps left sealed: `HASP_COUNT` down to nought. */
  hasps: number;
  /** How deep the pilot has carried the latch, `NO_LATCH` with his hand off. */
  latchMilli: number;
  /** `world.beat` this grip was taken — what the heat is counted from. */
  gripBeat: number;
  /** `world.beat` the latch burned a hand off, `NO_BURN` while it is cool. */
  burnBeat: number;
  /** Where the wheel stands, in thousandths of a turn. */
  wheelMilli: number;
  /** Where her hand last reported, `NO_BEARING` while it is off the rim. */
  handMilli: number;
  /** How far this hasp has been wound, in thousandths; nought at a fresh one. */
  woundMilli: number;
  /** Whether her hand is on a wheel that will not turn — the dim, said once. */
  seized: boolean;
  /** The column the loose bolt falls in, `NO_BOLT` while none is loose. */
  boltCol: number;
  /** `world.beat` the bolt came loose. */
  boltBeat: number;
}

export function haspBoss(world: World): HaspState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "hasp" ? boss : null;
}

/** Whether the hands count at all: a latch is lit and a hasp is waiting. */
export function haspWorking(s: HaspState): boolean {
  return s.phase === "work";
}

/**
 * **Whether the latch is held**, and the whole of the gate: the wheel turns
 * while this is true and seizes the moment it is not.
 *
 * A **level** rather than an edge, which is the opposite of a handle, and the
 * reason the two read alike but behave nothing alike: a stroke is judged when
 * it lands, and a grip is judged every tick it lasts.
 */
export function haspHeld(s: HaspState, cfg: SimConfig): boolean {
  return s.latchMilli !== NO_LATCH && s.latchMilli >= cfg.haspGripMilli;
}

/** Whether the latch is too hot to take, and for how long is the burn's own. */
export function haspBurning(s: HaspState): boolean {
  return s.burnBeat !== NO_BURN;
}

/**
 * Beats this grip may last before the latch burns him off it — shorter on
 * the last hasp, which is row 8's *the heat window shortens*.
 *
 * Read off the health rather than counted in a movement field of its own: one
 * hasp left is the last movement, and a state that cannot disagree with itself
 * about which movement it is in.
 */
export function haspFuseBeats(s: HaspState, cfg: SimConfig): number {
  return s.hasps <= 1 ? cfg.haspLastHoldBeats : cfg.haspHoldBeats;
}

/**
 * **The pilot's whole readout**, and the only one he ever gets: how hot his
 * hand is, nought at a fresh grip and a thousand the instant it burns.
 *
 * A distance rather than a count, so the picture can drift a colour up it
 * without ever printing a number — the design's *a slow colour drift on the
 * mark itself, never a number, never a bar*. Nought with no hand on it.
 */
export function haspHeatMilli(s: HaspState, cfg: SimConfig, beat: number): number {
  if (s.latchMilli === NO_LATCH) return 0;
  const fuse = Math.max(1, haspFuseBeats(s, cfg));
  return Math.max(0, Math.min(1000, Math.round(((beat - s.gripBeat) * 1000) / fuse)));
}

/** Whether her hand is on the rim at all. */
export function haspTurning(s: HaspState): boolean {
  return s.handMilli !== NO_BEARING;
}

/** How far this hasp has to be wound before it opens — further every time. */
export function haspNeedMilli(s: HaspState, cfg: SimConfig): number {
  const opened = Math.max(0, HASP_COUNT - s.hasps);
  return cfg.haspWindMilli + opened * cfg.haspWindStepMilli;
}

/**
 * How far along this hasp's winding is, in thousandths of the way there —
 * her whole readout, and read off the wheel rather than printed beside it.
 */
export function haspWoundMilli(s: HaspState, cfg: SimConfig): number {
  const need = Math.max(1, haspNeedMilli(s, cfg));
  return Math.max(0, Math.min(1000, Math.round((s.woundMilli * 1000) / need)));
}

/** Whether a bolt is loose and there is something to shoot. */
export function haspLoose(s: HaspState): boolean {
  return s.boltCol !== NO_BOLT;
}

/** The whole row swung clear, and nothing left to hold or to wind. */
export function haspClear(s: HaspState): boolean {
  return s.phase === "clear";
}
