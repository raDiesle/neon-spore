import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { DRAG_NUMBERS } from "./field-numbers-drag.js";
import { OTHER_NUMBERS } from "./field-numbers-other.js";
import { text } from "./gestures-page.js";

/**
 * **The numbers that decide whether a control's gesture counts**, under each
 * ON THE FIELD card: how far a carry must go, how many beats a window stays
 * open, how near a mark is near enough. The owner, 9 October 2026, choosing
 * one look per control: two uses of one type can only be one look if they
 * ask the same of a thumb, and these say whether they do.
 *
 * Field names are kept (`field-numbers-drag.ts`, `field-numbers-other.ts`),
 * typed against `SimConfig` so a renamed field fails the typecheck; the values
 * are `DEFAULT_CONFIG`'s, read here and never copied. A field's unit is its
 * suffix — `Milli` thousandths (of a tile unless the field says otherwise),
 * `Beats`, `Ticks`, `Pct`, `Permille` — and a bare name is a count.
 *
 * What no field holds — a rule written as a literal in the simulation — is
 * said in a line instead (`LITERAL`).
 */

export const ROW_NUMBERS: Readonly<Record<string, readonly (keyof SimConfig)[]>> = {
  ...DRAG_NUMBERS,
  ...OTHER_NUMBERS,
};

/** A rule a row's gesture is held to that no `SimConfig` field names. */
export const LITERAL: Readonly<Record<string, string>> = {
  "THE CANNON": "the column under the finger, as the band's strip sends it",
  "THE SHIELD PLATE": "the column under the finger, as the band's strip sends it",
  "THE MAW TAP": "a lift inside TAP_TILES of the hold, in its column (render/src/touch-hand.ts)",
  "THE MUZZLE SWIPE": "a lift past SWIPE_TILES either side fires (render/src/touch-hand.ts)",
  "THE LEDGER'S PULL": "a press, offered only while the seam is whipping (ledgerPullable)",
  "THE LEDGER'S FOOT": "one tile of carry walks one column (ledger-hand.ts)",
  "THE WELL'S WIND": "one tile of carry winds one sector (well-hand.ts)",
  "THE CAPSTAN'S RUB": "a reversal is a carry back past RUB_TURN (render/src/rub.ts)",
  "THE BLISTER'S RUB": "a reversal is a carry back past RUB_TURN (render/src/rub.ts)",
  "THE BLISTER'S TURN": "a whole turn is sim/bearing.ts TURN",
  "THE WARDEN'S THUMB": "a level hold: down is held, up is let go (warden-open.ts)",
  "THE FILAMENT'S LINE": "the line moves one tile a beat",
  "THE LAMPREY'S TEETH": "the teeth and their jumps are LAMPREY_TEETH and LAMPREY_JUMP",
  "THE INSTAR'S MARKS": "a turn ratchets a quarter at a time (instar-hand.ts)",
  "THE SURGE'S BULB": "both lifts within one beat (liftTogetherUntil)",
  "THE GAUGE'S BAND": "a level hold, offered once the band is wound",
  "THE FLEET'S PLUME": "a level hold, offered while the hull floods",
};

/** Where every handle is taken: the same for every row, so said once. */
export const GRAB =
  "GRAB · a handle is drawn at handleRadiusMilli and answers a thumb out to HIT_REACH times " +
  "that, never under HIT_FLOOR_PX (render/src/hit.ts); a few grips widen it (hive-grip.ts, " +
  "blister-tap.ts, sling-grip.ts)";

const shown = (v: unknown): string => (typeof v === "number" ? String(v) : JSON.stringify(v));

/** The fields `rows` are held to, each once, in the order the rows name them. */
export function numbersOf(rows: readonly string[]): (keyof SimConfig)[] {
  return [...new Set(rows.flatMap((r) => ROW_NUMBERS[r] ?? []))];
}

/** The card's numbers, as a small list; null when the rows name none. */
export function numbersBlock(rows: readonly string[]): HTMLElement | null {
  const fields = numbersOf(rows);
  const literal = rows.flatMap((r) => LITERAL[r] ?? []);
  if (fields.length === 0 && literal.length === 0) return null;
  const box = document.createElement("div");
  box.className = "field-numbers";
  box.appendChild(text("b", "NUMBERS "));
  for (const f of fields) box.appendChild(text("code", `${f} ${shown(DEFAULT_CONFIG[f])}`));
  for (const line of literal) box.appendChild(text("span", line, "literal"));
  return box;
}
