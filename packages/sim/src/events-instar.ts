import type { ScenePart, ScenePose } from "./instar.js";

/**
 * What THE INSTAR says as it happens, one line per thing the picture and the
 * sound answer — and THE NETTLE, on the same engine, in its own parts and
 * poses (`nettle-words.ts`): an event is the engine's, and which body it
 * happened to is `world.boss.kind`.
 *
 * Every event carries `col`, the column the thing stood over, for the sounds
 * to pan to and the frame to find. A mark's events carry `mark`, its index in
 * the step, because a step has up to two marks and the look draws each on its
 * own part of the body; the step's carry `step`, the cursor, for the same
 * reason — the fifth pose is not the first.
 *
 * **Nothing here is a number the pair reads.** A `instarAnswer` is the slap
 * landing or the egg coming away; `instarDone` is the hand letting go; the
 * count that got it there is the boss's business.
 */

interface InstarColEvent {
  /** The column it happened over. */
  col: number;
}

export type InstarEvent =
  /** The body is in over the field at `col` — the middle — with its first pose still to take. */
  | ({ type: "instarEnter" } & InstarColEvent)
  /** The body morphs into `pose`, step `step`; the marks are hidden while it does. */
  | ({ type: "instarMorph"; step: number; pose: ScenePose } & InstarColEvent)
  /** The marks of step `step` are up and the window is open. */
  | ({ type: "instarShow"; step: number } & InstarColEvent)
  /** A thumb from the wrong seat pressed mark `mark`: refused, and shown refusing. */
  | ({ type: "instarRefuse"; mark: number; player: 1 | 2 } & InstarColEvent)
  /** Mark `mark` moved one unit of its need: a slap, an egg away, a turn, a pull past the line. */
  | ({ type: "instarAnswer"; mark: number; part: ScenePart } & InstarColEvent)
  /** Mark `mark` reached its need: the part gives — the hand opens, the tail lifts. */
  | ({ type: "instarDone"; mark: number; part: ScenePart } & InstarColEvent)
  /** The part pushed back `pushMilli` against the thumb on pull mark `mark`, on
   * a beat of a step that shoves (`instar-step.ts` `pushBack`): the jaw
   * forcing itself open again, once a beat for as long as the thumb stays. */
  | ({ type: "instarShove"; mark: number; part: ScenePart; pushMilli: number } & InstarColEvent)
  /** Mark `mark` was done and its partner was not in time: back to nought. */
  | ({ type: "instarSlip"; mark: number; part: ScenePart } & InstarColEvent)
  /** Every mark of step `step` is done together: the beat is landed. */
  | ({ type: "instarLand"; step: number } & InstarColEvent)
  /** The window closed on `part` still undone: it strikes the hull, and the wave is lost. */
  | ({ type: "instarStrike"; part: ScenePart } & InstarColEvent)
  /** The last step landed: the body is beaten and hangs. */
  | ({ type: "instarDown" } & InstarColEvent)
  /** The body is out, `instarOutBeats` after the last landing; the wave may end. */
  | ({ type: "instarOut" } & InstarColEvent);
