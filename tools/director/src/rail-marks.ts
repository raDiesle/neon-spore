import { controlSet, DEFAULT_CONTROL_SET_ID, firstOnPanel, type Wave } from "@neon-spore/content";

/**
 * The small glyphs in front of a wave's name in the rail: a boss, a panel, a
 * guide, a fault.
 *
 * Split out of `rail.ts` on line count, and the seam is the honest one — next
 * door is the list and the fields and what editing one does, and this only
 * reads a wave and says what is remarkable about it at a glance.
 *
 * Each mark stays its own span and its own glyph rather than being folded into
 * one, and the fourth cost exactly what that promised: one more block.
 */

/** The glyph of each mark, and the word the filter offers it by — one table, so
 * the pressable row in the filter cannot drift from the row it filters
 * (`rail-filter.ts`). */
export const MARKS = [
  ["boss", "♛", "boss"],
  ["control", "⎈", "panel"],
  ["card", "✎", "guide"],
  ["fault", "⚠", "fault"],
] as const;

export type MarkId = (typeof MARKS)[number][0];

/** Which marks a wave carries, by id — the same four questions `waveMarks`
 * draws, asked without a document. It is what the filter narrows on and what a
 * test can read. */
export function marksOn(waves: readonly Wave[], index: number): MarkId[] {
  const wave = waves[index];
  if (!wave) return [];
  const out: MarkId[] = [];
  if (wave.boss) out.push("boss");
  if (firstOnPanel(waves, index) || controlSet(wave.controls).id !== DEFAULT_CONTROL_SET_ID) {
    out.push("control");
  }
  if (wave.guide) out.push("card");
  if (wave.faults?.length) out.push("fault");
  return out;
}
/** The marks as spans, in the order a row draws them. */
export function waveMarks(waves: readonly Wave[], index: number): HTMLElement[] {
  const wave = waves[index];
  if (!wave) return [];
  const out: HTMLElement[] = [];

  // A boss wave is not one entry among several; a small mark says so without
  // spending a whole tab on the one wave that needs it.
  if (wave.boss) {
    out.push(mark("boss-mark", wave.boss.kind === "mirror" ? "◑ " : "♛ "));
  }

  /**
   * The panel, and it marks two things that are not the same set of waves: a
   * panel that is not the ordinary one, and the **first wave played on any
   * panel at all**. SALVAGE is where the standard panel's last button
   * arrives and it is the ordinary panel from then on — so a list that
   * only marked the unusual ones would say nothing about the wave that hands
   * the pair something they have never held. `firstOnPanel` is called rather
   * than worked out again here; the same question decides whether that wave is
   * required to carry a guide (`content/test/waves.test.ts`).
   */
  const set = controlSet(wave.controls);
  const first = firstOnPanel(waves, index);
  if (first || set.id !== DEFAULT_CONTROL_SET_ID) {
    const m = mark("control-mark", "⎈ ");
    m.title = first ? `${set.name} — first wave on this panel` : set.name;
    out.push(m);
  }

  /**
   * The guide, read off the wave in the store rather than off the shipped
   * campaign. It used to be the latter, and the mark then said what the last
   * *save* had — so a guide written for a new wave, which is exactly what a
   * first wave on a panel needs, was a wave with no pencil on it until the
   * file had been written and the page reloaded.
   *
   * No `title` — a tooltip here is what the owner rejected — and no second
   * copy of the guide's own text, which already sits under NAME. It is a
   * glance-level flag and nothing else: it was a shortcut into DOCUMENTATION's
   * GUIDES tab until the owner took that room off the sheet on 14 September
   * 2026, and a mark that opens a page that is not there is worse than a mark
   * that only marks.
   */
  if (wave.guide) out.push(mark("card-mark", "✎ "));

  /**
   * **A fault, since it stopped being one thing about the whole wave.** The
   * owner asked for it on 14 September 2026, with the pencil that made it
   * worth having: a wave may now place several, on rows of their own, and
   * nothing in the list said so. The title names the kinds and the rows they
   * are placed on — which is the one thing about a fault a glance cannot get
   * from the map without opening the wave (`sim/fault-placed.ts`).
   */
  if (wave.faults?.length) {
    const m = mark("fault-mark", "⚠ ");
    m.title = wave.faults
      .map((f) => `${f.kind.toUpperCase()} from beat ${f.at ?? 0}${lengthOf(f)}`)
      .join(", ");
    out.push(m);
  }
  return out;
}

/** How long a placement holds, as words — and nothing at all for one that
 * holds to the end, which reads better as the absence of a limit. */
function lengthOf(f: { beats?: number }): string {
  return f.beats === undefined || f.beats === 0 ? " to the end" : ` for ${f.beats}`;
}

function mark(className: string, glyph: string): HTMLElement {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = glyph;
  return span;
}
