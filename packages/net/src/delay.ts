/**
 * How far ahead of the screen a press is scheduled — chosen from the link that
 * is actually there, rather than fixed in the config.
 *
 * `cfg.inputDelayTicks` is 12 ticks, a tenth of a second. That is a good number
 * for two phones on the same wifi and a bad one for two phones on mobile data
 * in different cities, where the trip out to the room and back down to the
 * other handset is routinely longer than it. A delay shorter than that trip
 * does not make the game feel quicker: every press misses the tick it was meant
 * for, the peer's promise never arrives in time, and the run spends its life in
 * `stalled`. Lag you can play through beats a stutter you cannot.
 *
 * **What is held here is milliseconds, and the tick count is asked for at the
 * moment of scheduling.** A delay is a promise about the *hand* — the gap
 * between a thumb and the answer to it — and that gap is wall clock. It was
 * kept in ticks until 17 September 2026, which was the same number right up
 * until THE SLOW landed: inside one of its windows a tick is worth three times
 * its ordinary length (`sim/slow.ts`), so a fixed number of ticks was a third
 * of a second in the hand on exactly the beats a boss made dramatic. Nothing
 * in this package may ask whether a window is open — `packages/net` does not
 * import `packages/sim` — so the caller hands the rate in force to `ticksAt`
 * and the two devices agree about it the way they agree about everything, by
 * the window's boundaries being hashed fields.
 *
 * **The delay is this device's own and is never agreed with the peer.** Every
 * command goes over the wire stamped with the exact tick it lands on, and a
 * device's `confirm` horizon is derived from its own delay, so two devices
 * holding different values are still one game — the slower link simply feels
 * slower in the hand that owns it, which is where the cost belongs. That is
 * what keeps this out of `SimConfig`: a number the two must agree on would have
 * to be handed out by the room and hashed, and this one does not.
 *
 * It rises the moment the measurement asks for it and falls a tick at a time,
 * because being briefly too slack costs a little feel and being briefly too
 * tight costs the run.
 */

/**
 * Headroom over the measured trip, in milliseconds. A median round trip is not
 * the worst one, and it is the worst one that stalls a tick.
 */
const MARGIN_MS = 45;

/** Milliseconds of good measurement before the delay gives a tick back. */
const FALL_EVERY_MS = 1000;

/**
 * The most delay worth carrying, in milliseconds. Past this the game is not
 * playable to a beat anyway, and holding still is the more honest picture than
 * a control that answers half a second late — so the link is allowed to stall
 * and say so rather than hide a bad line behind lag.
 */
const CEILING_MS = 400;

export interface InputDelayOptions {
  /**
   * The ordinary rate. Two things are measured against it and neither is the
   * delay itself: the floor, which arrives as a tick count, and the step the
   * delay gives back once a second.
   */
  tickHz: number;
  /** Never go below this — the tuned value from `SimConfig`. */
  floorTicks: number;
  ceilingMs?: number;
  marginMs?: number;
}

export class InputDelay {
  /** One ordinary tick, in milliseconds. Not the tick in force — see `ticksAt`. */
  private readonly step: number;
  private readonly floor: number;
  private readonly ceiling: number;
  private readonly margin: number;
  private current: number;
  private wanted: number;
  private fallCredit = 0;

  constructor(o: InputDelayOptions) {
    this.step = 1000 / o.tickHz;
    this.margin = o.marginMs ?? MARGIN_MS;
    this.floor = Math.max(1, Math.round(o.floorTicks)) * this.step;
    this.ceiling = Math.max(this.floor, o.ceilingMs ?? CEILING_MS);
    this.current = this.floor;
    this.wanted = this.floor;
  }

  /**
   * A fresh round-trip measurement — the median from `ClockSync`, not a single
   * sample. Anything negative is "not measured yet" and is ignored.
   *
   * The trip that matters is up to the room and back down to the other phone,
   * which is half of this device's round trip plus half of the peer's. Only one
   * of those two is knowable here, so the whole of this device's round trip
   * stands in for the sum — right when the two links are alike, and generous in
   * the direction that costs feel rather than the run when they are not.
   */
  observe(rttMs: number): void {
    if (!Number.isFinite(rttMs) || rttMs < 0) return;
    this.wanted = clamp(Math.max(0, rttMs) + this.margin, this.floor, this.ceiling);
    if (this.wanted > this.current) {
      this.current = this.wanted;
      this.fallCredit = 0;
    }
  }

  /** Time passing. Only ever gives ticks back, and only one per second. */
  settle(elapsedMs: number): void {
    if (this.wanted >= this.current) {
      this.fallCredit = 0;
      return;
    }
    this.fallCredit += Math.max(0, elapsedMs);
    while (this.fallCredit >= FALL_EVERY_MS && this.current > this.wanted) {
      this.fallCredit -= FALL_EVERY_MS;
      this.current = Math.max(this.wanted, this.current - this.step);
    }
  }

  /** The delay to schedule by, in milliseconds. What the indicator shows. */
  get ms(): number {
    return this.current;
  }

  /**
   * The same delay as a number of ticks, at the rate a tick is being consumed
   * at right now — `1000 / tickHz` ordinarily, three times that inside one of
   * THE SLOW's windows.
   *
   * Asked at the moment of scheduling rather than held, which is the whole
   * point of this class keeping milliseconds: the tick count is the one part
   * of the delay that changes without the link changing.
   */
  ticksAt(msPerTick: number): number {
    return Math.max(1, Math.ceil(this.current / msPerTick));
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}
