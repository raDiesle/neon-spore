import { clearPages, guideStepped, onReadyPage, toReadyPage } from "./guide-steps.js";
import {
  clearReady,
  fillCircle,
  fillHeldCircles,
  gateCrossed,
  holdHeard,
  seatReady,
} from "./ready-gate.js";
import type { World } from "./world.js";

export {
  clearPages,
  guidePage,
  guidePages,
  guideStepHeard,
  guideStepped,
  onReadyPage,
  toReadyPage,
} from "./guide-steps.js";
export {
  readyFill,
  readyFraction,
  readyHeld,
  readyHoldTicks,
  seatReady,
} from "./ready-gate.js";

/**
 * How a wave opens, and the only part of it the simulation owns.
 *
 * A wave opens in three states, and the field is behind the first two.
 *
 * **The guide comes first**, if the wave carries one, and ends on **the ready
 * gate**: each seat holds, its circle fills, it says READY when full, and the
 * guide passes when both are. Then **the introduction** — number, name,
 * sentence, plain text on the field — which stands a few seconds and passes on
 * its own. Then **the wave**. A wave with no guide gets the introduction and
 * plays: no circles where there was nothing to read.
 *
 * **That order is the owner's and it was the other way round first.** What
 * decided it is what each state is *for*: the introduction names the wave the
 * pair is about to play, so it wants to be the last thing before the field
 * rather than a title card in front of a tutorial.
 *
 * The gate the guide ends on — what fills a circle, what empties it, and why
 * it has no timeout — is `ready-gate.ts`, next door, and re-exported from here
 * so nothing that asks this file for `seatReady` had to move.
 *
 * ## Where the numbers live
 *
 * **World state, not `localStorage`.** All three states stop the wave, so two
 * devices that disagree about one disagree about whether the world ticked. The
 * phase *and both fills* are in `hashWorld`: the fill decides when the wave
 * starts, so it is counted in **ticks** and never in seconds. The
 * introduction's seconds are the exception, and the difference is exactly that
 * nothing depends on the tick they land, so the app may count them on a wall
 * clock `sim` is not allowed to read (`apps/game/src/waves.ts`).
 *
 * `docs/spec/briefings.md` has the rest: why the help is placed on the wave
 * rather than derived, and why nothing remembers what the pair has met.
 */

/**
 * The three states, as small integers because they go through `hashWorld`, and
 * ordered because an opening only ever counts downwards, towards playing. The
 * guide is the far end, then the introduction, then the field.
 */
export const OPENING_PLAY = 0;
export const OPENING_INTRO = 1;
export const OPENING_GUIDE = 2;

export type OpeningPhase = typeof OPENING_PLAY | typeof OPENING_INTRO | typeof OPENING_GUIDE;

/** Bit 1 is player 1's ack, bit 2 is player 2's. Both, and the introduction passes. */
const ACK_P1 = 1;
const ACK_P2 = 2;
const ACK_BOTH = ACK_P1 | ACK_P2;

export interface Briefings {
  /** Where in the opening this wave is — see `OPENING_PLAY` and its siblings. */
  phase: OpeningPhase;
  /** Whether this wave carries a guide, which is where the introduction goes next. */
  guide: boolean;
  /** Which seats have acked the introduction — see `ACK_P1`. */
  ack: number;
  /**
   * How many pages of film this wave's guide has, and 0 when it is one of the
   * sixteen made of prose. `steps + 1` pages in all: the extra one is the gate
   * (`guide-steps.ts`).
   */
  steps: number;
  /** The page each seat is reading, 0..`steps`. Each seat pages at its own
   * speed; read them through `guidePage`, never by name. */
  stepP1: number;
  stepP2: number;
  /** Ticks each seat has held at the gate, 0..`readyHoldTicks`. Read them
   * through `readyFill` and `seatReady`, never by name. */
  fillP1: number;
  fillP2: number;
  /** Whether each seat's thumb is down right now. Not the same as full. */
  holdP1: boolean;
  holdP2: boolean;
}

