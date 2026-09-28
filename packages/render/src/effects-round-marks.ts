import type { SimEvent } from "@neon-spore/sim";
import { GaugeMarks } from "./gauge-marks.js";
import { PinballMarks } from "./pinball-marks.js";
import { PulseMarks } from "./pulse-marks.js";
import { SnakeMarks } from "./snake-marks.js";

/**
 * **The rounds' verdicts round a thumb**, the one transient a round keeps —
 * cut off `effects-boss-roster.ts` on 28 September 2026, when that page stood
 * at its 250-line ceiling and SNAKE was the first round with no fx class of
 * its own to hold them.
 *
 * The seam is the one the takeover already cuts: a round's frame returns
 * before `canvas2d.ts` ingests anything (`canvas2d-takeover.ts`), so these are
 * the fields fed from there, with one call each rather than one a round — and
 * the four verbs next door (`effects-boss.ts`) call the same three for the
 * rehearsal's seat, which ingests before it draws (`guide-seat.ts`).
 *
 * A base class of the roster for the roster's own reason: every
 * `effects.boss.gauge` already written goes on resolving, and
 * `restart.test.ts` still compares one `Effects` to another field by field.
 */
export class RoundMarks {
  /** THE GAUGE's needle's and band's (`gauge-marks.ts`). */
  readonly gauge = new GaugeMarks();
  /** SNAKE's jaws' and tail's (`snake-marks.ts`). */
  readonly snake = new SnakeMarks();
  /** PINBALL's plunger's and table's (`pinball-marks.ts`). */
  readonly pinball = new PinballMarks();
  /** THE PULSE's bar's two ends (`pulse-marks.ts`). */
  readonly pulse = new PulseMarks();

  ingestRounds(events: readonly SimEvent[]): void {
    this.gauge.ingest(events);
    this.snake.ingest(events);
    this.pinball.ingest(events);
    this.pulse.ingest(events);
  }

  updateRounds(dt: number): void {
    this.gauge.update(dt);
    this.snake.update(dt);
    this.pinball.update(dt);
    this.pulse.update(dt);
  }

  clearRounds(): void {
    this.gauge.clear();
    this.snake.clear();
    this.pinball.clear();
    this.pulse.clear();
  }
}
