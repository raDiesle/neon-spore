import type { SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE SCUTTLE's hanging parts answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether a part is offered is the simulation's (`sim/scuttle.ts`
 * `scuttleSwingable`): one carry a cycle, none on the wind-up. On the pilot's
 * screen every ring offered and not under his thumb wears the halo under it
 * (`scuttle-grip.ts`) — every one, never the live one alone, for the reason
 * the rings are all drawn.
 *
 * **Half of the convention is missing on purpose.** The rings stand on his
 * screen alone, because on hers a ring would sit beside the lock and say
 * *this one*, her own reading read back to her — so there is no partner's
 * ring and clock, and her press is dropped without a sound in the simulation
 * (`sim/scuttle-hand.ts`), so there is nothing to refuse red.
 *
 * The one verdict is green, on the carry (`scuttleSwing`), round the part in
 * the column it now hangs over. **A thumb landing says nothing** — the
 * simulation says nothing either, since taking hold is not yet a choice — and
 * a shove off the end of the frame is not spent, so it is not judged.
 *
 * Held in `ScuttleFx`, the boss's own (`scuttle-fx.ts`). Keyed by socket.
 */
export class ScuttleMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "scuttleSwing") this.verdicts.mark(e.socket, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
