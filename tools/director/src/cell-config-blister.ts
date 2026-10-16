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
import {
  BLOWS_CHOICES,
  type BlisterNumberChoice,
  blowsLabel,
  lengthChoiceLabel,
  lengthChoices,
  setBlows,
  setLengthMilli,
  setUpBeats,
  UP_BEATS_CHOICES,
  upBeatsLabel,
} from "./entry-fields-blister-numbers.js";

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
 *
 * **UP, BLOWS and LENGTH since 16 October 2026** — the owner: *let me able to
 * configure the timings/length/number of action required for each control.*
 * Beats it stays up, blows it takes, and one blow's length in its gesture's
 * unit (offered only for a gesture that has one), each DEFAULT first
 * (`entry-fields-blister-numbers.ts`).
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
  const numberRow = (
    label: string,
    choices: readonly BlisterNumberChoice[],
    current: BlisterNumberChoice,
    name: (n: BlisterNumberChoice) => string,
    set: (e: WaveEntry, n: BlisterNumberChoice) => void,
  ) =>
    choiceRow(label, choices, current, name, (n: BlisterNumberChoice) => {
      set(entry, n);
      onEdit();
    });
  rows.push(
    numberRow("UP", UP_BEATS_CHOICES, entry.upBeats, (n) => upBeatsLabel(gesture, n), setUpBeats),
    numberRow("BLOWS", BLOWS_CHOICES, entry.blows, (n) => blowsLabel(gesture, n), setBlows),
  );
  const lengths = lengthChoices(gesture);
  if (lengths.length > 0) {
    rows.push(
      numberRow(
        "LENGTH",
        lengths,
        entry.lengthMilli,
        (n) => lengthChoiceLabel(gesture, n),
        setLengthMilli,
      ),
    );
  }
  return rows;
}
