import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * THE BEATBOX's three, in a file of its own — `bind-choir.ts` is the pattern
 * and this is the fourth of them: one arrival taken apart, cut out because
 * `bind-creatures.ts` next door is at its length limit, and because every one
 * of these is about a **rhythm** rather than about a shot.
 *
 * That is what makes the group worth keeping together, and it is `bind-choir`'s
 * argument one creature on. Everything in `bind-creatures.ts` is the ear's
 * account of something that met a body. These three are the ear's account of
 * *counting*: one more, that is the lot, or that was not the lot. The ear is
 * doing more work here than anywhere else in this game — a run is a thing you
 * hear yourself making — so the three sounds are deliberately a set rather
 * than three unrelated noises.
 *
 * **A step in pitch per tap, and it is the point of the cue.** The navigator
 * is the only seat that knows how many taps have landed, because the tally is
 * on their screen alone; a run that sounded identical every time would make
 * them read a number off the glass on every beat instead of listening. So the
 * pitch climbs with `hits` and the ear carries the count — which is the one
 * place in this game where a sound is doing a *player's* arithmetic for them,
 * and it is allowed because the number it is counting is the number they
 * pressed themselves. It never says how many are wanted.
 */

/** How much of a semitone-ish step each tap adds. A twelfth per tap, so a run
 * of four climbs a third overall: plainly rising, and nowhere near enough to
 * turn the fourth tap into a different sound from the first. */
const STEP_PER_HIT = 1 / 12;

export function beatboxCue(
  e: Extract<SimEvent, { type: "beatboxTap" | "beatboxWave" | "beatboxSilent" }>,
  cols: number,
  rows: number,
): Cue | null {
  const pan = panForCol(e.col, cols);
  // The row, and then the run on top of it. Both matter and they are different
  // facts: where the box is on the field, and how far into it the thumb has
  // got. Multiplied rather than added because `pitch` is a multiplier on every
  // frequency in the sound (`bind-cue.ts`), so a run near the hull climbs by
  // the same *interval* as one at the top of the field rather than by the same
  // number of hertz.
  const climb = pitchForRow(e.row, rows) * (1 + e.hits * STEP_PER_HIT);
  switch (e.type) {
    case "beatboxTap":
      // A body growing over two beats and shrinking over one — which is
      // literally the blurb of the sound that has been sitting spare in the
      // catalogue since THE THROB stopped swelling (`sounds/creature.ts`).
      // *Timing you can hear* was written about a creature that no longer
      // needs it and is the whole of what this one is.
      return { id: "creature.throbSwell", pan, pitch: climb };
    case "beatboxSilent":
      // Two clicks a hair apart, closing into one: the sound of a thing that
      // was counting and has stopped agreeing to differ. It is deliberately
      // **not** an ordinary kill cue — nothing was shot, and a pair who heard
      // a body burst would learn that a box is answered the way a slick is.
      return { id: "beat.lock", pan, pitch: climb };
    case "beatboxWave":
      // The click with its low body detuned flat, dragging behind itself. What
      // failed here is a *count*, not an aim, and this is the one sound in the
      // catalogue that says so — the global beat is still right and this is
      // not on it.
      //
      // Deliberately not a hull cue, on `choirSing`'s terms exactly: the
      // `breach` beside it already plays the damage, and this is the thing
      // that did it. A pair who could not tell the two apart would not know
      // they had miscounted rather than let something land.
      return { id: "beat.drift", pan, pitch: pitchForRow(e.row, rows) };
  }
}
