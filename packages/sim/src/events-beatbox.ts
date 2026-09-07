/**
 * **What THE BEATBOX does**, as events: a tap landing on the beat, the wave
 * of sound a miscounted run sends at the ship, and the box going quiet.
 *
 * Its own file rather than two more arms of `events-creature.ts`, on the terms
 * every group there already states: that file is at its limit, and these three
 * are one arrival taken apart rather than three incidents that share a creature.
 *
 * **None of the three carries the count.** A cue is played on *both* phones
 * (`packages/audio/src/bind.ts`), and how many beats a box is asking for is
 * the one thing player 2 is not told — so an event with the number on it would
 * put the secret through the speaker of the phone in the navigator's hand, in
 * a room where the two of them are sitting next to each other. `wispHop` makes
 * exactly this argument about a column. What a tap is allowed to say is the
 * thing player 2 already knows because their own thumb did it: *that one
 * landed, and you are this many in*.
 */
export type BeatboxEvent =
  /**
   * A tap landed inside the beat's window and the run is one longer. `hits` is
   * how many have landed — the navigator's own tally, which is what render
   * draws over the box on that screen and what the ear steps in pitch.
   *
   * `id` is the body, for `claspBreak`'s reason: the box is **still falling**,
   * so the swell drawn around it has to be redrawn wherever it is on every
   * later frame rather than frozen on the tile the thumb met it at. A column
   * and a row are where it was on the tick of the press.
   *
   * A tap that lands *between* two beats pushes a plain `reject` instead
   * (`beatboxTapped`), because that is what the field already says everywhere
   * else for a press that reached nothing.
   */
  | { type: "beatboxTap"; id: number; col: number; row: number; hits: number }
  /**
   * The run was committed on the wrong count and the box discharged: a wave of
   * sound goes down the field at the hull, and the hull pays. The body is
   * **still there** — it resets and keeps falling, so the pair gets another
   * run at it out of whatever height is left — which is why this is its own
   * event and not a `destroy`.
   *
   * `hits` is the count that was committed. Player 2 counted every one of them
   * out, so it is not a secret from anybody, and it is what makes the sound of
   * a failure say *how far off* rather than only *no*.
   */
  | { type: "beatboxWave"; id: number; col: number; row: number; hits: number }
  /**
   * The run was committed on the count the box asked for: it is silenced and
   * comes off the field.
   *
   * **Its own event rather than a plain `destroy`**, which is what every other
   * body answered gets, and the reason is the colour. A `destroy` carries the
   * one the body was killed in, and a box has none — no ammunition could ever
   * have been right for it, which is the whole creature — so it would have to
   * borrow a red or a cyan it never wore, and the burst the pair sees would
   * name a trigger neither of them pressed. The ear wants the difference too:
   * a box going quiet is not a body bursting.
   *
   * `hits` is the count that answered it, which is also what it was asking
   * for. It is on the event so the ear can step with the run rather than
   * stopping it flat, and it is no secret from anybody by the time this fires:
   * player 2 tapped every one of them.
   */
  | { type: "beatboxSilent"; id: number; col: number; row: number; hits: number };
