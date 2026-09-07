import { markMoment } from "./balance.js";
import {
  beatboxBeatFor,
  beatboxCorrect,
  beatboxHitsMade,
  beatboxIsBox,
  beatboxLapsed,
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
 * arriving on consecutive beats, and the moment a beat goes by with none, the
 * count that stands is the count it is judged on. That is the whole creature —
 * the navigator has to *take the thumb away* on the right beat, which is a
 * thing only somebody who was told the number can do — and it is why the same
 * `beatboxLapsed` is asked from two places: a run can stop because the pair
 * stopped, or because they came back a beat too late.
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
    world.events.push({ type: "reject", col: c.col, row: c.row });
    return;
  }
  // A run that already lapsed is settled *now*, before this tap is counted —
  // the loop below would look a beat later and find the newer beat on the body
  // by then, so the skipped beat would go unnoticed. If that settling silenced
  // the box there is nothing left to press.
  if (beatboxLapsed(c, beat)) {
    settleBeatbox(world, c);
    if (!world.creatures.includes(c)) return;
  }
  // Two thumbs inside one beat's window is one tap. Ignored rather than
  // charged as a miss: a touchscreen reports a jittery press twice, and a
  // creature that punished the glass rather than the player would be one the
  // pair cannot tell they are playing correctly.
  if (c.beatboxBeat === beat) return;
  c.beatboxHits = beatboxHitsMade(c) + 1;
  c.beatboxBeat = beat;
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
    if (!beatboxIsBox(c) || !beatboxLapsed(c, world.beat)) continue;
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
  markMoment(world, false);
  world.events.push({
    type: "beatboxWave",
    id: c.id,
    col: c.col,
    row: c.row,
    hits: beatboxHitsMade(c),
  });
  breachUnscarred(world, c.col, "beatbox", c.fromRow, world.cfg.damageBeatboxWave, c.color);
  c.beatboxHits = 0;
  c.beatboxBeat = undefined;
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
