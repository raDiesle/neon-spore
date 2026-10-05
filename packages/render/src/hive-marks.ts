import type { SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE HIVE's one handle answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as a fight split in two lets
 * it, which is THE GAUGE's case (`gauge-marks.ts`).
 *
 * Whether the handle asks is the simulation's (`sim/hive-lobe.ts`): the
 * clenched underside asks the pilot until his carry begins
 * (`hiveHaulAsks`), and every swelling lobe asks the navigator but the one
 * under her thumb (`hiveLobeAsks`). The halo stands under the ring on the
 * one screen that ring is drawn on (`hive-grip.ts`).
 *
 * **Half of the convention is missing on purpose.** Each ring is one seat's
 * alone, because each state is shown to one seat alone — a ring on his
 * screen over a lobe he is not shown swelling would be a handle on a thing
 * he cannot see — so there is no partner's ring and clock, and a hand on the
 * wrong one is dropped without a sound (`sim/hive-hand.ts`), so there is
 * nothing to refuse red.
 *
 * Two verdicts, both green: the haul home (`hiveHaul`), round the mass, and
 * a lobe wrung (`hiveWrung`), round that lobe. **A thumb landing says
 * nothing**, and neither does one lifted early: the simulation says nothing
 * either, and a lobe let go opens coloured, which the pilot's screen says.
 *
 * Held in `HiveFx`, the boss's own (`hive-fx.ts`). Keyed by the lobe's
 * column, and the haul by `HIVE_HAUL`, which no column is.
 */
export const HIVE_HAUL = -1;

/**
 * Which lobe a verdict stands on: the column, for a site on the underside,
 * which has one a column — and the column and row together for a wall's
 * cocoon, since a wall has three in one column.
 */
export function hiveMarkKey(col: number, row?: number): number {
  return row === undefined ? col : 1000 + row * 100 + col;
}

export class HiveMarks {
  /** Was the last touch on each lobe, and on the mass, right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "hiveHaul") this.verdicts.mark(HIVE_HAUL, true);
      else if (e.type === "hiveWrung") this.verdicts.mark(hiveMarkKey(e.col, e.row), true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
