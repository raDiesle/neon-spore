import type { WaveEntry } from "@neon-spore/content";
import type { BlisterBy, BlisterWay } from "@neon-spore/sim";
import { choiceRow } from "./cell-config-rows.js";
import {
  BLISTER_BYS,
  blisterByOf,
  blisterGestureOf,
  blisterWayOfEntry,
  blisterWaysOf,
  byLabel,
  setBlisterBy,
  setBlisterWay,
  wayLabel,
} from "./entry-fields-blister.js";

/**
 * **THE BLISTER's rows under the selected cell**, beside THE MINE's SEES and
 * built the same way (`cell-config-mine.ts`), in their own file for that
 * file's reason: `cell-config.ts` stands at its limit and grows only by the
 * line that calls this.
 *
 * BY is whose hand knocks it down — the owner asked for it to be set here,
 * in the brush settings — and the other seat is the one shown where it comes
 * up. WAY is offered only for a gesture that has one — SWIPE's four arrows,
 * TURN's two. No COUNT since 15 October 2026: one blow knocks every blister
 * out (`sim/blister.ts`).
 *
 * **No GESTURE row since 16 October 2026.** The owner: *from brush configs
 * of e.g. "hold" remove that i can reconfigure it … to change the
 * "gesture"*. The brush a blister was painted with is its gesture; painting
 * another CONTROLS brush over it is the one way to change it, and that keeps
 * BY (`paint.ts`).
 */
export function blisterRows(entry: WaveEntry, onEdit: () => void): HTMLElement[] {
  const gesture = blisterGestureOf(entry);
  const rows = [
    choiceRow("BY", BLISTER_BYS, blisterByOf(entry), byLabel, (by: BlisterBy) => {
      setBlisterBy(entry, by);
      onEdit();
    }),
  ];
  const ways = blisterWaysOf(gesture);
  if (ways.length > 0) {
    rows.push(
      choiceRow("WAY", ways, blisterWayOfEntry(entry), wayLabel, (way: BlisterWay) => {
        setBlisterWay(entry, way);
        onEdit();
      }),
    );
  }
  return rows;
}
