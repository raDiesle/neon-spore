import type { SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE LEAD's ring answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether the ring is offered is the simulation's (`sim/lead.ts`
 * `leadGrippable`): the still, the navigator's thumb not yet on it, and the
 * still not yet spent. On her screen the ring offered wears the halo under it
 * (`lead-grip.ts`) until the thumb is down.
 *
 * **Half of the convention is missing on purpose.** The ring stands on her
 * screen alone, because his stalk is a readout in the middle of the field and
 * a ring on it would name a place that is nowhere (`lead-shape.ts`) — so there
 * is no partner's ring and clock, and his press is dropped without a sound in
 * the simulation (`sim/lead-hand.ts`), so there is nothing to refuse red.
 *
 * The one verdict is green, on the thumb landing (`leadGrip`). **The tear has
 * none**: it lands in the tick the still passes, the ring is gone with it, and
 * holding to the fuse is not a wrong touch — it is the most time the hand can
 * buy. A let-go is not judged either; it is how the hold ends.
 *
 * Held in `LeadFx`, the boss's own (`lead-fx.ts`). One ring, so one key.
 */
export class LeadMarks {
  /** Was the last touch on the ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "leadGrip") this.verdicts.mark(LEAD_STALK, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

export const LEAD_STALK = 0;
