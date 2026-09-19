import type { ThroatState } from "./throat.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE THROAT's two hands on the gullet itself** — the cinch and the haul,
 * both on the picture and neither on a panel (`docs/spec/bosses.md` §11.19).
 *
 * The fight shipped with three gestures and asked for all three in every
 * phase: fling a gum across the mouth, shoot what is standing in it, brake
 * what is climbing towards it. Five states and one sentence. These two are the
 * states saying different things, and what makes them this boss rather than
 * any other is **where they come from**: there is nothing to pinch until the
 * pair has choked a ring, and nothing to haul until four are slack. The gullet
 * hands out its own controls as it loses them.
 *
 * **The cinch is the navigator's**, on a ring already gone slack. While her
 * thumb is on it the gullet does not breathe — no swallow, no lift — and the
 * inhales she takes off the grid are owed back one a beat the moment she lifts
 * (`throatBreathes`). So it is a bargain and not a pause: real time for the
 * pilot to get a gum onto the mouth's row, bought at the worst rate in the
 * fight. Held past `throatCinchBeats` the ring tears out of her thumb and the
 * bill arrives anyway.
 *
 * **The haul is the pilot's**, and only in `open`. Four rings slack is the one
 * phase where the mouth stops travelling and inhales every beat: the pair can
 * no longer wait for it to come to them, and a body standing in it has one
 * beat. His carry drags the tube a column sideways — `fromMilli`, whose
 * **sign is the direction**, as `pinTable` reads it — and the mouth is
 * somewhere else when the inhale lands. It is the only way in this fight to
 * take something *back* out of the throat's mouth.
 *
 * Nothing here can hurt the pair, which is THE VANE's own bargain: a thumb
 * lifted early is a window lost, a haul heard in the wrong phase is nothing at
 * all, and the worst the cinch can do is hand back the beats it borrowed.
 */

/**
 * **Whether there is a ring to pinch**: one has gone slack, the tube is still
 * whole, and the last cinch has been paid for.
 *
 * The debt is in the test and that is the whole cap. A thumb held down sends
 * `on: true` every tick it moves (`stareLidHeard`), so a ring torn out at
 * `throatCinchBeats` would be back under the same thumb on the next message
 * and the freeze would be free and endless. `breath` is what stops it: while
 * anything is owed the ring cannot be taken again, so the pair gets the beats
 * it borrowed back in full before it may borrow any more, and a thumb that
 * never lifts buys `throatCinchBeats` frozen beats out of every
 * `2 * throatCinchBeats` rather than all of them.
 *
 * Read by the cue rather than written out there (`boss-cue-read-k.ts`), for
 * the reason `throatHolds` is: the handle the picture offers and the handle
 * the simulation accepts are one question, and a second copy of it would be
 * the one that said `CINCH` over a ring no thumb could take.
 */
export function throatCinchable(b: ThroatState): boolean {
  return b.slack > 0 && b.phase !== "everts" && b.breath <= 0;
}

/** Whether a thumb is on a slack ring now. The cue goes quiet on it for
 * `gripBrakes`' reason: a word over a body that is already being answered
 * teaches the pair to stop reading the words. */
export function throatCinched(b: ThroatState): boolean {
  return b.cinchBeat >= 0;
}

/** Whether the mouth has already been asked to move on the next beat. The
 * same silence, one beat wide: the carry is spent and the picture is about to
 * show what it bought. */
export function throatHauling(b: ThroatState): boolean {
  return b.haulStep !== 0;
}

/**
 * Both hands, heard on the tick from `bossHandsHeard`.
 *
 * On the tick and not the beat because a thumb is down when it lands and the
 * beat only ever asks whether it was down — `vane-hand.ts`'s argument exactly.
 * What each one *does* still lands on a beat: the cinch is spent by
 * `throatBreathes` and the haul is taken by `throatHaul`, both from
 * `stepThroat`, which is this fight's promise that every change is one
 * somebody can name a count for.
 */
export function throatHeard(world: World, player: 1 | 2, command: Command): void {
  const b = world.boss;
  if (b === null || b.kind !== "throat" || command.kind !== "drag") return;
  if (command.target === "throatRing") ringHeard(world, b, player, command.on);
  if (command.target === "throatTube") tubeHeard(world, b, player, command);
}

function ringHeard(world: World, b: ThroatState, player: 1 | 2, on: boolean): void {
  if (player !== 2) return;
  if (!on) {
    throatRelease(b);
    return;
  }
  // A thumb already on one stays where it is. There is one cinch however many
  // rings are slack: the gullet breathes or it does not, and a second thumb
  // that re-anchored `cinchBeat` would hand the pair a hold they could renew
  // for nothing.
  if (throatCinched(b) || !throatCinchable(b)) return;
  b.cinchBeat = world.beat;
}

function tubeHeard(
  world: World,
  b: ThroatState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 1 || b.phase !== "open") return;
  // The press says nothing; the carry is the lift, and only one that travelled
  // (`vaneHeard`). A tap on the tube would move the mouth by the width of a
  // fingertip's jitter, and the mouth's column is the one thing in this fight
  // player 2 has already said out loud.
  if (command.on || throatHauling(b)) return;
  if (Math.abs(command.fromMilli) < world.cfg.throatHaulMilli) return;
  b.haulStep = command.fromMilli < 0 ? -1 : 1;
}

/**
 * The ring let go of: by her thumb, or torn out by the cap
 * (`throatBreathes`).
 *
 * One place for `releasePin`'s reason — a lift and a tear cost the pair the
 * same thing and have to be one line, so that the day this fight gets a sound
 * there is one place to put it.
 */
export function throatRelease(b: ThroatState): void {
  b.cinchBeat = -1;
}
