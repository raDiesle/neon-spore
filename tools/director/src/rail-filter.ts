import { controlSet, DEFAULT_CONTROL_SET_ID, type Wave } from "@neon-spore/content";
import { BRUSHES, brushOf, podBrushOf } from "./state.js";

/**
 * The filter over the wave list.
 *
 * **One field, above the list, full width.** WAVES is a 210px track
 * (`columns.ts`), and it is the narrowest column the director has — so a rail
 * of category buttons, a dropdown beside the field, or a row of chips is out
 * on its face: every one of them spends width the column does not have, and
 * the wave *names* are what that width is for. What is left is vertical: a
 * line above the list that costs the same twenty pixels whatever is typed in
 * it, and a count under it that is only there while it is filtering.
 *
 * **So the whole vocabulary is typed rather than clicked**, and it has to be
 * guessable without a legend beside it, because there is no room for one. The
 * rule is: a term matches if it is anywhere in what the wave *is* — its
 * number, its name, its sentence, its guide, the panel it is played on, the
 * boss it carries, the fault it is played under, and the name of every
 * creature and power-up that arrives in it. So `slick` finds the waves slicks
 * arrive in, `boss` finds the four that carry one, `ladder` finds the waves on
 * that panel, and `ward` finds the waves that hang one. Nothing had to be
 * learnt to get any of those.
 *
 * Terms are ANDed, which is what makes `slick ward` do the obvious thing, and
 * each one matches **from the start of a word**: `ward` finds THE WARD and THE
 * WARDEN and does not find the eight waves whose guide happens to say
 * *toward*. A bare substring was the first thing tried and it was useless on
 * exactly the terms this field is for — `ward`, `arm`, `col`, `row` are all
 * inside common English — while a whole-word match would have lost the
 * prefixes worth typing, which is most of what anybody types into a filter.
 *
 * Nothing is stored: a filter is a way of looking at the list for a minute,
 * not a setting.
 */

/**
 * Everything about one wave that a term may match, lowercased and run
 * together.
 *
 * Built per keystroke rather than kept: the list is a few dozen waves of a few
 * dozen entries, the strings are short, and a cache here would be a second
 * place that has to know every edit that can change a wave — a rename, a
 * repaint, a boss, a panel. The list is redrawn on all of those already.
 *
 * `waves` and an index rather than a bare wave, because `controlSet` is not
 * the only thing read off the neighbourhood: what is remarkable about a wave
 * is partly what the ones before it did (`rail-marks.ts` makes the same call).
 */
export function waveHaystack(waves: readonly Wave[], index: number): string {
  const wave = waves[index];
  if (!wave) return "";
  const parts: string[] = [String(index + 1), wave.id, wave.name, wave.sentence];

  if (wave.guide) {
    parts.push("guide", wave.guide.both, wave.guide.p1, wave.guide.p2, wave.guide.scene ?? "");
  }

  // The panel by name and by id, and the word itself — an author looking for
  // "the ladder waves" types the name, and one looking for "the waves that are
  // not on the standard panel" has no name to type.
  const set = controlSet(wave.controls);
  parts.push(set.name, set.id);
  if (set.id !== DEFAULT_CONTROL_SET_ID) parts.push("panel");

  if (wave.boss) parts.push("boss", wave.boss.kind);
  if (wave.malfunction) parts.push("fault", "malfunction", wave.malfunction.kind);

  // What arrives, by the name of the brush that would have placed it: the one
  // vocabulary a wave author already has, because it is what the palette says
  // on its buttons. `METEOR` and `rock` are the same button and both are here.
  for (const entry of wave.entries) {
    const brush = brushOf(entry);
    parts.push(brush, BRUSHES.find((b) => b.brush === brush)?.label ?? "");
  }
  for (const pod of wave.pods ?? []) parts.push("pod", podBrushOf(pod));

  return parts.join(" ").toLowerCase();
}

/** The terms a query asks for: whitespace-separated, all of which must match. */
export function filterTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Whether one term starts a word anywhere in a haystack.
 *
 * Written by hand rather than as a `RegExp`, because a term is whatever
 * somebody typed — a `(`, a `*`, a `?` — and building a pattern out of it
 * means escaping it, which is a second thing to get right for no gain over
 * walking the string.
 */
function startsAWord(hay: string, term: string): boolean {
  for (let at = hay.indexOf(term); at !== -1; at = hay.indexOf(term, at + 1)) {
    const before = at === 0 ? "" : hay[at - 1];
    if (before === undefined || !/[a-z0-9]/.test(before)) return true;
  }
  return false;
}

/** Whether a wave answers a query. An empty query is not a filter, so every
 * wave answers it. */
export function waveMatches(waves: readonly Wave[], index: number, query: string): boolean {
  const terms = filterTerms(query);
  if (terms.length === 0) return true;
  const hay = waveHaystack(waves, index);
  return terms.every((term) => startsAWord(hay, term));
}

export interface RailFilter {
  /** Whether this wave passes the field as it currently reads. */
  passes(waves: readonly Wave[], index: number): boolean;
  /** Whether anything is being filtered at all. */
  active(): boolean;
  /** Say how many of how many matched, under the field. The list calls this
   * once it has drawn itself, because the count is what it drew. */
  report(matched: number, total: number): void;
}

/**
 * Binds the field to the list. `onChange` is the list's own redraw and nothing
 * more — a filter never touches the store, never changes which wave is
 * selected and never restarts the stage, so typing in it costs one pass over
 * `renderList` and nothing else.
 */
export function bindRailFilter(onChange: () => void): RailFilter {
  const field = document.getElementById("waveFilter") as HTMLInputElement | null;
  const note = document.getElementById("waveFilterNote");

  field?.addEventListener("input", onChange);
  // Escape empties it rather than only blurring it, which is what a search
  // field does everywhere else — and the list comes straight back, so there is
  // no second step to undo a filter with.
  field?.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !field.value) return;
    e.preventDefault();
    field.value = "";
    onChange();
  });

  const query = (): string => field?.value ?? "";

  return {
    passes: (waves, index) => waveMatches(waves, index, query()),
    active: () => filterTerms(query()).length > 0,
    report: (matched, total) => {
      if (!note) return;
      const on = filterTerms(query()).length > 0;
      note.textContent = matched === 0 ? "nothing matches" : `${matched} of ${total}`;
      note.hidden = !on;
    },
  };
}
