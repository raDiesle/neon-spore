/**
 * **THE BURGEE's flag where it is drawn**, eased toward where the simulation
 * says it is (§11.56), kept by `burgee-fx.ts`.
 *
 * **The flag eases into stillness; it never snaps to a stop** (§39,
 * *Animation*). The simulation moves the flag once a beat and a freeze can
 * land at any instant of one, so the place the drawer asks for jumps — from
 * moving to held — the frame a freeze lands. The drawn flag is carried toward
 * that place at `EASE` a second rather than put there, and how fast it is
 * going is what streams the canvas out behind it (`burgee-pose.ts`): a flag
 * slowing is a flag falling limp. The first frame puts the flag where it is
 * asked for, so a wave begun or a restart never shows it sliding in.
 */

/** How fast the drawn flag closes on where it is asked to be, per second. */
const EASE = 9;
/** How fast its speed is smoothed into the stream, per second. */
const STREAM_EASE = 6;
/** The speed, in thousandths of a column a second, at which the flag streams straight out. */
const FULL_SPEED = 1800;

export class BurgeeFlag {
  private drawnMilli: number | null = null;
  private askedMilli = 0;
  private leanNow = 0;

  /** Where the flag is drawn, thousandths of a column off the middle. */
  get swing(): number {
    return this.drawnMilli ?? this.askedMilli;
  }

  /**
   * How far the flag streams, and which way, in the field's columns: -1
   * straight out toward the lower columns, 1 toward the higher, nought
   * hanging limp. It trails the way the flag is going, so it is the
   * opposite of its speed; the pose turns it with the field.
   */
  get lean(): number {
    return this.leanNow;
  }

  /** The drawer's word for where the flag is asked to be this frame. */
  aim(swingMilli: number): void {
    this.askedMilli = swingMilli;
    if (this.drawnMilli === null) this.drawnMilli = swingMilli;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    if (this.drawnMilli === null || step <= 0) return;
    const before = this.drawnMilli;
    this.drawnMilli += (this.askedMilli - before) * (1 - Math.exp(-EASE * step));
    const speed = (this.drawnMilli - before) / step;
    const lean = Math.max(-1, Math.min(1, -speed / FULL_SPEED));
    this.leanNow += (lean - this.leanNow) * (1 - Math.exp(-STREAM_EASE * step));
  }

  clear(): void {
    this.drawnMilli = null;
    this.askedMilli = 0;
    this.leanNow = 0;
  }
}
