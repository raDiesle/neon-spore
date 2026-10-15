import type { WaveEntry } from "@neon-spore/content";
import type { BlisterBy, BlisterWay } from "@neon-spore/sim";
import { choiceRow } from "./cell-config-rows.js";
import {
  BLISTER_BYS,
  BLISTER_GESTURES,
  type BlisterGesture,
  blisterByOf,
  blisterGestureOf,
  blisterWayOfEntry,
  blisterWaysOf,
  byLabel,
  gestureLabel,
  setBlisterBy,
  setBlisterGesture,
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
 * up. GESTURE is any of the seven; WAY is offered only for a gesture that
 * has one — SWIPE's four arrows, TURN's two. No COUNT since 15 October 2026:
 * one blow knocks every blister out (`sim/blister.ts`).
 */
export function blisterRows(entry: WaveEntry, onEdit: () => void): HTMLElement[] {
  const gesture = blisterGestureOf(entry);
  const rows = [
    choiceRow("BY", BLISTER_BYS, blisterByOf(entry), byLabel, (by: BlisterBy) => {
      setBlisterBy(entry, by);
      onEdit();
    }),
    choiceRow("GESTURE", BLISTER_GESTURES, gesture, gestureLabel, (g: BlisterGesture) => {
      setBlisterGesture(entry, g);
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
