import { WAVES } from "@neon-spore/content";

/**
 * The filter over the JUMP TO WAVE list.
 *
 * The owner asked for the director's own filter here too, 20 September 2026
 * — the same rule, copied rather than imported: `tools/director/src/rail-
 * filter.ts`'s haystack reaches into brushes and pods, which mean something
 * to somebody authoring a wave and nothing to a player who has never opened
 * that editor, and the game bundle has no business depending on a dev tool's
 * code for a runtime feature. So this is the same algorithm — a term matches
 * if it starts a word anywhere in what a wave *is* — over a smaller
 * vocabulary: a wave's number, its name, its guide, and its boss.
 *
 * `ward` finds THE WARD and THE WARDEN and not a wave whose guide happens
 * to say *toward*, because a term has to start a word rather than
 * appear anywhere in one; `boss` finds every wave that carries one. Terms are
 * ANDed, so typing more narrows rather than widens.
 */

/** Everything about one wave a term may match, lowercased and run together. */
function waveHaystack(index: number): string {
  const wave = WAVES[index];
  if (!wave) return "";
  const parts: string[] = [String(index + 1), wave.id, wave.name];
  if (wave.guide) {
    const g = wave.guide;
    parts.push(...(g.scene === undefined ? [g.both, g.p1, g.p2] : [g.scene]));
  }
  if (wave.boss) parts.push("boss", wave.boss.kind);
  for (const fault of wave.faults ?? []) parts.push("fault", "malfunction", fault.kind);
  return parts.join(" ").toLowerCase();
}

/** The terms a query asks for: whitespace-separated, all of which must match. */
export function filterTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** Whether one term starts a word anywhere in a haystack. */
function startsAWord(hay: string, term: string): boolean {
  for (let at = hay.indexOf(term); at !== -1; at = hay.indexOf(term, at + 1)) {
    const before = at === 0 ? "" : hay[at - 1];
    if (before === undefined || !/[a-z0-9]/.test(before)) return true;
  }
  return false;
}

/** Whether a wave answers a query. An empty query is not a filter, so every
 * wave answers it. */
export function waveMatches(index: number, query: string): boolean {
  const terms = filterTerms(query);
  if (terms.length === 0) return true;
  const hay = waveHaystack(index);
  return terms.every((term) => startsAWord(hay, term));
}
