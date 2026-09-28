import type { SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE ANTIPHON's two handles answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether each is asked is the simulation's (`sim/antiphon.ts`): the organ's
 * grip mark while one stands and no thumb rests on it (`antiphonOrganAsks`),
 * and every candidate on the rail still to be pulled once the organ stands
 * grown, so a pull would take (`antiphonRailAsks`). On the screen that shows
 * it, each asked mark wears the halo under its ring (`antiphon-grip.ts`,
 * `antiphon-rail-grip.ts`) — every candidate, never the one she should pull,
 * for the reason the rings are all drawn.
 *
 * **Half of the convention is missing on purpose.** The organ hangs on the
 * pilot's screen alone and the rail on the navigator's, and each would hand
 * the other the half the fight keeps from them — so there is no partner's
 * ring and clock, and a press from the seat without the rail is dropped
 * without a sound (`sim/antiphon-hand.ts`), so there is nothing to refuse red.
 *
 * The one verdict is green, on a pull (`antiphonPull`), round the candidate
 * crossed off, keyed by its column — the rail's columns are distinct. **The
 * turn has none**: it is how the pilot looks and it answers nothing. **Nor
 * has a pull of the organ itself**: it hardens the cycle in the same tick,
 * the rail is gone with it, and the hardening is the same event a bolt into
 * a decoy says — the fight's own answer to both.
 *
 * Held in `AntiphonFx`, the boss's own (`antiphon-fx.ts`).
 */
export class AntiphonMarks {
  /** Was the last pull on each column right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "antiphonPull") this.verdicts.mark(e.col, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
