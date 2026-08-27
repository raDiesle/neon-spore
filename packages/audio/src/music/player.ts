/**
 * Playing a theme, one second at a time.
 *
 * The engine has no notion of a piece — it takes a `Plan` and builds nodes,
 * and it stops building them at 64 live voices because that is where mobile
 * audio dies. A thirty-second theme is several hundred voices, so handing it
 * over in one call would play the first two bars and silently drop the rest.
 *
 * So this schedules a **lookahead** and no more: everything starting inside
 * the next second goes to the engine with an absolute time on it, a timer
 * comes back for the next second, and the browser's own clock does the timing
 * rather than a frame loop. Which is also the whole of looping — coming back
 * to the top is adding one loop's worth of seconds to the offset.
 */

import type { Engine } from "../engine.js";
import { planTheme, type Theme, type ThemePlan } from "./model.js";

/** How far ahead of the clock voices are built. Long enough to survive a slow tick. */
const LOOKAHEAD = 1.1;
const TICK_MS = 350;
/** A guard: looping a theme with no length would schedule forever inside one tick. */
const MIN_LOOP = 0.5;

export interface PlayThemeOptions {
  loop?: boolean;
  /** Multiplies every note's gain — the piece's own volume, under the engine's. */
  gain?: number;
  /** Called when a piece that is not looping reaches its end, and on `stop()`. */
  onEnd?: () => void;
}

export class MusicPlayer {
  private plan: ThemePlan | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private cursor = 0;
  /** Absolute engine time the current time round started at. */
  private base = 0;
  private opts: PlayThemeOptions = {};

  constructor(private readonly engine: Engine) {}

  /** The theme playing now, or null. */
  get playing(): string | null {
    return this.plan?.id ?? null;
  }

  play(theme: Theme, opts: PlayThemeOptions = {}): void {
    this.stop();
    this.engine.unlock();
    this.plan = planTheme(theme, { gain: opts.gain });
    this.opts = opts;
    this.cursor = 0;
    // A little ahead of the clock: the first pump has to finish before the
    // first note is due, or the piece starts on its second bar.
    this.base = this.engine.now + 0.08;
    this.pump();
    this.timer = setInterval(() => this.pump(), TICK_MS);
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    const had = this.plan;
    this.plan = null;
    this.cursor = 0;
    // Voices are already scheduled a second out; without this, ■ means "in a
    // moment" and pressing two themes in a row plays both of them at once.
    if (had) this.engine.silence();
    const onEnd = this.opts.onEnd;
    this.opts = {};
    if (had && onEnd) onEnd();
  }

  private pump(): void {
    const plan = this.plan;
    if (!plan) return;
    const horizon = this.engine.now + LOOKAHEAD;
    const loops = this.opts.loop === true && plan.loopSeconds >= MIN_LOOP;

    while (true) {
      if (this.cursor >= plan.plans.length) {
        if (!loops) break;
        this.base += plan.loopSeconds;
        this.cursor = 0;
      }
      const next = plan.plans[this.cursor];
      if (!next) break;
      const when = this.base + next.start;
      if (when > horizon) break;
      this.engine.playPlan(next.plan, when);
      this.cursor++;
    }

    if (!loops && this.cursor >= plan.plans.length && this.engine.now > this.base + plan.duration) {
      this.stop();
    }
  }
}
