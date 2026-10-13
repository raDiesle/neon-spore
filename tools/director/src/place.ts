/**
 * Where you are in the director, as a value — and the two functions that turn
 * it into a URL and back. Pure on purpose: `session.ts` beside it owns the
 * `window`, the `document` and the one mutable copy of this, so the fallback
 * rules below are read and tested without either.
 *
 * Which value belongs in a `Place` at all, and why the URL carries navigation
 * and nothing else, is `session.ts`'s header — the rule lives with the code
 * that would be tempted to break it.
 */

/**
 * **There is no `tab` here, and there used to be.**
 *
 * The main editor's bar held four — WAVE, SHIP, TUNING, BALANCE — and lost
 * them one at a time as each moved to a sheet or a column of its own; the last
 * of them went on 15 September 2026, when the owner asked for the wave's own
 * number in its place, because a bar with one tab offers no choice. What was
 * left was a field naming a thing that did not exist, written into every URL
 * the tool produced.
 *
 * So it is gone, and an old link carrying `?tab=tuning` simply ignores it —
 * the same fallback an unknown tab name already got, and the same one a wave
 * index past the end of the list gets. A URL outlives the code that wrote it;
 * that is the rule this file was written around, and dropping a field is a
 * case of it rather than an exception to it.
 */
export interface Place {
  /** A wave index, or null when the URL named none. */
  wave: number | null;
  /** The overlay sheet open over the editor, by its own opaque name, or null for none. */
  sheet: string | null;
  /** The open sheet's own inner tab, by name, or null when it has none open. Always null when `sheet` is. */
  inner: string | null;
  /**
   * The tab inside that inner tab, for the one room that has a bar of its
   * own — DOCUMENTATION → CONTROLS → ON THE FIELD. Always null when `inner`
   * is: a third level means nothing without the second it sits in.
   */
  sub: string | null;
  /**
   * THE PULL LAB open over everything, on its path's key (`pull-lab-shapes.ts`),
   * or null when it is shut. Beside `sheet` rather than one of them: the lab
   * opens over CONTROLS as well as over the editor, and shut it leaves the
   * page under it where it was (the owner, 11 October 2026: a reload stays
   * on the lab). `pulllab=` in the URL, the name its first link had. THE
   * HOLD LAB is here too, as `HOLD_LAB` and its beats (`hold:2`), and
   * `holdlab=2` in the URL, and THE COMBO LAB as `COMBO_LAB` and its combo
   * (`combo:partner`), `combolab=partner`, and THE PRESS LAB as `PRESS_LAB`
   * and its presses and look (`press:5-pips`), `presslab=5-pips`: only one
   * lab is ever open.
   */
  lab: string | null;
  /** The lab shows EVERY LOOK, EVERY STATE rather than the live pull — `pullsheet=1`. Always false when `lab` is null. */
  labSheet: boolean;
}

/** What a `Place`'s `lab` starts with when the lab open is THE HOLD LAB (`hold-lab.ts`). */
export const HOLD_LAB = "hold:";
/** What a `Place`'s `lab` starts with when the lab open is THE PRESS LAB (`press-lab.ts`). */
export const PRESS_LAB = "press:";
/** What a `Place`'s `lab` starts with when the lab open is THE COMBO LAB (`combo-lab.ts`). */
export const COMBO_LAB = "combo:";
/** Every lab's prefix but the PULL LAB's, whose `lab` is its bare path key. */
export const PREFIXED_LABS: readonly string[] = [HOLD_LAB, PRESS_LAB, COMBO_LAB];

/**
 * Parses a `location.search`-shaped string into a `Place`. Pure, so the
 * fallback rule is testable without a `window`: a URL outlives the code that
 * wrote it, so an unknown tab name, a malformed wave number, or an `inner`
 * with no `sheet` beside it falls back silently rather than throwing — a link
 * from three weeks ago should open the page, not a blank screen.
 */
export function parsePlace(search: string): Place {
  const params = new URLSearchParams(search);

  const rawWave = params.get("wave");
  const parsed = rawWave ? Number(rawWave) : Number.NaN;
  const wave = Number.isInteger(parsed) && parsed >= 0 ? parsed : null;

  const sheet = params.get("sheet") || null;
  // An `inner` with no `sheet` is a malformed or hand-edited URL, not a
  // sheet the reader meant to reopen — dropped the same way a wave with no
  // digits is.
  const inner = sheet ? params.get("inner") || null : null;
  const sub = inner ? params.get("sub") || null : null;
  const hold = params.get("holdlab") || null;
  const combo = params.get("combolab") || null;
  const pressed = params.get("presslab") || null;
  const lab =
    hold !== null
      ? HOLD_LAB + hold
      : combo !== null
        ? COMBO_LAB + combo
        : pressed !== null
          ? PRESS_LAB + pressed
          : params.get("pulllab") || null;
  // THE COMBO LAB has no sheet.
  const sheetParam = hold !== null ? "holdsheet" : pressed !== null ? "presssheet" : "pullsheet";
  const labSheet = lab !== null && combo === null && params.get(sheetParam) === "1";

  return { wave, sheet, inner, sub, lab, labSheet };
}

/** The query string a `Place` round-trips to, e.g. `"?wave=7&sheet=states&inner=controlsets&sub=field"` — never a trailing `?` alone. */
export function placeToSearch(place: Place): string {
  const params = new URLSearchParams();
  if (place.wave !== null) params.set("wave", String(place.wave));
  if (place.sheet !== null) {
    params.set("sheet", place.sheet);
    if (place.inner !== null) {
      params.set("inner", place.inner);
      if (place.sub !== null) params.set("sub", place.sub);
    }
  }
  if (place.lab?.startsWith(HOLD_LAB)) {
    params.set("holdlab", place.lab.slice(HOLD_LAB.length));
    if (place.labSheet) params.set("holdsheet", "1");
  } else if (place.lab?.startsWith(PRESS_LAB)) {
    params.set("presslab", place.lab.slice(PRESS_LAB.length));
    if (place.labSheet) params.set("presssheet", "1");
  } else if (place.lab?.startsWith(COMBO_LAB)) {
    params.set("combolab", place.lab.slice(COMBO_LAB.length));
  } else if (place.lab !== null) {
    params.set("pulllab", place.lab);
    if (place.labSheet) params.set("pullsheet", "1");
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
