/** A point on the screen. */
export interface At {
  readonly x: number;
  readonly y: number;
}

/** How fast the mass rings on its tendon, in cycles a second. Slow: it is heavy. */
const HZ = 0.75;
/** How little the ringing is damped: low enough that a jolt overshoots by half. */
const DAMP = 0.18;
/** The step the spring is integrated on, in seconds. */
const STEP = 1 / 240;
/** A gap longer than this is a world rebuilt or a restart, not a frame. */
const GAP = 0.25;

/**
 * **THE SINEW's mass has weight**: it trails where the sum hangs it on a
 * slow, lightly damped spring, so a snap or a fibre parted throws it past its
 * rest and it rings back down. Taken from VERSUS's `sinew:weight` slot, the
 * owner, 9 October 2026: *it makes it looking not so static but more dynamic*
 * (`tools/versus/DECIDED.md`).
 *
 * Only the drawn mass reads it — the fibres, the band's pull and the
 * handles ride on what is drawn — and the handles' hit test rests off
 * `sinewMassCentre` itself, so a thumb is answered where it always was.
 *
 * The memory outlives a frame, so it lives in `SinewFx` and is cleared in
 * `Effects.reset()`. Stepped on the simulation's clock and never the wall's,
 * so a frozen frame is the same picture every run, and thrown away whenever
 * that clock jumps — backwards, or by more than a frame.
 */
export class SinewCarry {
  private t = Number.NaN;
  private x = 0;
  private y = 0;
  private vx = 0;
  private vy = 0;
  private tile = 0;

  /** Where the mass is drawn at `seconds`, given where it hangs. */
  at(hung: At, seconds: number, tile: number): At {
    const dt = seconds - this.t;
    if (!(dt >= 0 && dt <= GAP) || tile !== this.tile) {
      this.t = seconds;
      this.x = hung.x;
      this.y = hung.y;
      this.vx = 0;
      this.vy = 0;
      this.tile = tile;
      return hung;
    }
    const w = 2 * Math.PI * HZ;
    for (let left = dt; left > 0; left -= STEP) {
      const h = Math.min(STEP, left);
      this.vx += (w * w * (hung.x - this.x) - 2 * DAMP * w * this.vx) * h;
      this.vy += (w * w * (hung.y - this.y) - 2 * DAMP * w * this.vy) * h;
      this.x += this.vx * h;
      this.y += this.vy * h;
    }
    this.t = seconds;
    return { x: this.x, y: this.y };
  }

  clear(): void {
    this.t = Number.NaN;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.tile = 0;
  }
}
