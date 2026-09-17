import type { Layout } from "./layout.js";
import { shutVeil } from "./lost-shut.js";
import { words } from "./lost-shutters.js";

/**
 * THE ONE RECORD A CANDIDATE **LOST SCREEN** PATCHES.
 *
 * `guide-look.ts`'s kind and its precedent exactly: the chrome over a held
 * field, offered as whole paint functions rather than as numbers, because
 * every answer to "what does this screen look like" redraws the screen rather
 * than retuning it.
 *
 * **What ships here is `shut`**, which the owner took on 17 September 2026
 * out of the four the slot was reopened with: two heavy plates slide in over
 * the field, one from the top and one from the foot, and they close on
 * everything except the column the ship was hit in, which is left as a ragged
 * lit slot. It replaced `shutters`, taken the day before, which drew the same
 * sentence the other way round — plates drawing *back* to leave the lower half
 * open — and whose words still ship: `lost-shutters.ts` holds the stack, and
 * `lost-shut.ts` the plates. Both moved out of their candidates whole rather
 * than being retyped, which is how a function is taken — a `paint` cannot be
 * written back into a record by `versus adopt`, because `toString` hands back
 * what the transpiler made and not how the file spells it.
 *
 * **The tension every answer in this slot has to resolve** is the one
 * `lost-screen.ts`'s own header states: the field stays under this screen,
 * greyed, *with the breach still where it was seen*, because the point of the
 * pause is that the pair look at where it got through. A full-screen statement
 * that covers that is a full-screen statement that takes the lesson away. So
 * the paint is told where the breach is, and an answer is expected to be a
 * treatment the breach column is a hole in rather than a card over it.
 *
 * **The buttons are not in this record.** RETRY WAVE and QUIT are drawn by
 * `lost-screen.ts` at boxes `lostButtons` hands out, and `apps/game/src/lost.ts`
 * hit-tests the same boxes — a candidate that moved them would move the
 * picture and not the thumb. What an answer owns is everything above them.
 */
export interface LostPaint {
  readonly l: Layout;
  /** Seconds the screen has been up; the words fall in over the first of them. */
  readonly age: number;
  /** Which wave, 1-based, and which try. */
  readonly wave: number;
  readonly tries: number;
  /** How many times the pair has gone again in this run — which line they get. */
  readonly retries: number;
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
