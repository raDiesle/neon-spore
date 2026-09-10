/**
 * Stopping a VERSUS pair on a moment somebody chose, rather than one the
 * machine happened to reach
 *
 * `CLAUDE.md` says to send the owner a picture, and taking one of a live pair
 * was a lottery: a pose with a `cadenceSeconds` rebuilds its world on its own
 * clock, so what was on the frame when `bun run shot` landed depended on when
 * the browser started and how long the bundle took. `creature:dart` was the
 * worst of it — a thrust burning for one beat of a two-second replay took about
 * thirty-five shots ranked by PNG file size, on the reasoning that the frame
 * with a flame on it compresses worst.
 *
 * Three things had to be true before a held frame came back the same twice, and
 * each of them was a run of photographs that did not:
 *
 * 1. **The freeze is counted in ticks, never in seconds off the wall.** A
 *    `setTimeout` lands on whatever tick the loop had reached, so "1.2 seconds
 *    in" was a different world every time.
 * 2. **While a freeze is pending the loop runs on the tick too** — one
 *    simulated tick per animation frame, at a fixed `dt`. Otherwise the number
 *    of frames drawn on the way is a property of the machine, and everything
 *    the renderer eases between frames arrives having been eased a different
 *    number of times.
 * 3. **The held frame's render seed is the tick count, not the frame count.**
 *    Every sparkle and scatter comes off `seedRandom(seed)`, and a seed that
 *    went on counting while nothing moved changed all the small bright things.
 *
 * With the three together, three photographs of `freeze=1.2` came back
 * byte-identical. It is a camera and not a pause: the pair's own ⏸ is a person
 * looking, and none of this applies to it.
 */

/**
 * Ticks a pending freeze runs per animation frame. Four, not one: reason 2
 * above is that the count of frames drawn on the way is fixed rather than a
 * property of the machine, and any fixed stride keeps it. One tick a frame
 * made a six-second freeze take at least twelve seconds of wall clock, and
 * over two minutes on a machine running a check — the camera timed out and
 * photographed nothing. Four is a thirtieth of a second per paint, which is a
 * frame a phone actually draws.
 */
export const FREEZE_STRIDE = 4;

export class Freeze {
  /** The tick to stop on, or null for a pair nobody is photographing. */
  readonly atTick: number | null;
  /** Ticks stepped since the pair was built — the axis the freeze is on. */
  stepped = 0;
  frozen = false;

  constructor(seconds: number | null | undefined, tickHz: number) {
    this.atTick = seconds === null || seconds === undefined ? null : Math.round(seconds * tickHz);
  }

  /** Whether a freeze is still coming, which is when the loop runs on the tick. */
  get pending(): boolean {
    return this.atTick !== null && !this.frozen;
  }

  /**
   * Called once per simulated tick. `false` means the pair is there: do not
   * advance the world, and hold everything where it is.
   */
  step(): boolean {
    if (this.atTick !== null && this.stepped >= this.atTick) {
      this.frozen = true;
      return false;
    }
    this.stepped++;
    return true;
  }

  /**
   * The camera's cue. `tools/frames/versus-shot.ts` waits for `[data-frozen]`
   * rather than for a number of milliseconds: a timed wait guessed at how long
   * the seat probe and the run to the freeze would take, and photographed the
   * wrong moment whenever it guessed short — twice, on two different days.
   */
  mark(...frames: HTMLElement[]): void {
    for (const f of frames) f.dataset.frozen = "1";
  }

  /** The seed a draw uses: the tick count once frozen, the frame count until then. */
  seed(frames: number): number {
    return (this.frozen ? this.stepped : frames) + 1;
  }
}
