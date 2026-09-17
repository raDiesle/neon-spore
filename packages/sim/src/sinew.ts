import type { SimConfig } from "./config.js";
import { hullRow, midCol } from "./config.js";
import type { World } from "./world.js";

/**
 * THE SINEW: how hard, not when.
 *
 * **The question no other boss asks** — *a magnitude the pair has to agree
 * on.* Every other fight in this game is answered in columns, colours and
 * beats; this one is answered in a number neither player can read whole. A
 * tendon hangs from the top of the field with a lobed **mass** on the end of
 * it, and a handle on either side: `sinewLeft` is player 1's, `sinewRight`
 * player 2's, and each is pulled **down**. The two pulls **add** into one
 * **sum** on a strain band, and somewhere on that band is a **zone**. Player 1
 * sees where the zone is and not the sum; player 2 sees the sum and not the
 * zone. Hold the sum inside the zone for `sinewHoldBeats` and a **fibre**
 * parts (`docs/spec/bosses-choreographed.md` §8).
 *
 * **Health is the fibres.** The tendon has `sinewFibres`, the mass hangs a
 * row lower for every one parted, and the zone is re-rolled, narrower, after
 * each. Pull past the zone's top and the tendon **snaps back**: both hands
 * are thrown off for `sinewSnapBeats`, and the mass is whipped hard enough to
 * shed a rock into one of its own columns. From `sinewDecayFibres` parted the
 * tendon goes **slack** under a hand — the sum creeps down while anyone is
 * holding, and only both letting go resets it — so the pair has to re-grip
 * between fibres and say the number again. The last fibre's zone is the step
 * just under the band's top: one hand at the limit and the other all but,
 * with nowhere left over it but the snap.
 *
 * **The last fibre drops the mass**, and the fall is the pair's last gesture:
 * for `sinewFallBeats` both hands pulling *sideways* the same way walk it a
 * column a beat, and it lands at the wall if it got `sinewClearCols` from the
 * middle, or on the hull if it did not. No health bar, no ammunition colour:
 * the cannon cannot hurt it, and nothing of it falls but what the pair's own
 * mistakes shake out of it.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): the arrivals under it
 * are the wave's own, which is what makes the hands-off beat a decision.
 *
 * The clock and the hands are `sinew-step.ts`, the fingerprint
 * `sinew-hash.ts`, the numbers `config-sinew.ts`. This file is the shape and
 * the questions asked of it.
 */

/** Everything THE SINEW remembers between beats. */
export interface SinewState {
  kind: "sinew";
  /** Column the mass hangs over: `midCol` until the fall walks it. */
  massCol: number;
  /** Fibres still whole. `0` once the mass is falling. */
  fibres: number;
  /** How far down each hand has pulled, in thousandths; `-1` for a hand that is not on. */
  pullP1Milli: number;
  pullP2Milli: number;
  /** How far sideways each hand has carried its handle, signed the way the field is. */
  swayP1Milli: number;
  swayP2Milli: number;
  /** What the tendon has gone slack by: taken off the sum. */
  slackMilli: number;
  /** Bottom of the zone on the band; its width is `sinewZoneWidth`. */
  zoneLowMilli: number;
  /** `world.beat` the sum entered the zone on; `-1` while it is outside. */
  holdBeat: number;
  /** `world.beat` of the last snap-back; `-1` before the first. */
  snapBeat: number;
  /** `world.beat` the last fibre parted on and the mass began to fall; `-1` while it hangs. */
  fallBeat: number;
  /** `world.beat` the mass landed on; `-1` while it has not. */
  outBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function sinewBoss(world: World): SinewState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "sinew" ? boss : null;
}

/** Whether that seat has a hand on its handle. */
export function sinewHeld(s: SinewState, player: 1 | 2): boolean {
  return (player === 1 ? s.pullP1Milli : s.pullP2Milli) >= 0;
}

/** How far down one hand is pulling; nought for a hand that is not on. */
export function sinewPull(s: SinewState, player: 1 | 2): number {
  return Math.max(0, player === 1 ? s.pullP1Milli : s.pullP2Milli);
}

/** The top of the strain band: two hands at their reach. */
export function sinewBandMilli(cfg: SimConfig): number {
  return cfg.sinewReachMilli * 2;
}

/**
 * **The sum**: both pulls together, less what the tendon has gone slack by.
 * What player 2 is shown, and what the zone is read against.
 */
export function sinewSum(s: SinewState): number {
  return Math.max(0, sinewPull(s, 1) + sinewPull(s, 2) - s.slackMilli);
}

/** Fibres parted so far. */
export function sinewGone(s: SinewState, cfg: SimConfig): number {
  return cfg.sinewFibres - s.fibres;
}

/**
 * How wide the zone is now: narrower by `sinewZoneNarrowMilli` per fibre
 * parted, and never narrower than that step, so the last fibre's zone is a
 * target and not a point.
 */
export function sinewZoneWidth(s: SinewState, cfg: SimConfig): number {
  const narrow = Math.max(1, cfg.sinewZoneNarrowMilli);
  return Math.max(narrow, cfg.sinewZoneMilli - sinewGone(s, cfg) * narrow);
}

/** The zone on the band, bottom and top, as player 1 sees it. */
export function sinewZone(s: SinewState, cfg: SimConfig): { low: number; high: number } {
  const low = s.zoneLowMilli;
  return { low, high: low + sinewZoneWidth(s, cfg) };
}

/** Whether the sum is inside the zone now: the thing the hold counts. */
export function sinewInZone(s: SinewState, cfg: SimConfig): boolean {
  const sum = sinewSum(s);
  const zone = sinewZone(s, cfg);
  return sum >= zone.low && sum <= zone.high;
}

/** Whether the tendon has begun to go slack under a hand. */
export function sinewDecaying(s: SinewState, cfg: SimConfig): boolean {
  return s.fibres > 1 && sinewGone(s, cfg) >= cfg.sinewDecayFibres;
}

/** Whether the handles are still swinging from a snap-back: no hand takes hold. */
export function sinewSwinging(s: SinewState, world: World): boolean {
  return s.snapBeat >= 0 && world.beat - s.snapBeat < world.cfg.sinewSnapBeats;
}

/**
 * The row the mass hangs at: a row lower per fibre parted, and on its way
 * to the hull once it is falling — where a rock it sheds starts, and where
 * it lands from.
 */
export function sinewMassRow(s: SinewState, cfg: SimConfig, beat: number): number {
  const hung = cfg.sinewMassRow + sinewGone(s, cfg);
  if (s.fallBeat < 0) return Math.min(hung, hullRow(cfg));
  const beats = Math.max(1, cfg.sinewFallBeats);
  const gone = Math.min(beats, Math.max(0, beat - s.fallBeat));
  return Math.min(hullRow(cfg), hung + Math.floor(((hullRow(cfg) - hung) * gone) / beats));
}

/** The leftmost column the mass covers, kept on the field. */
export function sinewMassLeft(s: SinewState, cfg: SimConfig): number {
  const span = Math.max(1, Math.min(cfg.sinewMassCols, cfg.cols));
  return Math.max(0, Math.min(cfg.cols - span, s.massCol - Math.floor(span / 2)));
}

/** Columns the falling mass has been walked from the middle: what clears the ship. */
export function sinewWalked(s: SinewState, cfg: SimConfig): number {
  return Math.abs(s.massCol - midCol(cfg));
}
