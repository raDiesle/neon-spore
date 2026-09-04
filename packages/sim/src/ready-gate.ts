import type { Briefings } from "./briefing.js";
import { msToTicks, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * The ready gate a guide ends on: two circles, filling while a thumb is down,
 * and the guide passes when both say READY.
 *
 * Its own file beside `briefing.ts`, and the seam is the one that file already
 * had a heading at: next door owns *the order a wave opens in* — which state
 * is up, what passes it, and what the tick does behind it — and this owns one
 * of those states' single mechanism. `briefing.ts` re-exports everything here,
 * so nothing that already reached for `seatReady` through it had to move.
 *
 * ## The two rules it inherits from THE FORK
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
 * ## How long the hold is
 *
 * `cfg.readyHoldMs`, and it is short. It used to be 1200 ms, which is long
 * enough to feel like a penalty on the second run of a wave and long enough
 * that a thumb put down and taken off again reads as a control that did not
 * work. The gate's job is to prove the pair looked at the screen, and a fifth
 * of a second of contact does that; the reading time is bought by the guide
 * being in front of them at all, not by the length of the hold.
 */

/** How many ticks a seat has to hold before its circle says READY. */
export function readyHoldTicks(cfg: SimConfig): number {
  return Math.max(1, msToTicks(cfg, cfg.readyHoldMs));
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

/** Both circles full. What `briefing.ts` asks before it lets the guide go. */
export function gateCrossed(world: World): boolean {
  return seatReady(world, 1) && seatReady(world, 2);
}

/** A thumb going down or coming up. A lift empties a circle that is not full. */
export function holdHeard(world: World, player: 1 | 2, on: boolean): void {
  const b = world.brief;
  if (player === 1) b.holdP1 = on;
  else b.holdP2 = on;
  if (on || seatReady(world, player)) return;
  if (player === 1) b.fillP1 = 0;
  else b.fillP2 = 0;
}

/** One tick's worth of holding. A full circle stays full whatever its thumb does. */
export function fillHeldCircles(world: World): void {
  const b = world.brief;
  const full = readyHoldTicks(world.cfg);
  if (b.holdP1 && b.fillP1 < full) b.fillP1 += 1;
  if (b.holdP2 && b.fillP2 < full) b.fillP2 += 1;
}

/** One seat's circle filled outright — a caller with no thumbs (`ackBriefing`). */
export function fillCircle(world: World, player: 1 | 2): void {
  const full = readyHoldTicks(world.cfg);
  if (player === 1) world.brief.fillP1 = full;
  else world.brief.fillP2 = full;
}

export function clearReady(b: Briefings): void {
  b.fillP1 = 0;
  b.fillP2 = 0;
  b.holdP1 = false;
  b.holdP2 = false;
}
