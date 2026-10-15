/**
 * **A wave's fields for the director alone** — the game never reads them.
 *
 * Their own file because `wave-types.ts` reached its length limit the day a
 * second one arrived, and because the line between what the game plays and
 * what an author keeps for themselves is worth drawing where it can be seen.
 */
export interface WaveAuthoring {
  /**
   * **Grouped under the wave above it** in the director's wave list. The
   * owner, 11 October 2026: the waves that vary one which introduces
   * something fold under it, so that one stays visible; a wave is made one by
   * dragging it onto another. A variant belongs to the nearest wave above it
   * that is not one; play order is list order. A boss and the first wave are
   * never variants (`tools/director/src/rail-groups.ts`).
   */
  variant?: true;
  /**
   * **The author's note on this wave**: what to check, what is to do, what
   * is unusual and should be fixed or improved. The owner, 15 October 2026,
   * asked for it beside the measured numbers; it is written under NAME in
   * WAVE SETTINGS and read first in DOCUMENTATION › WAVES' Notes column
   * (`tools/director/src/waves-table.ts`).
   */
  note?: string;
}
