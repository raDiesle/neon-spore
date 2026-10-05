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
 * and every candidate on the rail once the organ stands grown and nothing is
 * in hand (`antiphonRailAsks`). On the screen that shows it, each asked mark
 * wears the halo under its ring (`antiphon-grip.ts`, `antiphon-rail-grip.ts`)
 * — every candidate, never the one being described.
 *
 * **Half of the convention is missing on purpose.** The organ stands on the
 * explainer's screen alone and the rail on the chooser's, and each would
 * hand the other the half the fight keeps from them — so there is no
 * partner's ring and clock, and a press from the wrong seat is dropped
 * without a sound (`sim/antiphon-hand.ts`), so there is nothing to refuse.
 *
 * **The one verdict is the carry's**, at the organ's place and on both
 * screens, because both are waiting on it: green for the organ carried home
 * (`antiphonPit`, `antiphonBurst`), red for a decoy (`antiphonHarden`). It is
 * keyed `0` — there is one place to judge at. **The turn has none**: it is
 * how the explainer looks and it answers nothing.
 *
 * Held in `AntiphonFx`, the boss's own (`antiphon-fx.ts`).
 */
export class AntiphonMarks {
  /** Was the last carry right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "antiphonPit" || e.type === "antiphonBurst") this.verdicts.mark(0, true);
      if (e.type === "antiphonHarden") this.verdicts.mark(0, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
