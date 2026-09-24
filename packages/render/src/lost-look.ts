import type { Layout } from "./layout.js";
import { shutVeil } from "./lost-shut.js";
import { words } from "./lost-words.js";

/**
 * THE ONE RECORD A CANDIDATE **LOST SCREEN** WOULD PATCH.
 *
 * `guide-look.ts`'s kind and its precedent exactly: the chrome over a held
 * field, offered as whole paint functions rather than as numbers, because
 * every answer to "what does this screen look like" redraws the screen rather
 * than retuning it.
 *
 * **What ships here is `shut`**, which the owner took on 17 September 2026
 * out of the four the slot was reopened with: two heavy plates slide in over
 * the field, one from the top and one from the foot, and they close on
 * everything except the place the ship was hit, which is left as a ragged lit
 * hole (`lost-shut.ts`, `lost-wound.ts`). Its words came from `shutters`,
 * taken the day before, and are `lost-words.ts` now. Both moved out of their
 * candidates whole rather than being retyped, which is how a function is taken
 * — a `paint` cannot be written back into a record by `versus adopt`, because
 * `toString` hands back what the transpiler made and not how the file spells
 * it.
 *
 * **The slot is shut.** It was reopened once more with four answers to what
 * should run down the glass, and on 22 September 2026 the owner dropped all
 * four and took the question away with them: nothing runs down the glass any
 * more, and what moves is the blood out of the hole. The seam stays because
 * the seam is what let that be decided in one command rather than in a rewrite.
 *
 * **The tension every answer in this slot has to resolve** is the one
 * `lost-screen.ts`'s own header states: the field stays under this screen,
 * greyed, *with the breach still where it was seen*, because the point of the
 * pause is that the pair look at where it got through. A full-screen statement
 * that covers that is a full-screen statement that takes the lesson away. So
 * the paint is told where the breach is, and an answer is expected to be a
 * treatment the breach column is a hole in rather than a card over it.
 *
 * **The buttons are not in this record.** RETRY WAVE, TUTORIAL AGAIN and QUIT
 * are drawn by `lost-screen.ts` at boxes `lostButtons` hands out, and
 * `apps/game/src/lost.ts` hit-tests the same boxes — a candidate that moved
 * them would move the picture and not the thumb. What an answer owns is
 * everything above them, and `buttonsY` is still the top of the lot however
 * many there are.
 */
export interface LostPaint {
  readonly l: Layout;
  /** Seconds the screen has been up; the words fall in over the first of them. */
  readonly age: number;
  /** Which wave, 1-based, what it is called, and which try this was. */
  readonly wave: number;
  readonly name: string;
  readonly tries: number;
  /**
   * Where the hull was broken, in pixels, or null when nothing scarred it — a
   * wall earths through the dome and leaves no mark on the skin at all
   * (`breachUnscarred`). An answer that cuts a hole in itself has nowhere to
   * cut one on those waves and has to say something else.
   */
  readonly breachX: number | null;
  /** The hull's own line, so a hole can be cut around the place rather than
   * around the column. */
  readonly hullY: number;
  /**
   * **What broke it**, or null on the waves that scar nothing — the same case
   * `breachX` has and always the same answer as it.
   *
   * The three numbers `StrikePaint` takes that are facts about the hit rather
   * than about the frame it is drawn on, so an answer can replay the breach
   * where it happened: how wide the thing was, the colour it arrives in
   * (`breach-hue.ts`) and the seed that decides a tear from a blow
   * (`breach-either.ts`). The fourth, `t`, is the answer's own — the point of
   * replaying it here is that this screen runs a clock the field's strike
   * does not, and one may want the char held for the whole minute the pair
   * spend looking at it.
   */
  readonly breach: { readonly span: number; readonly hex: string; readonly seed: number } | null;
  /**
   * The ship's drawn surface, sampled at any x — `hull-shock.ts`'s one
   * decision, which every breach picture already rides. Flat at `hullY` when
   * the caller has no membrane to hand, which is the takeover's case and the
   * tests'.
   */
  readonly surfaceY: (x: number) => number;
  /** The top of whatever is drawn under the answer: the buttons' own box. An
   * answer must leave this alone (`lost-screen.ts`). */
  readonly buttonsY: number;
}

export interface LostLook {
  /** What covers the held field. */
  readonly veil: (ctx: CanvasRenderingContext2D, p: LostPaint) => void;
  /** What it says, above the buttons. */
  readonly words: (ctx: CanvasRenderingContext2D, p: LostPaint) => void;
}

export const LOST_LOOK: LostLook = { veil: shutVeil, words };
