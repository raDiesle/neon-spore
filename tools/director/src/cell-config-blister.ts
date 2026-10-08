import type { WaveEntry } from "@neon-spore/content";
import type { BlisterBy } from "@neon-spore/sim";
import { beadLabel, choiceRow } from "./cell-config-rows.js";
import {
  BLISTER_BYS,
  BLISTER_COUNTS,
  BLISTER_GESTURES,
  type BlisterGesture,
  blisterByOf,
  blisterCountOf,
  blisterGestureOf,
  blisterWaysOf,
  byLabel,
  gestureLabel,
  setBlisterBy,
  setBlisterCount,
  setBlisterGesture,
} from "./entry-fields-blister.js";

/**
 * **THE BLISTER's rows under the selected cell**, beside THE MINE's SEES and
 * built the same way (`cell-config-mine.ts`), in their own file for that
 * file's reason: `cell-config.ts` stands at its limit and grows only by the
 * line that calls this.
 *
 * BY is whose hand knocks it down — the owner asked for it to be set here,
 * in the brush settings — and the other seat is the one shown where it comes
 * up. COUNT is the blows it takes — taps, or beats held. GESTURE is TAP or
 * HOLD until THE BLISTER's lanes 5 to 7 add theirs; WAY is offered only for
 * a gesture that has one, so it is not offered at all today.
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
    choiceRow("COUNT", BLISTER_COUNTS, blisterCountOf(entry), beadLabel, (count: number) => {
      setBlisterCount(entry, count);
      onEdit();
    }),
  ];
  const ways = blisterWaysOf(gesture);
  if (ways.length > 0) rows.push(choiceRow("WAY", ways, ways[0] ?? "", String, () => onEdit()));
  return rows;
}
