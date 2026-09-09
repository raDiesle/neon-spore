import { markMoment } from "./balance.js";
import {
  beatboxBeatFor,
  beatboxCorrect,
  beatboxHitsMade,
  beatboxIsBox,
  beatboxLapsed,
  beatboxOvershoots,
} from "./beatbox.js";
import { removeCreature } from "./field.js";
import { breachUnscarred } from "./hull-damage.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **What happens to a soundbox**: the thumb that lands on it, the run being
 * committed, and the two ways that ends.
 *
 * `beatbox.ts` next door is what a box *is* — the count, the run, which beat a
 * tap belongs to — and it is finished. This is the half that grows, the seam
 * `choir.ts` and `choir-gesture.ts` already cut one creature earlier.
 *
 * **A run is committed by stopping, not by finishing.** Nothing here counts up
 * to the number and fires: the box takes taps for as long as they keep
 * arriving on consecutive beats, and the moment a beat's window shuts with
 * none in it, the count that stands is the count it is judged on. That is the
 * whole creature — the navigator has to *take the thumb away* on the right
 * beat, which is a thing only somebody who was told the number can do.
 *
 * **Both mistakes are answered at once, and neither used to be.** A run that
 * stops short is judged the instant the beat it skipped closes, a fifth of a
 * second past the boundary rather than at the next one (`beatboxLapsed`); a
 * run that goes one beat too long is judged on the thumb that made it too long
 * (`beatboxOvershoots`). Both were a whole beat late until the owner reported
 * it, and on a creature whose entire subject is *when* a press landed, an
 * answer a beat after the mistake is an answer about a different beat.
 */

/**
 * **Player 2's thumb on a box.** Instant, not held: this is a press and the
 * whole of it, which is what separates it from the grip on the same field
 * (`hand.ts`).
 *
 * Whose press counts is decided here rather than on the command, on
 * `gauge.ts`' terms and for its reason: the command says what was pressed, and
 * which seat may press it is this round's rule. It is player 2's alone, and
 * that is the creature — the number is on the pilot's screen and the thumb is
 * on the navigator's, so a pilot who could also tap would be a pilot who never
 * has to say anything.
 *
 * A tap that lands between two beats pushes a plain `reject`, which is what
 * the field already says everywhere else for a press that reached nothing, and
 * it deliberately does **not** break a run: an ignored press and a missed beat
 * are different mistakes, and only the second one is this creature's question.
 */
export function beatboxTapped(world: World, player: 1 | 2, id: number): void {
  if (player !== 2) return;
  const c = world.creatures.find((x) => x.id === id);
  if (c === undefined || !beatboxIsBox(c)) return;
  const beat = beatboxBeatFor(world);
  if (beat === null) {
    // The tick, so the counter can put a red dot where the next one would have
    // gone: a press that reached nothing used to leave nothing behind on the
    // body, and the navigator's only account of their own run could not say
    // *that one was not on the beat* (`creature-state-beatbox.ts`).
    c.beatboxMiss = world.tick;
    world.events.push({ type: "reject", col: c.col, row: c.row });
    return;
  }
  // A run that already lapsed is settled *now*, before this tap is counted.
  // `settleSpentBeatboxes` runs on every tick and has almost always got there
  // first, so what is left for this line is the narrow case of a thumb and a
  // deadline inside one tick — and the order between them is still the
  // creature's: the old run is judged on the count that stood, and only then
  // does this press start a new one. If that settling silenced the box there
  // is nothing left to press.
  if (beatboxLapsed(world, c)) {
    settleBeatbox(world, c);
    if (!world.creatures.includes(c)) return;
  }
  // Two thumbs inside one beat's window is one tap. Ignored rather than
  // charged as a miss: a touchscreen reports a jittery press twice, and a
  // creature that punished the glass rather than the player would be one the
  // pair cannot tell they are playing correctly.
  if (c.beatboxBeat === beat) return;
  // **One tap too many is answered on the tap.** The owner asked for it in
  // those words, and it is the same discharge a short run gets taken a beat
  // earlier than the commit would have taken it. It has to be here rather than
  // at the commit: on a creature whose whole subject is *when* a press landed,
  // a beat between the wrong thumb and the thing that says so is the one delay
  // it cannot afford.
  //
  // The count is **not** advanced first. What discharges is the run that
  // stood, so `hits` on the event is the number the pair actually got right,
  // and the tap that broke it is not counted as one of them.
  if (beatboxOvershoots(c)) {
    dischargeBeatbox(world, c);
    return;
  }
  c.beatboxHits = beatboxHitsMade(c) + 1;
  c.beatboxBeat = beat;
  // The tick rather than the beat, and only for the picture: the glow, the
  // green ring and the arm growing out of the rim all start at the thumb
  // rather than at the boundary it was reaching for
  // (`creature-state-beatbox.ts`).
  c.beatboxTick = world.tick;
  world.events.push({
    type: "beatboxTap",
    id: c.id,
    col: c.col,
    row: c.row,
    hits: c.beatboxHits,
  });
}

