import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import type { World } from "./world.js";

/**
 * THE SPOOL: the one boss answered by holding back exactly enough.
 *
 * **The question no other boss asks** (`docs/spec/bosses-choreographed.md`
 * §21) — *whether letting it run is the point.* Every other fight here is won
 * by doing a thing as fast, as hard or as precisely as the window allows.
 * This one is won by paying out a line at a rate that is neither, and the
 * only way to find that rate is to say it out loud.
 *
 * A thread-spool hangs sideways across the top of the field with its line
 * already run out to the hull. **Its health is four wooden ribs** on the
 * casing, and each **eases** open rather than cracking when the line has been
 * paid out at the right rate across a whole movement.
 *
 * **The split is `SplitGauge`, shipped a third time** (THE SINEW, THE SURGE):
 * the pilot holds a brake at a felt depth and is shown nothing but his own
 * grip — never a number, never the zone. The navigator is shown where the
 * line *should* be by now and where it actually is, and has no brake to feel.
 * Neither seat holds both halves, and the sentence between them is the whole
 * of the fight. The finding this boss is worth keeping for is that
 * `SplitGauge` reads as well for **restraint** — stay inside a zone — as it
 * does for effort.
 *
 * **Shallow pays fast, deep pays slow** (`spoolPayRateMilli`), and a brake
 * nobody is holding pays fastest of all: letting go is not neutral, which is
 * why the one gesture in the fight is a hold and not a press.
 *
 * **A movement is one or more legs**, and a leg is a target rate the
 * navigator has to call across (`SPOOL_LEGS`). The zone narrows a rib at a
 * time and the legs go one, two, three — then back to one for the last rib,
 * which is narrower than any of them. Leaving the zone resets the movement
 * and, from the second on, throws a rock down the pilot's own column; the
 * rock is the fight's one hazard and the shield is its answer.
 *
 * The clock is `spool-step.ts`, the brake `spool-hand.ts`, the fingerprint
 * `spool-hash.ts`, the numbers `config-spool.ts`. This file is the shape and
 * the readings taken off it.
 */

/** No hand on the brake, and the depth that says so. */
export const NO_BRAKE = -1;

/**
 * The ribs on the casing at the top of the fight — the health, and a figure of
 * the **silhouette** rather than a tuning: the picture draws four ribs round a
 * spool and a wave that hung one with five would be a different spool.
 */
export const SPOOL_RIBS = 4;

/**
 * **How many legs each movement runs**, oldest rib first — the beat list's
 * own shape (§21, rows 2–13) and not a tuning: one call, then two, then
 * three, then one again on a zone narrower than any of them. It is the
 * *need* the owner asked to be raised alongside a long window (22 September
 * 2026), said in the one unit this fight has.
 */
export const SPOOL_LEGS = [1, 2, 3, 1] as const;

/**
 * Where the scene is: the line taut and nothing running, a movement paying
 * out, the line slipped outside its zone and the movement going again, a rib
 * easing open, and the spool slack and drifting free.
 */
export const SPOOL_PHASES = ["taut", "pay", "slip", "ease", "slack"] as const;
export type SpoolPhase = (typeof SPOOL_PHASES)[number];

export interface SpoolState {
  kind: "spool";
  phase: SpoolPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** Ribs still on the casing: `SPOOL_RIBS` down to nought. */
  ribs: number;
  /** How deep the pilot has the brake, in thousandths of its reach; `NO_BRAKE` off it. */
  brakeMilli: number;
  /** Line paid out this movement, in thousandths; nought at every restart. */
  paidMilli: number;
  /** Where the line should be by now, in thousandths — the middle of the zone. */
  wantMilli: number;
  /** Which leg of the movement is running, nought-based. */
  leg: number;
  /** `world.beat` the leg began: what the next correction is due off. */
  legBeat: number;
  /** This leg's target rate, in thousandths a beat — what `wantMilli` climbs by. */
  wantRateMilli: number;
}

export function spoolBoss(world: World): SpoolState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "spool" ? boss : null;
}

/** Whether the line is running at all: a movement is up and being paid out. */
export function spoolPaying(s: SpoolState): boolean {
  return s.phase === "pay";
}

/** Whether the pilot has a hand on the brake. */
export function spoolHeld(s: SpoolState): boolean {
  return s.brakeMilli !== NO_BRAKE;
}

/** How deep the brake is being held; nought — fully shallow — with no hand on it. */
export function spoolDepthMilli(s: SpoolState): number {
  return s.brakeMilli === NO_BRAKE ? 0 : s.brakeMilli;
}

/** Ribs eased so far, which is also which movement the fight is in. */
export function spoolGone(s: SpoolState): number {
  return SPOOL_RIBS - s.ribs;
}

