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
}

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

  return { wave, sheet, inner };
}

/** The query string a `Place` round-trips to, e.g. `"?wave=7&sheet=backlog&inner=spec"` — never a trailing `?` alone. */
export function placeToSearch(place: Place): string {
  const params = new URLSearchParams();
  if (place.wave !== null) params.set("wave", String(place.wave));
  if (place.sheet !== null) {
    params.set("sheet", place.sheet);
    if (place.inner !== null) params.set("inner", place.inner);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
