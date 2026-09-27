import type { SimEvent } from "@neon-spore/sim";

/**
 * What THE BURGEE keeps between frames (§11.56): **the flag where it is
 * drawn**, eased toward where the simulation says it is, and the limp
 * flutter a mistimed swipe leaves in it.
 *
 * **The flag eases into stillness; it never snaps to a stop** (§39,
 * *Animation*). The simulation moves the flag once a beat and a freeze can
 * land at any instant of one, so the place the drawer asks for jumps — from
 * moving to held — the frame a freeze lands. The drawn flag is carried toward
 * that place at `EASE` a second rather than put there, and how fast it is
 * going is what streams the canvas out behind it (`burgee-pose.ts`): a flag
 * slowing is a flag falling limp.
 *
 * **A flutter is slow and has no snap**: `burgeeFlutter` — a lift that
 * caught nothing — starts a long low ripple that dies away, where a catch
 * would pull the flag taut. The first frame puts the flag where it is asked
 * for, so a wave begun or a restart never shows it sliding in from the
 * middle. Cleared in `Effects.reset()`.
 */

/** How fast the drawn flag closes on where it is asked to be, per second. */
const EASE = 9;
/** How fast its speed is smoothed into the stream, per second. */
const STREAM_EASE = 6;
/** The speed, in thousandths of a column a second, at which the flag streams straight out. */
const FULL_SPEED = 1800;
/** How fast a flutter's ripple dies away, per second. */
const LIMP_DECAY = 0.7;

export class BurgeeFx {
  private drawnMilli: number | null = null;
  private askedMilli = 0;
  private leanNow = 0;
  private limpNow = 0;

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

  /** How much of a flutter is still in the canvas, 1 as it starts and 0 gone. */
  get limp(): number {
    return this.limpNow;
  }

  /** The drawer's word for where the flag is asked to be this frame. */
  aim(swingMilli: number): void {
    this.askedMilli = swingMilli;
    if (this.drawnMilli === null) this.drawnMilli = swingMilli;
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) if (e.type === "burgeeFlutter") this.limpNow = 1;
  }

  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.limpNow = Math.max(0, this.limpNow - LIMP_DECAY * step);
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
    this.limpNow = 0;
  }
}
