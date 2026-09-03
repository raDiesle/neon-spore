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
  tickHz: number;
  /** Never go below this — the tuned value from `SimConfig`. */
  floorTicks: number;
  ceilingMs?: number;
  marginMs?: number;
}

export class InputDelay {
  private readonly tickHz: number;
  private readonly floor: number;
  private readonly ceiling: number;
  private readonly margin: number;
  private current: number;
  private wanted: number;
  private fallCredit = 0;

  constructor(o: InputDelayOptions) {
    this.tickHz = o.tickHz;
    this.margin = o.marginMs ?? MARGIN_MS;
    this.floor = Math.max(1, Math.round(o.floorTicks));
    this.ceiling = Math.max(this.floor, this.ticksFor((o.ceilingMs ?? CEILING_MS) - this.margin));
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
    this.wanted = clamp(this.ticksFor(rttMs), this.floor, this.ceiling);
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
      this.current--;
    }
  }

  /** The delay to schedule by, in ticks. */
  get ticks(): number {
    return this.current;
  }

  private ticksFor(ms: number): number {
    return Math.max(1, Math.ceil((Math.max(0, ms) + this.margin) * (this.tickHz / 1000)));
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}
