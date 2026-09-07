import type { CreatureDef } from "./creatures.js";

/**
 * THE BEATBOX's row, cut out of `creatures-table.ts` when it took that file
 * past its 250-line limit — on `creatures-fixtures.ts`'s terms rather than
 * `creatures-bare.ts`'s or `creatures-worn.ts`'s, because this kind fits
 * neither seam those files are cut along: it wears nothing and is not a fact
 * about size or place, it is an ordinary arrival a wave authors like any
 * other, and it happens to be the only one of those with an empty panel.
 *
 * Named one by one rather than spread, the way the fixtures are, because it
 * is the only entry here — `creatures-table.ts` still reads `beatbox:
 * BEATBOX_CREATURE`, so the table's own key order is untouched.
 */
export const BEATBOX_CREATURE: CreatureDef = {
  kind: "beatbox",
  // **Empty, and the whole creature is stated by what is not here.** A box is
  // answered by a thumb on the body, on the beat, and a thumb on the field is
  // not a `ControlGroup` — that union is aim and guard, *the two things a
  // wave may be missing*. THE MAGNET's row makes this argument about a hand
  // and THE CHOIR's about a shake; this is the first body where the gesture
  // is not the second half of the answer but the whole of it, so there is
  // nothing left over to demand of a panel. A wave carrying one may show any
  // panel it likes, and the wave that introduces it shows the ordinary pair
  // because the bodies standing beside the box want the cannon.
  controls: [],
  // None, and none ever authored. A colour in this game means *which trigger
  // kills it*, and no trigger does — so one here would be a sentence the pair
  // reads off the body and can never act on, which is worse than a drift: it
  // is a lie the silhouette tells. THE CHOIR's blank while it is three dots,
  // made permanent.
  color: null,
  // **The pilot's strip**, and the rule crossing the controls once more
  // rather than an exception to it. The count is drawn on the pilot's screen
  // and the pilot has no thumb that reaches a box; the navigator holds the
  // only thumb and is shown a tally of their own taps and never a target. So
  // the seat that is warned is the seat that has to *say* something, which is
  // the same shape THE MAGNET and THE CHOIR already have — with the
  // difference that here what is said is a bare number.
  radar: "p1",
  blurb:
    "A rounded soundbox that swells on every beat and asks for a number of them. Nothing the cannon carries touches it. Player 2 taps the body itself, once a beat, on the beat, and the run is committed by *stopping* — the first beat that goes by untapped is the beat it is judged on. The number is drawn on player 1's screen and on nobody else's. Right and it goes quiet; wrong and it puts a wave of sound through the hull and keeps falling for another try.",
};