/** How many legs this movement runs, and the last one is always the tightest. */
export function spoolLegs(s: SpoolState): number {
  return SPOOL_LEGS[Math.min(SPOOL_LEGS.length - 1, Math.max(0, spoolGone(s)))] ?? 1;
}

/**
 * **What the brake is worth**: the rate the line pays out at, in thousandths
 * a beat, for the depth the thumb has it.
 *
 * Shallow is fast and deep is slow, straight down the reach, so the felt
 * thing and the rate it means are the same gesture read twice. A brake with
 * no hand on it is nought deep and so pays fastest — letting go runs the line
 * out, which is what makes a hold the gesture.
 */
export function spoolPayRateMilli(s: SpoolState, cfg: SimConfig): number {
  const reach = Math.max(1, cfg.spoolReachMilli);
  const depth = Math.max(0, Math.min(reach, spoolDepthMilli(s)));
  const span = cfg.spoolRateFastMilli - cfg.spoolRateSlowMilli;
  return cfg.spoolRateFastMilli - Math.round((depth * span) / reach);
}

/**
 * The depth that pays a line out at `rate` — `spoolPayRateMilli` read the
 * other way, for the one caller that has a rate and wants the grip: the
 * director's hand playing the fight correctly. **Called, never re-derived**
 * (`packages/sim/test/purity.test.ts`).
 */
export function spoolBrakeForRateMilli(cfg: SimConfig, rate: number): number {
  const reach = Math.max(1, cfg.spoolReachMilli);
  const span = Math.max(1, cfg.spoolRateFastMilli - cfg.spoolRateSlowMilli);
  const over = Math.max(0, Math.min(span, cfg.spoolRateFastMilli - rate));
  return Math.round((over * reach) / span);
}

/**
 * **How wide the zone is now**, in thousandths: narrower by
 * `spoolZoneNarrowMilli` a rib, and never narrower than that step, so the
 * last rib's zone is a target and not a point — `sinewZoneWidth`'s rule, and
 * the reason the last movement runs one leg rather than three. A zone this
 * narrow with corrections in it would be a step nobody could land.
 */
export function spoolZoneMilli(s: SpoolState, cfg: SimConfig): number {
  const narrow = Math.max(1, cfg.spoolZoneNarrowMilli);
  return Math.max(narrow, cfg.spoolZoneWideMilli - spoolGone(s) * narrow);
}

/** The zone on the track, low and high — what the navigator alone is shown. */
export function spoolZone(s: SpoolState, cfg: SimConfig): { low: number; high: number } {
  const half = Math.floor(spoolZoneMilli(s, cfg) / 2);
  return { low: Math.max(0, s.wantMilli - half), high: s.wantMilli + half };
}

/** Whether the paid-out length is inside the zone: the thing a movement counts. */
export function spoolInZone(s: SpoolState, cfg: SimConfig): boolean {
  const zone = spoolZone(s, cfg);
  return s.paidMilli >= zone.low && s.paidMilli <= zone.high;
}

/**
 * Whether the movement's opening grace is still running — the beats the line
 * is paid out before the zone is judged at all.
 *
 * Every movement starts with the paid-out length and the target on the same
 * mark, so without this the pair would be outside the zone before either of
 * them had said a word; the grace is the pilot's time to get a thumb on the
 * brake and hers to say the first depth.
 */
export function spoolGrace(s: SpoolState, cfg: SimConfig, beat: number): boolean {
  return s.phase === "pay" && beat - s.phaseBeat < cfg.spoolGraceBeats;
}

/** Beats left in the leg the movement is on: the next correction's own clock. */
export function spoolLegLeft(s: SpoolState, cfg: SimConfig, beat: number): number {
  if (!spoolPaying(s)) return 0;
  return Math.max(0, cfg.spoolLegBeats - (beat - s.legBeat));
}

/** Whether a rib is easing open right now, which is the one calm beat in a movement. */
export function spoolEasing(s: SpoolState): boolean {
  return s.phase === "ease";
}

/** Whether the line slipped its zone and the movement is about to run again. */
export function spoolSlipped(s: SpoolState): boolean {
  return s.phase === "slip";
}

/** All four ribs gone, the tension out of it, and the spool drifting off the top. */
export function spoolSlack(s: SpoolState): boolean {
  return s.phase === "slack";
}

/**
 * The column the casing hangs over: the middle of the field, and the column
 * every sound the spool itself makes is panned to. The one thing it throws
 * goes down the pilot's own column instead (`spool-step.ts`).
 */
export function spoolCol(cfg: SimConfig): number {
  return midCol(cfg);
}
