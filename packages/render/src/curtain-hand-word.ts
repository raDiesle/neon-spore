import type { CurtainState, World } from "@neon-spore/sim";
import { curtainCues } from "./boss-cue-read.js";
import { type BossCue, cueSeen } from "./boss-cue-shape.js";
import { cueWordY } from "./boss-cue-text.js";
import type { Layout } from "./layout.js";

/**
 * **Where the hand ring's word goes under THE CURTAIN's sheet**, so it is never
 * written over the cue's.
 *
 * The ring hangs on the sheet's middle with its word a line under it
 * (`grip.ts`), and `SHOVE` or `LIFT` stands on the same middle with its verb
 * under the frame (`boss-cue-read.ts`). The two drops came out within a pixel
 * of each other, so a hand on the sheet read `SHOVEPULL`, `BOSHOVULL` — on the
 * navigator's screen, at THE CURTAIN, 7 October 2026. The cue's verb keeps its
 * place, since it is the instruction; the hand's word, which says who is doing
 * it, steps a line below whenever the two would meet.
 *
 * Widths are Courier's: every glyph advances the same share of its size, so a
 * box is known from the word alone, with no canvas to measure on.
 */

/** Courier New's advance, as a share of the font's size. */
const ADVANCE = 0.6;
/** The hand's word: its size, and the plate's padding and reach about the baseline (`drawLabel`). */
const HAND_SIZE = 9;
const HAND_PAD = 8;
const HAND_ABOVE = 8;
const HAND_BELOW = 3;
/** The cue's verb: its size and its reach about the baseline (`WORD_FONT`). */
const CUE_SIZE = 11;
const CUE_ABOVE = 9;
const CUE_BELOW = 3;
/** Clear pixels between the verb and the plate under it. */
const GAP = 1;

/** A word's box, in canvas pixels. */
export interface WordBox {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** The plate the hand's word is written on, centred at `x` on baseline `y`. */
export function handWordBox(text: string, x: number, y: number): WordBox {
  const half = (text.length * HAND_SIZE * ADVANCE + HAND_PAD) / 2;
  return { left: x - half, right: x + half, top: y - HAND_ABOVE, bottom: y + HAND_BELOW };
}

/** The cue's verb, where `drawCueText` writes it. */
export function cueWordBox(cue: BossCue): WordBox {
  const y = cueWordY(cue);
  const half = (cue.word.length * CUE_SIZE * ADVANCE) / 2;
  return { left: cue.x - half, right: cue.x + half, top: y - CUE_ABOVE, bottom: y + CUE_BELOW };
}

/** Whether two boxes share any pixel. */
export function wordsMeet(a: WordBox, b: WordBox): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

/** The cue this screen is shown for THE CURTAIN, the first it may see (`bossCue`'s rule). */
export function curtainCueSeen(l: Layout, world: World, c: CurtainState): BossCue | null {
  return curtainCues(l, world, c).find((cue) => cueSeen(cue, l.role)) ?? null;
}

/**
 * The baseline for the hand's word `text` at `x`: `under`, where `grip.ts` would
 * put it, unless this screen's cue verb is there — then a line under the verb.
 */
export function curtainHandWordY(
  l: Layout,
  world: World,
  c: CurtainState,
  text: string,
  x: number,
  under: number,
): number {
  const cue = curtainCueSeen(l, world, c);
  if (cue === null) return under;
  const verb = cueWordBox(cue);
  if (!wordsMeet(handWordBox(text, x, under), verb)) return under;
  return verb.bottom + GAP + HAND_ABOVE;
}
