import { INNER, OUTER, type SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE GIMBAL's two rings answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether a ring asks is the simulation's (`sim/gimbal.ts`
 * `gimbalRingAsks`): while the rings are being turned and no hand is on it,
 * true or not, since a ring let go drifts back to rest. The halo stands on
 * the rim where the ring is met (`gimbalRingCircle`), on the one screen that
 * ring is drawn on (`gimbal-ring.ts`).
 *
 * **Half of the convention is missing on purpose.** Each ring is drawn for
 * its own seat alone (`view-role-clocks-c.ts`) — the reflection between the
 * two faces is the one thing the picture hides — so there is no partner's
 * ring and clock, and a press from the wrong seat has nothing to land on, so
 * there is nothing to refuse red.
 *
 * Both rings come true together (`gimbalTrue`), so both wash green; a slip
 * washes red the ring or rings the event says left the mark
 * (`gimbalSlip`'s `outer` and `inner`), and never the one still standing on
 * it. Held in `GimbalFx` (`gimbal-fx.ts`). Keyed by ring.
 */
export class GimbalMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "gimbalTrue") {
        this.verdicts.mark(OUTER, true);
        this.verdicts.mark(INNER, true);
      } else if (e.type === "gimbalSlip") {
        if (e.outer) this.verdicts.mark(OUTER, false);
        if (e.inner) this.verdicts.mark(INNER, false);
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
