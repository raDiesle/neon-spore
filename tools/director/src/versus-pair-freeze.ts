import type { SimEvent, World } from "@neon-spore/sim";
import { cadenceElapsed, type Pose } from "./pose-kit.js";
import { stageTickHz } from "./stage-loop.js";
import { advance } from "./versus-advance.js";

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
 * 1. **The freeze is counted tick by tick, never in seconds off the wall.** A
 *    `setTimeout` lands on whatever tick the loop had reached, so "1.2 seconds
 *    in" was a different world every time. Each tick counts for the seconds it
 *    takes on the running pair (`Freeze.elapsed`), so a window THE SLOW
 *    opened is not crossed at four times its speed.
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
  /** The second of the pair's clock to stop on, or null for a pair nobody is photographing. */
  readonly atSeconds: number | null;
  /** Ticks stepped since the pair was built — what the held frame is seeded with. */
  stepped = 0;
  /**
   * Seconds of the pair's own clock since it was built: each tick adds its own
   * length at the rate it was spent at, so a tick inside a window THE SLOW
   * opened is four times as long as one outside it — the same seconds the
   * running pair shows. A cadenced rebuild zeroes the pair's clock and not
   * this: `freeze=10` on a six-second pose is four seconds into its second run.
   */
  elapsed = 0;
  frozen = false;

  constructor(seconds: number | null | undefined) {
    this.atSeconds = seconds === null || seconds === undefined ? null : seconds;
  }

  /** Whether a freeze is still coming, which is when the loop runs on the tick. */
  get pending(): boolean {
    return this.atSeconds !== null && !this.frozen;
  }

  /**
   * Called once per simulated tick, with the rate that tick is spent at.
   * `false` means the pair is there: do not advance the world, and hold
   * everything where it is. The half-microsecond is float dust: a hundred and
   * twenty twelfths of a second summed are not quite one.
   */
  step(hz: number): boolean {
    if (this.atSeconds !== null && this.elapsed >= this.atSeconds - 5e-7) {
      this.frozen = true;
      return false;
    }
    this.stepped++;
    this.elapsed += 1 / hz;
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

/** Where a pair stands between ticks: its world, what this frame has to draw, its cadence clock. */
export interface PairAt {
  readonly world: World;
  readonly events: SimEvent[];
  readonly clock: number;
}

/**
 * **One tick of a pair whose freeze is pending**, with its clock and the
 * freeze's count moved by the same amount — the one axis. The clock used to
 * gain `FREEZE_STRIDE / tickHz` a paint while the loop stepped
 * `stageTickHz` worth of ticks, a quarter as many inside a window, so the
 * cadence ran four times ahead of the world and the freeze, counting ticks at
 * the full rate, landed near the window's end for a second a fifth of the way
 * in. Here the tick is spent, then its length goes onto both, then the
 * cadence is asked — per tick, so a rebuild lands on the same tick every time.
 *
 * `null` once the freeze has landed. A world that is not `at.world` is a
 * rebuild, with its clock at zero.
 */
export function freezeTick(freeze: Freeze, pose: Pose, at: PairAt): PairAt | null {
  const hz = stageTickHz(at.world);
  if (!freeze.step(hz)) return null;
  const next = advance(at.world, () => pose.build(), pose);
  if (next.world !== at.world) return { world: next.world, events: next.events, clock: 0 };
  const clock = at.clock + 1 / hz;
  if (!cadenceElapsed(pose, clock)) return { world: at.world, events: next.events, clock };
  const rebuilt = pose.build();
  return { world: rebuilt, events: [...rebuilt.events], clock: 0 };
}
