import { type SimConfig, type SurgeState, surgeHeld, surgeInBand } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";

/**
 * **What THE SURGE is asking of one thumb**, and the three silences beside the
 * one that shipped.
 *
 * It lives beside `surge-grip.ts` rather than with the readings for the reason
 * that file gives about the marks: the word stands on the grip mark, and the
 * mark rides the bulb's swell and the vent's sink, which are the drawing's own
 * and not `World`'s. It is `sinew-word.ts`'s arrangement at the other verb —
 * this boss and that one are the same split read from opposite ends
 * (`bosses-choreographed.md` §9), and they are the two in the game whose every
 * candidate word is a number in disguise.
 *
 * **`HOLD` shipped with the marks and is right.** A thumb anywhere on the bulb
 * charges it a step a beat, and nothing on either band says so — the bulb is a
 * `DragTarget` out on the field, not a lobe, so THE SINEW's `PULL` on a free
 * ring is exactly the case. The word is the kind, which `boss-cue-text.ts`
 * draws as one line.
 *
 * **What was missing is the lift, which is the whole boss.** The only gesture
 * that counts is both thumbs off the glass within one beat of each other with
 * the pressure at the notch (`sim/surge-hand.ts`), and every other hold in this
 * game has trained the pair out of it: the grip, the lance's fill, the ready
 * gate and the warden's tether are all rewarded for lasting. A boss answered by
 * letting go had nothing on the field about letting go. So `LIFT`, in THE
 * STARE's `STILL`, on a thumb that is **on** while the pressure is inside the
 * band — no member of `DragTarget` says *release*, which is why that kind
 * exists (`boss-cue.ts`).
 *
 * **Neither word carries a number, and that is the whole care in this file.**
 * The pilot is shown where the notch's band sits and not the pressure; the
 * navigator the pressure and not the band (`showsSurgeNotches`,
 * `showsSurgePressure`). So *harder*, *nearly* and *you are over* are the whole
 * encounter, and the field says none of them in either direction — a word
 * derived from the pressure is her gauge read out for him, and one derived from
 * the band is his.
 *
 * - **`LIFT` is safe because *inside the band* is already told to both.** The
 *   pressure arriving there throws a burst at the bulb on every screen and
 *   opens THE SLOW (`surgeNear`, `surge-fx.ts`), so the word adds no reading to
 *   either glass. What it adds is the verb, and it is `sinewEnter`'s pips a
 *   second time: the fact is shared, the instinct is not.
 * - **`HOLD` does not tell *under* the band from *over* it**, and that is
 *   deliberate rather than lazy. A word that went out at the band's top would
 *   be the gauge itself, told by its own absence, to the seat who cannot see
 *   it. Over the band a thumb is useless rather than refused and the game takes
 *   the press, which is what saying no number costs here.
 *
 * **The rock the bulb spits is a third word, and only the pilot gets it.**
 * From its first notch the bulb spits a rock down its own columns every
 * `surgeRockBeats` beats it has both thumbs on it (`sim/surge-rock.ts`), and
 * the only thing that answers a rock is the shield, which is the pilot's.
 * So he is told `SHIELD` and she is told nothing new — she cannot ward, and
 * a word telling her about a rock she has no answer to is the second prompt
 * system this family exists to close.
 *
 * **Neither seat has to let go of the bulb for it.** The bulb is out on the
 * field and the shield is on the panel, so the ward is the pilot's other
 * thumb and the charge goes on climbing under the two that are already down.
 * That is the shipped fight and not a concession: wave 78 sends four ordinary
 * rocks of its own while the pair is holding (`content/waves/act-7g.ts`), and
 * the bulb's is the same rock arriving on the boss's clock instead of the
 * wave's.
 *
 * **`SHIELD` is the target's own name**, numberless like the other two and
 * inside the fifty words of English a pair is assumed to share
 * (`.claude/skills/new-boss` §2).
 *
 * **It outranks the charge and never the lift.** A hull is worth more than a
 * step of pressure, so `SHIELD` takes the place of `HOLD` and fills both of
 * this seat's silences; but a rock falls for ten beats and a band is open for
 * one, so `LIFT` stays where it is. A screen saying `SHIELD` at the seat who
 * has one beat to lift would cost the notch to save a hull that had nine
 * beats left.
 *
 * **Three silences, and the rock fills two of them on one mark.** A thumb
 * already on outside the band, and a thumb already off inside it:
 * `gripBrakes`' rule both ways round, and the second is a seat whose half of
 * the lift is done — `liftTick` is waiting on the *other* hand, and a word
 * telling this one to let go of nothing is the second prompt system this
 * family exists to close. And nothing at all while the bulb refuses a thumb,
 * which is `surge-grip.ts`'s `refusing` and the first of `boss-cue.ts`'s
 * three rules: a verb the game is about to refuse is worse than no verb —
 * and that one the rock does not fill either, for the same reason.
 */
export interface SurgeWord {
  kind: BossCue["kind"];
  word: string;
}

/** The charge that is on offer while a thumb is off, and the lift once it counts. */
const CHARGE: SurgeWord = { kind: "HOLD", word: "HOLD" };
const LIFT: SurgeWord = { kind: "STILL", word: "LIFT" };
/**
 * The rock in the air, on the one seat that can answer it.
 *
 * **Not drawn under its mark**, the one word here that is not (`surgeWordX`,
 * `surge-grip.ts`). The rock is spat from the row under the bulb in a column
 * the bulb covers, so a word under the grip mark was printed across the body
 * it names: at the spit beat the rock's highlight ate two glyphs and it read
 * `SHIE D` (21 September 2026). It ends just clear of the bulb's columns on
 * the mark's own side instead, where no rock of the bulb's falls.
 */
export const SHIELD: SurgeWord = { kind: "PRESS", word: "SHIELD" };

/**
 * The one word this seat's grip mark carries this frame, or nothing.
 *
 * Read top down, and the order is what it costs to be wrong: the lift is one
 * beat and takes both thumbs, so nothing displaces it; a rock of the bulb's
 * in the air is the hull, so it displaces the charge on the pilot's mark and
 * fills both of his silences; and the two words left are the two ways the
 * thumb and the band agree, the two silences the two ways they do not — a
 * thumb on inside the band is the lift, a thumb off outside it is the charge,
 * and the other pair is a seat already doing its half or with no half left to
 * do.
 */
export function surgeWord(
  cfg: SimConfig,
  s: SurgeState,
  player: 1 | 2,
  refusing: boolean,
  warding: boolean,
): SurgeWord | null {
  if (refusing || s.outBeat >= 0) return null;
  const held = surgeHeld(s, player);
  const band = surgeInBand(s, cfg);
  if (held && band) return LIFT;
  if (warding && player === 1) return SHIELD;
  if (held !== band) return null;
  return CHARGE;
}
