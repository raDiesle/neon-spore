/**
 * How long one *creature's* own clock runs, and the shapes that clock moves:
 * the row a lure leaves on and how many holes its blast makes, the throb's
 * cycle, the clasp's break, the veil's morph and its armour, the wisp's dwell,
 * the echo's fall and its divisions, the rind's layers, and how far a hand has
 * to carry THE LID's cord.
 *
 * **What each of them is worth lives next door**, in `config-creature-scores.ts`.
 * The prices left the day this file sat exactly on its limit: a price is argued
 * against the other prices and a clock is argued against the beat, so the two
 * halves were being read at different times and neither could gain a line.
 *
 * **THE GHOST's six live next door too**, in `config-ghost.ts`, for the reason
 * `config-gyre.ts` gives about the seven it took with it: a creature with two
 * numbers is a row in this shared list, and a creature with six is a section —
 * and a section is a file. That is also what stopped this one going over its
 * limit the day THE LID arrived, and `config-recoil.ts` is what stopped it the
 * day THE RECOIL did: three numbers, but three that have to be argued together
 * because a count, a distance and a price only make sense against each other.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-shot.ts` and `config-boss.ts` already give: every call site still
 * reads `cfg.throbSpinBeats`, and the split is only about how much of one file
 * a reader has to hold at once. The immediate reason is the same one those two
 * record — `config.ts` went over its size limit the day THE VEIL added three
 * fields. The better reason is that these were already sitting in a row and are
 * argued about one creature at a time, while everything left in `config.ts` is
 * argued about for the whole game: the beat, the hull, the shield, the pod, the
 * field.
 *
 * A creature added to the bestiary that wants a clock of its own adds it here,
 * not there.
 */
