import { controlSet, DEFAULT_CONTROL_SET_ID, firstOnPanel, type Wave } from "@neon-spore/content";

/**
 * The small glyphs in front of a wave's name in the rail: a boss, a panel, a
 * guide.
 *
 * Split out of `rail.ts` on line count, and the seam is the honest one — next
 * door is the list and the fields and what editing one does, and this only
 * reads a wave and says what is remarkable about it at a glance.
 *
 * Each mark stays its own span and its own glyph rather than being folded into
 * one, so a fourth is one more block here and not a rewrite of the row.
 */
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
   * copy of the guide's own text, which already sits under SENTENCE. It is a
   * glance-level flag and nothing else: it was a shortcut into DOCUMENTATION's
   * GUIDES tab until the owner took that room off the sheet on 14 September
   * 2026, and a mark that opens a page that is not there is worse than a mark
   * that only marks.
   */
  if (wave.guide) out.push(mark("card-mark", "✎ "));
  return out;
}

function mark(className: string, glyph: string): HTMLElement {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = glyph;
  return span;
}
