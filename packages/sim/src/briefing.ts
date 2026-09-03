import { msToTicks, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * How a wave opens, and the only part of it the simulation owns.
 *
 * A wave opens in three states, and the field is behind the first two. **The
 * introduction** — number, name, sentence, plain text on the field — stands a
 * few seconds and passes on its own. **The guide**, if the wave carries one,
 * is split across the two screens and ends on **the ready gate**: each seat
 * holds, its circle fills, it says READY when full, and the wave starts when
 * both are. Then **the wave**. A wave with no guide gets the introduction and
 * plays — no circles where there was nothing to read.
 *
 * ## The ready gate, and the two rules it inherits from THE FORK
 *
 * THE FORK was a second gate at the same seam — the rest between waves ended
 * in a wait only two thumbs could cross — and it is gone, because its idea
 * belongs at the end of the thing the pair is actually reading. Two of the
 * three things it argued survive the move, and are written here because they
 * are the reasoning somebody would otherwise re-derive.
 *
 * **There is no timeout, deliberately.** A clock that eventually started the
 * wave anyway would make the wait decorative — the pair would learn its length
 * and stop committing, and the one moment that belongs to them would belong to
 * the clock again like everything else. The gate stays open forever, and the
 * only ways out are the two holds or leaving the run.
 *
 * **Nor is it a free repair bay.** The hull does not mend behind a gate with
 * no end on it, or the cheapest way to play would be to sit on a guide and
 * talk about nothing for a minute. This needs no check of its own and has
 * none: `step` returns before it reaches `regenerateHull` for as long as
 * `briefingHolds` is true, so the whole opening freezes the hull by the shape
 * of the tick rather than by a rule anybody has to remember. THE FORK needed
 * that rule spelled out in `regenerateHull` only because a fork was *not* one
 * of these states.
 *
 * ## Letting go empties the fill, and READY latches
 *
 * The one design question this gate had. THE WARDEN's pull **accumulates** and
 * `config-boss.ts` says why — *the question the fight asks is when the other
 * player can spare their hand, never whether they can hold it steady on a
 * phone.* That is about a fight and it does not transfer here, because of what
 * this fill is made of: it is the only evidence that time passed with the
 * guide on the screen. A fill that survived the lift is one you reach by
 * tapping ten times instead of waiting once, and tapping ten times is exactly
 * the pair skipping the reading the gate exists to buy. So a lift before the
 * circle is full empties it.
 *
 * **Once it is full it stays full.** Only the fill resets; READY is a latch.
 * Otherwise both seats would have to be holding in the same instant, which is
 * a coordination test this gate is not about — and an unfair one across two
 * seconds of voice delay. You hold until your circle says READY, then your
 * thumb is your own again and the wave waits for your partner.
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
 * ordered because an opening only ever counts downwards, towards playing.
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
  /** Ticks each seat has held at the gate, 0..`readyHoldTicks`. Read them
   * through `readyFill` and `seatReady`, never by name. */
  fillP1: number;
  fillP2: number;
  /** Whether each seat's thumb is down right now. Not the same as full. */
  holdP1: boolean;
  holdP2: boolean;
}

export function newBriefings(): Briefings {
  const b = { phase: OPENING_PLAY, guide: false, ack: 0 } as Briefings;
  clearReady(b);
  return b;
}

/** How many ticks a seat has to hold before its circle says READY. */
export function readyHoldTicks(cfg: SimConfig): number {
  return Math.max(1, msToTicks(cfg, cfg.readyHoldMs));
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
 * One seat's circle, asked four ways: the ticks it has filled, the same as a
 * fraction for drawing it, whether it is full and says READY — which latches —
 * and whether that seat's thumb is down right now, which is a different
 * question and looks different on the screen.
 */
export function readyFill(world: World, player: 1 | 2): number {
  return player === 1 ? world.brief.fillP1 : world.brief.fillP2;
}

export function readyFraction(world: World, player: 1 | 2): number {
  return Math.min(1, readyFill(world, player) / readyHoldTicks(world.cfg));
}

export function seatReady(world: World, player: 1 | 2): boolean {
  return readyFill(world, player) >= readyHoldTicks(world.cfg);
}

export function readyHeld(world: World, player: 1 | 2): boolean {
  return player === 1 ? world.brief.holdP1 : world.brief.holdP2;
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
  if (player === 1) b.holdP1 = on;
  else b.holdP2 = on;
  if (on || seatReady(world, player)) return;
  if (player === 1) b.fillP1 = 0;
  else b.fillP2 = 0;
}

/**
 * One tick's worth of holding, run after the tick counter moves and only while
 * the guide is up. A seat that is holding fills by one tick; a seat whose
 * circle is already full stays full whatever its thumb does.
 */
export function stepReady(world: World): void {
  const b = world.brief;
  if (b.phase !== OPENING_GUIDE) return;
  const full = readyHoldTicks(world.cfg);
  if (b.holdP1 && b.fillP1 < full) b.fillP1 += 1;
  if (b.holdP2 && b.fillP2 < full) b.fillP2 += 1;
  if (b.fillP1 >= full && b.fillP2 >= full) startPlaying(world);
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
    const full = readyHoldTicks(world.cfg);
    if (player === 1) b.fillP1 = full;
    else b.fillP2 = full;
    if (b.fillP1 >= full && b.fillP2 >= full) startPlaying(world);
    return;
  }
  b.ack |= player === 1 ? ACK_P1 : ACK_P2;
  if (b.ack !== ACK_BOTH) return;
  b.ack = 0;
  clearReady(b);
  b.phase = b.guide ? OPENING_GUIDE : OPENING_PLAY;
}

function startPlaying(world: World): void {
  world.brief.phase = OPENING_PLAY;
  world.brief.ack = 0;
  clearReady(world.brief);
}

function clearReady(b: Briefings): void {
  b.fillP1 = 0;
  b.fillP2 = 0;
  b.holdP1 = false;
  b.holdP2 = false;
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
export function openWave(world: World, hasGuide: boolean): void {
  const b = world.brief;
  b.ack = 0;
  clearReady(b);
  b.guide = hasGuide && world.cfg.briefings;
  b.phase = world.cfg.briefings ? OPENING_INTRO : OPENING_PLAY;
}