export interface CreatureConfig {
  /** Rows above the hull a lure stands on before it goes (`lureVanishRow`).
   * Two: close enough that player 1's eye is already on it, far enough that it
   * plainly never threatened the ship. */
  lureVanishRows: number;
  /** Places along the hull the blast breaks it in (`lureBlastCols`).
   * `damageLure` is split between them: priced once, paid in several holes. */
  lureBlastPlaces: number;
  /** Beats a Throb takes to turn once, clockwise — the whole of its clock
   * (`throbTurnMilli`, throb.ts), read off the beat both players share. */
  throbSpinBeats: number;
  /** Thousandths of every turn the authored colour is square to the cannon.
   * The rest is the other colour's half, a body too (`throbColorAt`). */
  throbFaceMilli: number;
  /** Marks on THE COUNT's rim when the count starts; one goes each beat, and
   * when none are left the body is open (`countdownMarks`, countdown.ts).
   * Four: with the two open beats below that is a zero every six, which at
   * 96 BPM is under four seconds — one call and one answer between windows,
   * and a body that falls `rows` beats shows two or three of them. */
  countdownBeats: number;
  /**
   * Beats the body stays open once the marks are gone, before the count
   * starts again. **Two, and not one, because of what a shot is.** A bolt
   * climbs `bulletTilesPerBeat` tiles a beat and is judged on the beat it
   * *arrives*, and the navigator fires on a word that took the pilot a
   * moment to say: fired on "zero" at the top of a beat, a shot at a body
   * ten rows up lands the better part of a beat later. One open beat would
   * make "fire on zero" the wrong instruction for the top half of the field
   * and "fire on one" the wrong one for the bottom half; two makes "fire on
   * zero" true everywhere on it, which is the sentence the wave teaches.
   */
  countdownOpenBeats: number;
  /**
   * Beats the broken shield goes on flying apart for. Render-only — the sim
   * opens a clasp on the instant of the trigger — but a `SimConfig` field
   * because it is counted in beats, and the beat is the sim's.
   */
  claspBreakBeats: number;
  /**
   * Beats between one turn of THE VEIL's body and the next — a slick becomes a
   * bulb, and a bulb a slick. Five is 3.1 s at 96 BPM, which is one spoken
   * exchange (docs/spec/latency.md): long enough that a call arrives before it
   * expires, short enough that it does expire.
   *
   * Beats and not milliseconds, unlike `veilArmourMs` below, and the asymmetry
   * is the point. The morph is something the pair *counts* — player 1 reads
   * beats off the timer over the cloud and says them out loud — so it has to
   * land on the shared clock. The armour is a window nobody counts.
   */
  veilMorphBeats: number;
  /**
   * How long a wrong colour keeps THE VEIL shut, in milliseconds. The sibling
   * of `guardWindowMs`: a duration nobody counts out loud, so it is measured
   * in the unit a person would use to describe it. Two seconds is long enough
   * to cost the pair a morph boundary and short enough not to read as a body
   * that simply cannot be killed.
   */
  veilArmourMs: number;
  /**
   * Beats THE WISP stands on one tile before it is somewhere else — the whole
   * cycle, of which the first is the jump and the rest is the standing.
   *
   * Beats and not milliseconds, for `veilMorphBeats`' reason and rather more
   * of it: the seat that has to answer a wisp cannot see one, so the count is
   * the only thing either of them shares about it.
   *
   * **Six, and it was two.** Two was 1.25 s at 96 BPM, chosen *under* the
   * 2.1–3.6 s a full spoken exchange takes (docs/spec/latency.md) to force a
   * shorthand rather than a sentence. What it actually forced was a tile that
   * expired while it was being said: the pair had no reading at all, only a
   * race they lost. Six is 3.75 s — one beat of it in the air and five
   * standing, so the tile a letter is read off is still there when the cannon
   * arrives. The shorthand is still what wins; it is no longer the only thing
   * that survives.
   */
  wispDwellBeats: number;
  /**
   * Beats between one step down and the next for THE ECHO. Two — it is the
   * whole of "half as fast", and it is the smallest number that is one: at
   * three the body hangs long enough that the pair stops reading it as
   * falling at all, and a wave with one in it would be over before the echo
   * had left the top third of the field.
   *
   * Beats and not tiles, unlike every other fall in the game
   * (`fallTilesPerBeat`), and the asymmetry is the point: the five rock tiers
   * go *faster* than one tile a beat and a tile count is what says so, while
   * anything slower than one tile a beat can only be said as beats between
   * steps. The simulation stores integers, so half a tile is not a thing a
   * body can move.
   */
  echoFallBeats: number;
  /**
   * How many times an echo divides before it is done. Three, so one arrival
   * is eight bodies — and the third is the one a pair playing well never sees,
   * because it lands with barely a third of the field left (`echoWaitBeats`).
   *
   * It cannot usefully be raised past `ECHO_AXES.length`: the list of
   * directions a division steps in is the whole rule, and a fourth generation
   * would repeat the last axis and put two bodies on one square.
   */
  echoSplits: number;
  /**
   * Beats an echo waits before its **first** division. Each generation after
   * that waits one more multiple of it — three beats, then six, then nine.
   *
   * Three, because it is a shade under a full spoken exchange
   * (docs/spec/latency.md puts one at 2.1–3.6 s; three beats is 1.9 s). Taking
   * the arrival whole is therefore a thing the pair can *just* do, and only
   * with the shorthand they have already built — which is the difference
   * between a creature that rewards talking and one that rewards typing fast.
   *
   * The growth is what stops the divisions becoming a rhythm. A fixed gap is a
   * metronome the pair answers without looking; a gap that gets longer means
   * the second wait feels like the body has finished, and it has not.
   */
  echoSplitBeats: number;
  /**
   * How many layers THE RIND sheds before an ordinary shot kills it. Two, so
   * one arrival is three shots and three sizes — and three is the number
   * rather than a tuning: two would be a body that flinches once, and four
   * would hold a column for so long that the wave around it stops being the
   * thing the pair is playing.
   *
   * It is also how big one arrives, because the size *is* what is left:
   * render draws one body's footprint per layer still on, so two layers is a
   * body three times the size of a slick and every shed steps it down by one.
   */
  rindLayers: number;
  /**
   * Thousandths of a tile player 1's hand must carry THE LID's cord for the
   * plates to stand fully apart. `wardenTautMilli`'s figure exactly, and that
   * is the point rather than a coincidence: it is the same gesture asked of
   * the same thumb, and a pull that took a different distance on an ordinary
   * arrival than on the boss would be two hands to learn for one movement.
   *
   * **Seven tiles, and it was two and a half.** The owner asked for three times
   * the travel on every handle that opens a gate, and what it buys is that the
   * pull stops being a flick: at two and a half a thumb reached taut without
   * leaving the column it started in, so holding one open cost almost nothing
   * and the seat with the cord could keep a hand near the cannon strip. At
   * seven the hand crosses most of the glass, the gate is plainly *held* rather
   * than switched, and the partial openings in between — the only thing the
   * other seat can read — are spread over a distance an eye can resolve.
   *
   * It is `wardenTautMilli`'s number, and that file says why the last half tile
   * went: a handle may not be carried off the field, and seven is the longest
   * pull the field can hold in a straight line from where a gate's handle
   * hangs. One gesture, one distance, on both.
   */
  lidTautMilli: number;
  /**
   * How far beside THE LID's own centre its cord hangs, in thousandths of a
   * tile — on the side toward the middle of the field (`lidSide`). A whole
   * tile: clear of the eye at every row, so a thumb reaching for the cord is
   * never a thumb landing on the body behind it, and clear of the body's
   * growth near the ship.
   *
   * **A `SimConfig` number rather than a render constant**, because the rule
   * reads it: the clamp that keeps a handle on the field needs to know where
   * that handle hangs (`handle-pull.ts`), and a length written once in render
   * and once in the clamp is a control drawn in one place and bounded in
   * another.
   */
  lidCordMilli: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CREATURE_DEFAULTS: CreatureConfig = {
  lureVanishRows: 2,
  lureBlastPlaces: 3,
  throbSpinBeats: 3,
  throbFaceMilli: 500,
  countdownBeats: 4,
  countdownOpenBeats: 2,
  claspBreakBeats: 2,
  veilMorphBeats: 5,
  veilArmourMs: 2000,
  wispDwellBeats: 6,
  echoFallBeats: 2,
  echoSplits: 3,
  echoSplitBeats: 3,
  rindLayers: 2,
  lidTautMilli: 7000,
  lidCordMilli: 1000,
};
