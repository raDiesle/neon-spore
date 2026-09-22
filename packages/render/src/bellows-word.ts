import {
  type BellowsState,
  bellowsDepthMilli,
  bellowsHeld,
  bellowsLast,
  bellowsTurn,
  type SimConfig,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";

/**
 * **What THE BELLOWS is asking of one thumb**, and the four silences beside
 * the three words.
 *
 * It lives beside `bellows-grip.ts` for `surge-word.ts`'s reason: the word
 * stands on the bar, and the bar rides the chamber's own fill and the depth
 * the thumb has carried it to, which are the drawing's and not `World`'s. So
 * the reading is here rather than a `case` in `boss-cue.ts`, and the cue is
 * hung where the handle is drawn (`bellows-handle.ts`) — THE SINEW's, THE
 * SURGE's and THE ANTIPHON's arrangement, and the one that cannot draw a word
 * at a rail the same frame put somewhere else.
 *
 * **The words are the two verbs the boss is made of and nothing besides.**
 * `PULL` on his beat, `PUSH` on hers, in `CARRY`: the gesture is the bar taken
 * down its rail past the notch, which is what that kind says. Neither says a
 * column, a count or a beat left — the window the third exchange runs under is
 * the pair's to feel, and a word counting it down is the clock read out loud
 * (`.claude/skills/new-boss` §2).
 *
 * **The finale is THE SURGE's lift, word for word, and it is the same gesture.**
 * The last seam parts when both hands come off within a beat of each other
 * (`sim/bellows-hand.ts`), and every hold this game has trained the pair on is
 * rewarded for lasting. So a seat with its hand off is told `HOLD` and a seat
 * with its hand on is told `LIFT`, in `STILL` — no member of `DragTarget` says
 * *release*, which is why that kind exists (`boss-cue.ts`). Both seats are
 * told at once, and that is the point: eleven beats of being told not to act
 * together, and then both bars say the same word.
 *
 * **The four silences.**
 *
 * - **Not this seat's beat.** The other seat's stroke is the jam and the one
 *   fault in the fight, so a word on the wrong bar would be the field asking
 *   for the mistake. Its own bar is drawn unlit at the same time
 *   (`bellows-handle.ts`), which is the same fact said twice on purpose: one
 *   is the picture, one is the verb.
 * - **A jam, the vent, the opening still and a seam parting**, and they come
 *   out of the same test rather than a list of their own: `bellowsTurn` names
 *   no seat in any of the four, which is what *the lung is waiting on nobody*
 *   means. Three of them refuse a thumb outright (`bellowsTakesHand`), and a
 *   verb the game is about to refuse is worse than no verb —
 *   `boss-cue.ts`'s first rule. The fourth is the waist doing the talking.
 * - **A bar already carried past the notch.** The stroke is an *edge* across
 *   `bellowsWorkMilli` and a second one needs the hand lifted and brought
 *   down again, so a seat holding at the bottom has done its half and cannot
 *   do it again from there. `gripBrakes`' rule, and THE SURGE's second
 *   silence exactly: a word telling a thumb to do what it is already doing is
 *   the prompt system this family exists to close.
 */
export interface BellowsWord {
  kind: BossCue["kind"];
  word: string;
}

/** The stroke each seat owns, and the two halves of the finale. */
const PULL: BellowsWord = { kind: "CARRY", word: "PULL" };
const PUSH: BellowsWord = { kind: "CARRY", word: "PUSH" };
const GRIP: BellowsWord = { kind: "HOLD", word: "HOLD" };
const LIFT: BellowsWord = { kind: "STILL", word: "LIFT" };

/**
 * The one word this seat's bar carries this frame, or nothing. Read top down,
 * and the order is what it costs to be wrong: the finale takes both seats and
 * nothing displaces it, and everything under it is the alternation, which
 * names one seat at a time or nobody at all.
 */
export function bellowsWord(cfg: SimConfig, s: BellowsState, player: 1 | 2): BellowsWord | null {
  if (bellowsLast(s)) return bellowsHeld(s, player) ? LIFT : GRIP;
  if (bellowsTurn(s) !== player) return null;
  if (bellowsDepthMilli(s, player) >= cfg.bellowsWorkMilli) return null;
  return player === 1 ? PULL : PUSH;
}
