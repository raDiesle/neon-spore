import {
  type SimConfig,
  type SinewState,
  sinewBandMilli,
  sinewHeld,
  sinewInZone,
  sinewZone,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";

/**
 * **What THE SINEW is asking of one hand**, and the three silences that are the
 * fight.
 *
 * It lives beside `sinew-handles.ts` rather than with the other readings for the
 * reason that file gives about the ring: the word stands where the handle is
 * drawn, and the handle's place is a whip the simulation cannot see
 * (`boss-cue.ts`, `decisions.md` #34). What it does not have room for is the
 * argument, which is all of the below — so the choosing is here and the drawing
 * is there, the seam `sinew-band.ts` keeps from `sinew-draw.ts`.
 *
 * **The magnitude is never said, and that is not an omission.** This is the one
 * boss answered in a *number*: the pilot is shown where on the band a fibre
 * parts and not where the pulls have got to, the navigator the other way round
 * (`showsSinewZone`, `showsSinewSum`), and each has to be told the half they
 * cannot see. So *harder*, *ease off*, *you are over* are the whole of this
 * encounter and the field says none of them, in either direction — a word
 * derived from the sum on his screen is her gauge read out for him, and one
 * derived from the zone on hers is his. It is THE VANE's fold again
 * (`boss-cue-read-b.ts`): the answer in the purest form this game has.
 *
 * **Two moments it may speak in, because neither leaks a number.**
 *
 * - **`HOLD`, while the sum is inside the zone.** *In* is a fact the simulation
 *   tells both seats already — the collar's rim comes up and a pip lights per
 *   beat (`sinew-band.ts`, `sinewEnter`) — so the word adds no number to either
 *   screen. What it adds is the verb, and the verb is the one a pair pulling
 *   toward a target gets wrong: the instinct on a pip is to keep going, and
 *   `sinewHoldBeats` of *not* moving is what parts a fibre.
 * - **`LIFT`, once no pull can reach the zone any more.** From
 *   `sinewDecayFibres` parted the tendon goes slack under a hand and the sum
 *   creeps down while anybody holds; only **both** letting go resets it
 *   (`sim/sinew-step.ts`). That is the one mechanic in this fight nobody can
 *   diagnose from a screen: she watches her own gauge fall with her hand
 *   perfectly still, and he is shown nothing at all. The word waits until the
 *   band's whole top less the slack is under the zone's foot, which is the beat
 *   pulling harder stops being an option — before that it still is, and a field
 *   that chose between *harder* and *let go* would be choosing the number.
 *
 * `STILL` is its kind, THE STARE's fifth (`boss-cue.ts`): what the fight wants
 * is a thumb off the glass, and no member of `DragTarget` says *release*.
 *
 * **And `LIFT` takes the free hand's word away with it.** Only *both* hands off
 * resets the slack (`sim/sinew-hand.ts`), so a hand already off is the half of
 * the answer that is done: the pull it would otherwise be offered is the one
 * thing that would stop the other hand's release from working, and two seats
 * reading `PULL` and `LIFT` at the same moment is the field arguing with itself.
 * Off the ring there it says nothing, and what fixes the fight is her thumb.
 *
 * **And nothing while the handles are swinging.** A snap-back throws both hands
 * off for `sinewSnapBeats` and no hand takes hold in them, so a word there would
 * be a verb the game is about to refuse — the first of `boss-cue.ts`'s three
 * rules, which is the whole reason a cue carries a seat.
 *
 * **`SWAY` is the one word a hand already on is owed**, and the shipped reading
 * withheld it from exactly that hand: the walk asks for *both* hands carried the
 * same way past `sinewSwayMilli` (`sinew-step.ts`), so a word that went out the
 * moment a thumb landed was a word for nobody. Which way is never said — two
 * hands have to agree on a direction, which is the fall's whole sentence.
 */
export interface SinewWord {
  kind: BossCue["kind"];
  word: string;
}

/** The pull that is on offer while nobody holds, and the steer once it falls. */
const FREE: SinewWord = { kind: "CARRY", word: "PULL" };
const SWAY: SinewWord = { kind: "CARRY", word: "SWAY" };
const HOLD: SinewWord = { kind: "HOLD", word: "HOLD" };
const LIFT: SinewWord = { kind: "STILL", word: "LIFT" };

/**
 * The one word this seat's handle carries this frame, or nothing.
 *
 * The beaten boss first, then the falling mass — at that point the tendon is
 * gone and the sum is not read at all (`sinew-step.ts`) — then the swing, then
 * the slack, which speaks to a hand on and silences a hand off, and last the
 * hand itself: off the ring there is only the pull to offer, and on it the hold
 * and otherwise the pair's own conversation.
 */
export function sinewWord(
  cfg: SimConfig,
  s: SinewState,
  player: 1 | 2,
  falling: boolean,
  swinging: boolean,
): SinewWord | null {
  if (s.outBeat >= 0) return null;
  if (falling) return SWAY;
  if (swinging) return null;
  // Whether a pull can still reach the zone at all: both hands at their reach,
  // less the slack, against the zone's foot.
  const spent = sinewBandMilli(cfg) - s.slackMilli < sinewZone(s, cfg).low;
  if (!sinewHeld(s, player)) return spent ? null : FREE;
  if (spent) return LIFT;
  return sinewInZone(s, cfg) ? HOLD : null;
}
