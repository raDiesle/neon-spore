import type { Layout } from "./layout.js";

/**
 * How the siren's words are placed — the record VERSUS offers answers through
 * (`siren:words`, opened 17 October 2026, when the owner asked where the help
 * text should go: for each player or for both, plain about whose it is, easy
 * to read, and out of the way of what is coming down the field).
 *
 * The shipped answer is `siren.ts`'s `drawDuty`: this seat's word alone,
 * small and dim, centred under the bar. With nothing here that is what is
 * drawn. `paint` replaces it and is handed both seats' words, so an answer may
 * show one or both. The bar and the two chips are drawn before it and are not
 * its business. The game patches nothing here.
 *
 * Its own file, importing nothing it would have to draw with, so a candidate
 * can reach it without pulling in the siren's whole import graph.
 */
export interface SirenWordsAt {
  /** The screen — its width, and whose seat it is (`l.role`, already traded
   * back under THE HANDOVER; `test` is both seats at once and nobody's own). */
  l: Layout;
  /** The bar's middle. */
  cx: number;
  cy: number;
  /** Each chip's middle across and its width; both are level with the bar. */
  chips: { p1: { x: number; w: number }; p2: { x: number; w: number } };
  /** How tall a chip is: its top and bottom are `cy` ∓ half of it. */
  chipH: number;
  /** The word each seat owes this beat, or null. */
  words: { p1: string | null; p2: string | null };
  /** The one word the shipped siren writes on this screen. */
  word: string | null;
  /** The host's clock, for anything that breathes. */
  time: number;
}

export interface SirenWordsLook {
  /** The words, or nothing for the shipped line under the bar. */
  paint?: (ctx: CanvasRenderingContext2D, at: SirenWordsAt) => void;
}

export const SIREN_WORDS: SirenWordsLook = { paint: undefined };
