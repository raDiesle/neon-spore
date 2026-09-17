import type { SimConfig } from "./config.js";
import { hullRow, midCol } from "./config.js";
import type { World } from "./world.js";

/**
 * THE SURGE: whether you can stop.
 *
 * **The question no other boss asks** — *whether the pair can let go.*
 * Every hold in this game is rewarded for lasting: the grip, the lance's
 * fill, the ready gate, the warden's tether. This one is answered by the
 * **lift**. A ribbed bulb hangs high in the field with a **seam** round its
 * equator, and a thumb anywhere on it — either seat's, both seats' — charges
 * it: the **pressure** climbs a step a beat per hand. Along the seam are
 * **notches**, each a mark on the gauge, and the only gesture that counts is
 * both thumbs coming off the glass **within one beat of each other** with
 * the pressure at the notch. Inside the notch's band it **vents** and the
 * notch stays open; over it, it **bursts**; under it, or with one hand
 * alone, the charge is **lost**. Player 1 sees where the notches are and not
 * the pressure; player 2 sees the pressure and not the notches — THE SINEW's
 * split at the other verb (`docs/spec/bosses-choreographed.md` §9).
 *
 * **Health is the seam.** `surgeNotches` open is a bulb that cannot hold
 * pressure at all, and it **everts** — turns itself inside out over
 * `surgeEvertBeats` — which is the end of it. Each notch opened hangs the
 * bulb a row lower, and the notch after is higher on the gauge. From
 * `surgeHoldNotches` open the bulb **holds** its charge with no hand on it
 * and **absorbs** whatever the wave sends into it, a step a body; from
 * `surgeDoubleNotches` a hand charges it at double; and from
 * `surgeCloseNotches` a burst **closes** a notch again. The last notch's
 * band ends one under the burst.
 *
 * **A burst throws gums**, `surgeBurstGums` of them, down the bulb's own
 * columns from where it hangs — the shipped body the pair swipes away in the
 * air (`gum.ts`), and one that reaches the ship is the ship's ordinary
 * arrival. Both hands are thrown off and nothing takes hold for
 * `surgeBurstBeats`. The cannon cannot hurt it, and it falls nothing but
 * what the pair's own bursts throw.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): the arrivals under
 * it are the wave's own, and from the second notch they are its food.
 *
 * The clock is `surge-step.ts`, the hands `surge-hand.ts`, the three ends
 * of a charge `surge-seam.ts`, the fingerprint `surge-hash.ts`, the numbers
 * `config-surge.ts`. This file is the shape and the questions asked of it.
 */

/** Everything THE SURGE remembers between beats. */
export interface SurgeState {
  kind: "surge";
  /** Notches open on the seam. `surgeNotches` is the eversion. */
  notches: number;
  /** The pressure, in thousandths of the gauge. */
  pressureMilli: number;
  /** Whether each seat has a thumb on the bulb. */
  heldP1: boolean;
  heldP2: boolean;
  /** `world.tick` the first of two lifts came on, while the other hand is still on; `-1` otherwise. */
  liftTick: number;
  /** `world.beat` the pressure came into the notch's band on; `-1` while it is outside. */
  nearBeat: number;
  /** `world.beat` of the last burst; `-1` before the first. */
  burstBeat: number;
  /** `world.beat` the last notch opened and the eversion began; `-1` while the bulb holds. */
  evertBeat: number;
  /** `world.beat` the eversion finished on; `-1` while it has not. */
  outBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function surgeBoss(world: World): SurgeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "surge" ? boss : null;
}

/** Whether that seat has a thumb on the bulb. */
export function surgeHeld(s: SurgeState, player: 1 | 2): boolean {
  return player === 1 ? s.heldP1 : s.heldP2;
}

/** How many thumbs are on it. */
export function surgeHands(s: SurgeState): number {
  return (s.heldP1 ? 1 : 0) + (s.heldP2 ? 1 : 0);
}

/**
 * Where on the gauge the notch being worked toward sits: the first at
 * `surgeNotchMilli`, each after a step higher — and the last one
 * `surgeWindowMilli` and one under the burst, so its band's top is the
 * last number on the gauge that is not a burst.
 */
export function surgeNotchMilli(s: SurgeState, cfg: SimConfig): number {
  const last = Math.max(1, cfg.surgeNotches) - 1;
  const k = Math.max(0, Math.min(last, s.notches));
  const top = cfg.surgeBurstMilli - cfg.surgeWindowMilli - 1;
  if (k >= last) return Math.max(0, top);
  return Math.min(Math.max(0, top), cfg.surgeNotchMilli + k * cfg.surgeNotchStepMilli);
}

/** The band round the notch: a lift inside vents, over bursts, under is lost. */
export function surgeBand(s: SurgeState, cfg: SimConfig): { low: number; high: number } {
  const at = surgeNotchMilli(s, cfg);
  const w = Math.max(0, cfg.surgeWindowMilli);
  return { low: Math.max(0, at - w), high: Math.min(cfg.surgeBurstMilli - 1, at + w) };
}

/** Whether the pressure is inside the band now: the thing a lift is judged against. */
export function surgeInBand(s: SurgeState, cfg: SimConfig): boolean {
  const band = surgeBand(s, cfg);
  return s.pressureMilli >= band.low && s.pressureMilli <= band.high;
}

/** Whether the bulb keeps its charge with no hand on it, and eats what reaches it. */
export function surgeHoldsCharge(s: SurgeState, cfg: SimConfig): boolean {
  return s.notches >= cfg.surgeHoldNotches;
}

/** What one hand adds a beat now: the step, or twice it from `surgeDoubleNotches`. */
export function surgeChargePerHand(s: SurgeState, cfg: SimConfig): number {
  return s.notches >= cfg.surgeDoubleNotches ? cfg.surgeChargeMilli * 2 : cfg.surgeChargeMilli;
}

/** Whether the bulb is still re-sealing from a burst: no hand takes hold. */
export function surgeSealing(s: SurgeState, world: World): boolean {
  return s.burstBeat >= 0 && world.beat - s.burstBeat < world.cfg.surgeBurstBeats;
}

/** Whether the bulb is turning inside out, or has. */
export function surgeEverting(s: SurgeState): boolean {
  return s.evertBeat >= 0;
}

/** The row the bulb hangs at: a row lower per notch open, and never the hull's. */
export function surgeBulbRow(s: SurgeState, cfg: SimConfig): number {
  return Math.min(hullRow(cfg) - 1, cfg.surgeBulbRow + s.notches);
}

/** The leftmost column the bulb covers, kept on the field. */
export function surgeBulbLeft(cfg: SimConfig): number {
  const span = surgeBulbSpan(cfg);
  return Math.max(0, Math.min(cfg.cols - span, midCol(cfg) - Math.floor(span / 2)));
}

/** How many columns it covers. */
export function surgeBulbSpan(cfg: SimConfig): number {
  return Math.max(1, Math.min(cfg.surgeBulbCols, cfg.cols));
}

/** Whether a column is under the bulb. */
export function surgeCovers(cfg: SimConfig, col: number): boolean {
  const left = surgeBulbLeft(cfg);
  return col >= left && col < left + surgeBulbSpan(cfg);
}
