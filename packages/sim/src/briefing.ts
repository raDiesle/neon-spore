import type { World } from "./world.js";

/**
 * How a wave opens, and the only part of it the simulation owns.
 *
 * A wave now opens in three states, in this order, and the field is still
 * behind the first two:
 *
 * 1. **The introduction.** `WAVE 4`, the wave's name, its sentence — plain
 *    text on the field, no panel and no card. Nothing is pressed: it stands
 *    for a few seconds and passes on its own.
 * 2. **The guide, if the wave carries one.** Split across the two screens, and
 *    it holds until *both* seats have put it away. That rule is not
 *    negotiable — a guide one player skips past is a sentence the pair never
 *    finished reading.
 * 3. **The wave.**
 *
 * **Placed, not derived — and this file has now changed its mind twice.** It
 * used to derive the subjects of a wave's cards from what the wave contained,
 * against a hand-written catalogue of subjects, precisely so that a hand-kept
 * list beside a wave could not go stale. That argument was good and it lost to
 * a better one: the help belongs to the wave, in the wave, where it is read
 * and edited, so it can speak about *this* wave rather than about a creature
 * in the abstract, and so it has somewhere to grow a picture. The staleness
 * the derivation guarded against has a stronger guard now — a creature ships
 * with the wave that carries it, that wave carries a guide, and
 * `packages/content/test/waves.test.ts` fails when it does not.
 * `docs/spec/briefings.md` has the argument in full.
 *
 * **World state, not `localStorage`.** Both states stop the wave, so two
 * devices that disagree about whether one is up disagree about whether the
 * world ticked. The phase is in `hashWorld` and the desync ledger watches it
 * like everything else.
 *
 * **The seconds are not counted here.** The introduction passes on a timer,
 * and a timer is a wall clock — which nothing in `sim` may read. So the app
 * counts them (`apps/game/src/waves.ts`) and sends the same `brief` command a
 * thumb sends, one per seat. That is not a loophole: it is exactly the shape
 * the guide already had, with a clock where the thumb was, and the lockstep
 * scheduler carries it between two devices unchanged.
 */

/** The field is playing: nothing is holding it. */
export const OPENING_PLAY = 0;
/** The introduction stands — number, name, sentence — and the wave waits. */
export const OPENING_INTRO = 1;
/** The guide is up, and stays up until both seats have acked it. */
export const OPENING_GUIDE = 2;

/**
 * Which of the three states a wave's opening is in. A small integer rather
 * than a string because it goes through `hashWorld`, which is a fold over
 * numbers — and because the order is meaningful: an opening only ever counts
 * downwards, towards playing.
 */
export type OpeningPhase = typeof OPENING_PLAY | typeof OPENING_INTRO | typeof OPENING_GUIDE;

/** Bit 1 is player 1's ack, bit 2 is player 2's. Both, and the state passes. */
const ACK_P1 = 1;
const ACK_P2 = 2;
const ACK_BOTH = ACK_P1 | ACK_P2;

export interface Briefings {
  /** Where in the opening this wave is — see `OPENING_PLAY` and its siblings. */
  phase: OpeningPhase;
  /** Whether this wave carries a guide, which is where the introduction goes next. */
  guide: boolean;
  /** Which seats have acked the state that is up — see `ACK_P1`. */
  ack: number;
}

export function newBriefings(): Briefings {
  return { phase: OPENING_PLAY, guide: false, ack: 0 };
}

/** Whether anything is holding the wave, which is the whole of whether it is frozen. */
export function briefingHolds(world: World): boolean {
  return world.brief.phase !== OPENING_PLAY;
}

/** Whether the introduction is the thing standing in front of the wave. */
export function introHolds(world: World): boolean {
  return world.brief.phase === OPENING_INTRO;
}

/** Whether the guide is up. Only then does a press on the stage mean anything. */
export function guideHolds(world: World): boolean {
  return world.brief.phase === OPENING_GUIDE;
}

/** Whether this seat has already put the state that is up away. */
export function briefingAcked(world: World, player: 1 | 2): boolean {
  return (world.brief.ack & (player === 1 ? ACK_P1 : ACK_P2)) !== 0;
}

/**
 * One seat is done with what is on its screen. The state only passes when both
 * are: the guide's two halves are not the same sentence, and the introduction
 * is timed on each device separately, so in both cases the pair moves on
 * together or not at all.
 */
export function ackBriefing(world: World, player: 1 | 2): void {
  const b = world.brief;
  if (b.phase === OPENING_PLAY) return;
  b.ack |= player === 1 ? ACK_P1 : ACK_P2;
  if (b.ack !== ACK_BOTH) return;
  b.ack = 0;
  b.phase = b.phase === OPENING_INTRO && b.guide ? OPENING_GUIDE : OPENING_PLAY;
}

/**
 * Put a wave's opening in front of the pair. Called by `startWave`, which is
 * handed `hasGuide` by whoever knows what a wave is — the sim never reads
 * `content`, so it is told rather than asking.
 *
 * `cfg.briefings` gates the whole opening, introduction included. It is the
 * switch on a feature that wants two people: a headless replay, a determinism
 * run and every sim test play with it off, and nothing there would ever send
 * the two acks that let a held wave start.
 *
 * **No memory, and the opening shows on every start of its wave.** There used
 * to be a bitmask of subjects the pair had met; there are no subjects any
 * more. A wave carries its own help, the director restarts a wave twenty times
 * an afternoon and wants to see it every time, and a run restarted after the
 * hull went costs one press. If that grates, the answer is a memory over wave
 * indices, and that is its own decision rather than a field added quietly
 * here.
 */
export function openWave(world: World, hasGuide: boolean): void {
  const b = world.brief;
  b.ack = 0;
  b.guide = hasGuide && world.cfg.briefings;
  b.phase = world.cfg.briefings ? OPENING_INTRO : OPENING_PLAY;
}
