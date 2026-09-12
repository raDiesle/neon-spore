/**
 * **The two bodies answered by a hand from each seat at once**, and the only
 * two in the game whose answer needs both people's thumbs on the same tick.
 *
 * Cut out of `creature-kinds.ts` for `creature-kinds-many.ts`' reason and at the
 * moment that file predicted: it was written with room for "the next creature",
 * and the next creature used it. The seam is the one `packages/content` already
 * cuts — `creatures-handed.ts` and `mechanics-handed.ts` hold the same family,
 * argued as a bestiary entry and as a mechanic — so the three files now name one
 * group rather than each drawing a line of its own.
 *
 * What holds them together is what does *not* answer them: neither control
 * reaches either, so a wave carrying nothing but these owes its panel nothing
 * (`categoryOf` reads that as `special`). What does answer them is two hands,
 * and the pair of them is the interesting part — a balloon draws both its pulls
 * on both screens, so what has to be said out loud is *which body*; a weight
 * draws a thumb only on the screen it belongs to, so what has to be said is
 * *when*. Two ways of splitting one gesture, and the next body answered by two
 * hands has a file to land in and two arguments to be measured against.
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself:
 * every consumer still walks the whole roster, which is what keeps a new kind a
 * compile error (`creature-roster.ts`, `kind-code.ts`).
 */
export type HandedKind =
  /**
   * The first body that does not come down at all, and the first that
   * neither control can touch. It appears out of nothing one row above the
   * ship, swells into the field, and then **climbs** — a row up and a column
   * across every beat, turning at the side walls — until it reaches the top,
   * where it bursts and the hull pays for it wherever the ship happens to be.
   *
   * Nothing on either panel reaches it. What does is **two hands at once**:
   * the pilot carries the handle on its left leftward, the navigator the one
   * on its right rightward, and while both are taut the skin gives. The
   * first rub splits it into two smaller balloons that climb on again; the
   * second pops each of them for nothing — so what the pair has to say out
   * loud is **which one, now**, the one thing several rising bodies cannot
   * answer for them. `balloon.ts` is the body and `balloon-pull.ts` the two
   * hands; `Creature.balloonSplits`, `balloonBeat`, `balloonDir`,
   * `balloonRise` and the two pulls are the whole of its state.
   */
  | "balloon"
  /**
   * **The body two thumbs crush, and neither thumb can see the other.**
   *
   * A heavy sac that comes down a row a beat like anything else and answers
   * nothing either panel can do: no bolt reaches it (`shot-reach.ts`) and the
   * shield has nothing to say to it (`isWardable`). What answers it is a hand
   * from **each** seat, on the body itself, at the same time — held for
   * `weightCrushMs` and it gives.
   *
   * **What makes it a creature rather than a second balloon** is where the
   * picture is. A balloon's two handles are one per seat, fixed in advance, and
   * *both screens draw both pulls* — the stretch is each player's readout of a
   * thumb they cannot see, so the pair negotiates **which balloon**. Here there
   * are no handles and no readout: a hand on a weight brightens it **on that
   * seat's screen only**, so neither player can tell whether their partner is
   * already pressing. The only thing left to coordinate with is a voice, and
   * the only word that works is **now**.
   *
   * The hand is the ordinary `grip`, not a gesture of its own — `handMeans`
   * calls it `"press"`, the third thing a hand can be, and `weight.ts` is the
   * rule. `Creature.weightPressTicks` is the whole of its state.
   */
  | "weight";
