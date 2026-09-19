import { type LeadState, leadGrippable, leadHolding } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";

/**
 * **What THE LEAD is asking of the navigator's thumb while it stands still**,
 * and the one silence beside the two words.
 *
 * Its own file on `surge-word.ts`' terms rather than in the reading next door:
 * `boss-cue-read-c.ts` is at its limit and is being split by another lane, and
 * a word argued at this length inside a switch over nine bosses is a file that
 * grows by a paragraph every time a boss learns a gesture. What is left there
 * is one call.
 *
 * **Every word here is the navigator's**, because every word here stands on
 * the stalk and the stalk is only a body on her screen — on his it is a
 * readout in the middle of the field, and a word pinned to it would name a
 * place that is nowhere (`lead-shape.ts`, and the same objection the reading
 * already makes about `s.col`).
 *
 * **`HOLD` is the gesture's own name**, on the ring while the still may still
 * be taken (`leadGrippable`, `lead-grip.ts`). It is the first word this fight
 * has ever put on a thumb: THE LEAD shipped answered entirely on the panel,
 * and a handle nobody is told about is a handle nobody takes.
 *
 * **`BURN` while she holds it**, which is the same word the pass already
 * carries and deliberately so. Her hand is not doing anything to the body —
 * `leadShootable` is false through the whole still and no bolt is registered
 * (`sim/lead-shot.ts`) — it is buying the beam the beats it needs to fill,
 * and the beam is his. So the word on her screen is the one she says out
 * loud, and it is the same one she will say again when it passes: *burn*,
 * then *up*, and the fight ends in the column she is the only one who can
 * see.
 *
 * **The silence is the still she has already spent.** Once the stalk has been
 * let go of or has torn out of her thumb, `freeBeat` is set and it passes on
 * the next beat whatever anyone does (`sim/lead-step.ts`): a verb the game is
 * about to refuse is worse than no verb, which is `boss-cue.ts`'s first rule,
 * and `STILL` there would be the field naming a state rather than a gesture.
 * The word that used to stand through the whole still is the word the
 * grippable half now carries.
 *
 * **No number, in either direction.** How long she has left is the ring's
 * dial and hers alone; how full the beam is, is his gauge and his alone.
 * Neither word is derived from the other seat's glass, which is the care
 * `surge-word.ts` takes at the same verb.
 */
export interface LeadWord {
  kind: BossCue["kind"];
  word: string;
}

/** The stalk on offer, and the beam it is being held open for. */
const TAKE: LeadWord = { kind: "HOLD", word: "HOLD" };
const FILL: LeadWord = { kind: "HOLD", word: "BURN" };

/**
 * The one word the stalk carries this frame of a still, or nothing.
 *
 * The caller has already established that the body is standing still; what is
 * left is which half of the still this is. Read in the order a thumb meets
 * them: a stalk that may be taken, a stalk that is being held, and a still
 * that is spent.
 */
export function leadWord(s: LeadState): LeadWord | null {
  if (leadHolding(s)) return FILL;
  if (leadGrippable(s)) return TAKE;
  return null;
}
