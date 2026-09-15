/**
 * THE LIMPET's and THE LEECH's number: how long a control may stand still with
 * one on it before the round is lost (`harpoon.ts`).
 *
 * **It was four numbers and is one.** The other three were the creature's — a
 * fuse in whole beats for each kind and a count of moves that shook it off —
 * and they went with the creature on 15 September 2026, when the owner ruled
 * that these two exist only as a pencil placed on the map. They are named on
 * `docs/spec/ideas.md` along with the fall they belonged to.
 *
 * `SimConfig` extends this rather than nesting it, for `config-choke.ts`'
 * reason next door: every call site still reads `cfg.harpoonStillBeats`, and
 * the split is only about how much of one file a reader has to hold at once.
 */
export interface ClingConfig {
  /**
   * **Beats a control may stand still with a harpoon on it before the round is
   * lost** — the cannon under a leech, the plate under a limpet, one number for
   * both because the owner asked for exactly that: *the same `SimConfig` field,
   * not a second literal*.
   *
   * One and a half, which is his own figure and is much shorter than the five
   * beats the creature's fuse was. That is the point of it: the creature was a
   * thing to notice and answer, and this is a thing to *keep* answering — at a
   * beat and a half the pair never stops sliding, and the seat that can see the
   * count spends the wave saying so.
   */
  harpoonStillBeats: number;
}

export const CLING_DEFAULTS: ClingConfig = {
  harpoonStillBeats: 1.5,
};
