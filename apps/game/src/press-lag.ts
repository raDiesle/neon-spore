/**
 * HOW LONG A THUMB WAITS FOR THE FIELD TO ANSWER IT.
 *
 * The owner, 19 September 2026, asking whether a native app would take input
 * better: *it sometimes does not react.* A press crosses four gaps before the
 * field moves — the browser's touch-to-event delay, the wait for the next
 * animation frame, the lockstep's scheduled delay (`link-run.ts`) and the tick
 * that applies it — and nothing measured any of them, so which one the pair
 * feels was a matter of argument.
 *
 * This measures the whole of it, end to end: from the touch event's own
 * `timeStamp`, which the browser takes when the finger lands and not when a
 * listener gets round to it, to the first painted frame whose world has
 * stepped past the tick the press was scheduled on. **The worst of the last
 * hundred is the figure**, not the mean, because the complaint is about the
 * bad ones.
 *
 * Pure and clock-free: every time is handed in, so a test drives it without a
 * browser. `press-lag-page.ts` does the listening and the drawing, behind
 * `?lag=1`, and nothing here runs unless that flag built one.
 */

/** How many answered presses the figures are taken over. */
export const LAG_SAMPLES = 100;

/**
 * A touch older than this when a press arrives is not that press's touch.
 *
 * A press is pushed synchronously inside the listener its touch fired, so the
 * true gap is well under a millisecond. The margin is for the presses nobody
 * touched for — a held key repeating from the tick (`keys.ts`), the wave's own
 * progression — which must not borrow a stamp left behind by a touch on the
 * field that pressed nothing.
 */
const STALE_MS = 250;

export class PressLag {
  private touched: number | null = null;
  private waiting: { at: number; tick: number }[] = [];
  private samples: number[] = [];

  /** A finger landed or a key went down, at the event's own `timeStamp`. */
  touch(at: number): void {
    this.touched = at;
  }

  /** A press entered the buffer at `now`: the touch it came from, or null. */
  stamp(now: number): number | null {
    const at = this.touched;
    this.touched = null;
    return at !== null && now - at <= STALE_MS ? at : null;
  }

  /** The stamped presses the tick `tick` drained, on their way to the world. */
  drained(stamps: readonly number[], tick: number): void {
    for (const at of stamps) this.waiting.push({ at, tick });
  }

  /**
   * A frame was painted at `now` showing the world at `tick`. Every press whose
   * scheduled tick — the tick drained plus this device's lockstep delay, 0 solo
   * — has been stepped is answered by this frame.
   */
  painted(tick: number, delayTicks: number, now: number): void {
    const still: { at: number; tick: number }[] = [];
    for (const w of this.waiting) {
      if (w.tick + delayTicks < tick) this.samples.push(now - w.at);
      else still.push(w);
    }
    this.waiting = still;
    if (this.samples.length > LAG_SAMPLES)
      this.samples.splice(0, this.samples.length - LAG_SAMPLES);
  }

  /** The answered presses, oldest first, in milliseconds. */
  figures(): readonly number[] {
    return this.samples;
  }
}

/** The readout, one line — pure, so its shape is tested off a phone. */
export function lagText(samples: readonly number[]): string {
  if (samples.length === 0) return "press → frame: no presses yet";
  const sorted = [...samples].sort((a, b) => a - b);
  const worst = sorted[sorted.length - 1] as number;
  const median = sorted[Math.floor(sorted.length / 2)] as number;
  return `press → frame  worst ${Math.round(worst)} ms  median ${Math.round(median)} ms  (${samples.length})`;
}
