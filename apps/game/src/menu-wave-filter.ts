import {
  controlSet,
  DEFAULT_CONTROL_SET_ID,
  WAVES,
  type WaveMarkId,
  waveMarksOn,
} from "@neon-spore/content";

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
 * vocabulary: a wave's number, its name, its guide, its panel, its boss and
 * the boss's type (`normal`, `special`), and its faults.
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
  const set = controlSet(wave.controls);
  parts.push(set.name, set.id);
  if (set.id !== DEFAULT_CONTROL_SET_ID) parts.push("panel");
  if (wave.boss) parts.push("boss", wave.boss.kind, wave.bossType ?? "");
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

/**
 * The director's row of marks over its filter (`tools/director/src/rail-
 * symbols.ts`), asked for here on 29 September 2026 with the boss first.
 * Which marks a wave carries is not copied: it is content's `waveMarksOn`,
 * which the director's rail asks too. Only the glyphs and words are ours.
 *
 * Here they are words as well as glyphs: a phone's page is not a 210 px
 * track, and a pressable glyph with no word on it is a legend to learn.
 */
export const MARKS = [
  ["boss", "✦", "BOSS"],
  ["control", "⎈", "PANEL"],
  ["card", "✎", "GUIDE"],
  ["fault", "⚠", "FAULT"],
] as const satisfies readonly (readonly [WaveMarkId, string, string])[];

export type MarkId = WaveMarkId;

/** Whether a wave carries at least one pressed mark — ORed with each other,
 * as in the director, and ANDed with the field by the caller. No marks
 * pressed is not a filter. */
export function marksMatch(index: number, pressed: ReadonlySet<MarkId>): boolean {
  if (pressed.size === 0) return true;
  return waveMarksOn(WAVES, index).some((id) => pressed.has(id));
}