export function newBriefings(): Briefings {
  const b = { phase: OPENING_PLAY, guide: false, ack: 0, steps: 0 } as Briefings;
  clearPages(b);
  clearReady(b);
  return b;
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

/**
 * Whether this seat has already put the state that is up away — the ack while
 * the introduction stands, the full circle once the guide does. One question
 * for both, because from outside they are the same one.
 */
export function briefingAcked(world: World, player: 1 | 2): boolean {
  if (world.brief.phase === OPENING_GUIDE) return seatReady(world, player);
  return (world.brief.ack & (player === 1 ? ACK_P1 : ACK_P2)) !== 0;
}

/**
 * A `brief` command from one seat. `on` is the thumb going down and coming up
 * again, the contract `prime` and `valve` already have; a command without it
 * is a press, which is all the introduction has ever needed — there is no
 * circle there to fill. On the guide it is the hold, and a lift empties a
 * circle that had not filled yet.
 */
export function briefHeard(world: World, player: 1 | 2, on: boolean): void {
  const b = world.brief;
  if (b.phase === OPENING_INTRO) {
    if (on) ackBriefing(world, player);
    return;
  }
  if (b.phase !== OPENING_GUIDE) return;
  // A seat still turning pages has no circle in front of it. Its thumb is on
  // NEXT, and a hold that filled the gate from three pages back would be the
  // pair skipping exactly the reading the pages exist to buy.
  if (!onReadyPage(world, player)) return;
  holdHeard(world, player, on);
}

/**
 * One tick's worth of holding, run after the tick counter moves and only while
 * the guide is up. A seat that is holding fills by one tick; a seat whose
 * circle is already full stays full whatever its thumb does.
 */
export function stepReady(world: World): void {
  if (world.brief.phase !== OPENING_GUIDE) return;
  fillHeldCircles(world);
  if (gateCrossed(world)) guidePassed(world);
}

/**
 * One seat is done with what is on its screen, at once. It is what the
 * introduction's timer sends and what a caller with no thumbs has — the
 * director's own loop, a replay, a test — so on the guide it fills that seat's
 * circle outright rather than pretending to hold it for a second. The state
 * only passes when both seats are done: the guide's two halves are not the
 * same sentence and the introduction is timed on each device separately, so
 * either way the pair moves on together or not at all.
 */
export function ackBriefing(world: World, player: 1 | 2): void {
  const b = world.brief;
  if (b.phase === OPENING_PLAY) return;
  if (b.phase === OPENING_GUIDE) {
    // Straight to the gate first: a caller with no thumbs is done with the
    // whole guide, not with the page it happens to be showing.
    toReadyPage(world, player);
    fillCircle(world, player);
    if (gateCrossed(world)) guidePassed(world);
    return;
  }
  b.ack |= player === 1 ? ACK_P1 : ACK_P2;
  if (b.ack !== ACK_BOTH) return;
  b.ack = 0;
  clearReady(b);
  b.phase = OPENING_PLAY;
}

/**
 * The gate is crossed. A guide made of prose leaves the wave's own name still
 * to read; a stepped one does not, because its last page *was* the name and the
 * sentence with the ready button under them (`guide-steps.ts`).
 */
function guidePassed(world: World): void {
  const b = world.brief;
  b.phase = guideStepped(world) ? OPENING_PLAY : OPENING_INTRO;
  b.ack = 0;
  clearPages(b);
  clearReady(b);
}

/**
 * Put a wave's opening in front of the pair. Called by `startWave`, which is
 * handed `hasGuide` by whoever knows what a wave is — the sim never reads
 * `content`, so it is told rather than asking.
 *
 * `cfg.briefings` gates the whole opening, introduction included: a headless
 * replay, a determinism run and every sim test play with it off, and none of
 * them would ever send the two acks that let a held wave start.
 */
export function openWave(world: World, hasGuide: boolean, guideSteps = 0): void {
  const b = world.brief;
  b.ack = 0;
  clearPages(b);
  clearReady(b);
  b.guide = hasGuide && world.cfg.briefings;
  // How many pages this guide has is content's fact about the wave, told to the
  // simulation the same way `hasGuide` is — `sim` never reads a scene.
  b.steps = b.guide ? guideSteps : 0;
  b.phase = world.cfg.briefings ? (b.guide ? OPENING_GUIDE : OPENING_INTRO) : OPENING_PLAY;
}