/**
 * Every box whose run has stopped, judged on the count that stands.
 *
 * Called from `onBeat` after the field has moved, so a box settling on the
 * beat it also arrives at the ship is settled first — the pair's last run is
 * worth something even on the beat the body lands.
 *
 * A snapshot rather than the live array, because settling a correct run takes
 * the body off the field and `removeCreature` replaces `world.creatures`
 * wholesale (`field.ts`).
 */
export function settleSpentBeatboxes(world: World): void {
  for (const c of [...world.creatures]) {
    if (!beatboxIsBox(c) || !beatboxLapsed(world, c)) continue;
    settleBeatbox(world, c);
  }
}

/**
 * The run committed, and the two things that can follow.
 *
 * **Right** — the box is silenced where it stands and comes off the field. Its
 * own event rather than the ordinary `destroy`, and `events-beatbox.ts` argues
 * it: a `destroy` names the colour the body was killed in and a box has none,
 * so it could only borrow a trigger neither player ever pressed.
 *
 * **Wrong** — it discharges. The hull pays `damageBeatboxWave`, and the body
 * **stays**, with its run wiped: it is still falling, so whatever height is
 * left is another run for the pair, and a box that vanished on a miscount
 * would make failing cheaper than succeeding.
 *
 * `breachUnscarred` rather than `damageSpan`, on `singChoirs`' terms exactly:
 * nothing struck the ship. A scar is a crack drawn where a body landed, and
 * one drawn for a sound would put damage on the hull in a place nothing ever
 * hit. What a box costs by *arriving* is the ordinary creature's price, and
 * that is `resolveHull`'s to charge, not this file's.
 */
export function settleBeatbox(world: World, c: Creature): void {
  if (beatboxCorrect(c)) {
    markMoment(world, true);
    world.score += world.cfg.scoreBeatboxSilence;
    world.events.push({
      type: "beatboxSilent",
      id: c.id,
      col: c.col,
      row: c.row,
      hits: beatboxHitsMade(c),
    });
    removeCreature(world, c.id);
    return;
  }
  dischargeBeatbox(world, c);
}

/**
 * **The box discharging**: the hull pays, the body stays, and the run is wiped.
 *
 * Its own function because there are two ways into it and they arrive from
 * opposite directions. A run committed on too *few* beats reaches it through
 * `settleBeatbox` above, when the deadline passes; a run that took one beat
 * too *many* reaches it straight off the tap, because an over-count is
 * answered on the thumb that made it (`beatboxTapped`). Both are the same
 * event, the same price and the same second chance — they are one mistake
 * counted from either side — so they must not be two pieces of code that can
 * drift apart.
 *
 * `breachUnscarred` rather than `damageSpan`, on `singChoirs`' terms exactly:
 * nothing struck the ship. A scar is a crack drawn where a body landed, and
 * one drawn for a sound would put damage on the hull in a place nothing ever
 * hit. What a box costs by *arriving* is the ordinary creature's price, and
 * that is `resolveHull`'s to charge, not this file's.
 */
function dischargeBeatbox(world: World, c: Creature): void {
  markMoment(world, false);
  world.events.push({
    type: "beatboxWave",
    id: c.id,
    col: c.col,
    row: c.row,
    hits: beatboxHitsMade(c),
  });
  breachUnscarred(world, c.col, "beatbox", c.fromRow, world.cfg.damageBeatboxWave, c.color);
  // The run that failed, kept for the marks: `beatboxHits` is wiped one line
  // below, and without this the counter would empty on the exact frame the pair
  // looks at it to find out how far off they were.
  c.beatboxRan = beatboxHitsMade(c);
  c.beatboxHits = 0;
  c.beatboxBeat = undefined;
  c.beatboxTick = undefined;
  c.beatboxMiss = undefined;
  // The tick the red is timed from, and the only thing left on the body saying
  // anything went wrong — the run above has just been wiped. Render lights the
  // box in it and throws the red rings from it
  // (`creature-state-beatbox.ts`).
  c.beatboxWrong = world.tick;
}

/**
 * A shot met a soundbox.
 *
 * Refused, and it is the creature rather than an omission: a box carries no
 * colour, so there is no ammunition that could be right, and the answer to one
 * is a thumb on the beat. `choirStruck` makes the same argument one creature
 * earlier — a `reject` and not a colour miss, because the failure is the
 * pair's order of operations rather than player 2's choice of trigger, and
 * charging it to the colour balance would read it to the wrong player.
 */
export function beatboxStruck(world: World, _b: Bullet, hit: Creature): void {
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
}
