import type { Command } from "./types.js";

/**
 * **Everything THE STARE does that neither screen already says**, as one
 * event.
 *
 * Its own file on `events-splice.ts`' terms exactly — one boss taken apart
 * rather than incidents that share a body — and one arm of `SimEvent`, so
 * every consumer still switches over the whole list. It is a file rather than
 * one more line in `events.ts` because that file had come back to its 250-line
 * limit, which is where the last boss left it.
 *
 * **One event was the failure**, and for a week it was the only one.
 * Everything else about this boss is already on both screens as world: where
 * the eye is in its cycle, how much of the turn is left and which seat it
 * settled on are all read off `StareState` every frame (`stare.ts`). What is
 * *not* in the world a frame later is the moment a watched thumb landed
 * anyway — so that was the one thing worth an event, and it is the one thing
 * the pair will argue about afterwards.
 *
 * **The lid added two** (18 September 2026): the instant it reaches the
 * bottom, which is the instant the other seat is free, and the instant it
 * starts back up, which is the instant the puller has two beats to get their
 * hand off the field. Both are moments rather than states, and both are
 * sounds — the state they leave behind is on both screens already.
 */

/**
 * THE STARE caught a seat pressing something while it was being looked at.
 *
 * `command` is the press itself rather than a button id, because what was
 * pressed reached the simulation as a verb and the panel it came from is the
 * picture's business — a swipe on the hull and the strip under it send the
 * same `cannonCol`, and this file has no way to tell them apart and no
 * business trying (`stare-step.ts`).
 *
 * **It is the whole command and it used to be `command.kind` alone**, until
 * 21 September 2026, when the flash moved off the seat's whole panel and onto
 * the button (`render/src/stare-fx.ts`). A kind is not enough to find one: the
 * two colours both send `prime`, and which of the two circles the thumb was on
 * is in `color`. Carrying the verb whole leaves the picture to ask
 * `controlSays` which control could have said it, rather than being handed an
 * answer this side of the wall cannot work out.
 */
export type StareEvent =
  | { type: "stareCaught"; player: 1 | 2; command: Command }
  /** The lid is down: `player` pulled it, and the seat it was looking at is free. */
  | { type: "stareShut"; player: 1 | 2 }
  /**
   * The lid is on its way up and the eye will look at `player`, who pulled
   * it. `forced` when the eye pushed it up itself after `stareLidHoldBeats`,
   * rather than the thumb letting go — the picture strains one and not the
   * other.
   */
  | { type: "stareOpen"; player: 1 | 2; forced: boolean };
