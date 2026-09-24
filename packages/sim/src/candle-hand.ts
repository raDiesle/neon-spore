import { type CandleState, candleBoss, candleWicked } from "./candle.js";
import { enterCandle } from "./candle-step.js";
import { openSlow } from "./slow.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE CANDLE**: the flame, pulled down off the wick by the
 * pilot, off the wire, on the tick.
 *
 * Cut off `candle-step.ts` at the seam `stare-hand.ts` names: next door is
 * what the *glow* does on the beat — go out, drift, turn, light again — and
 * this is what the *thumb* does. On the tick rather than the beat
 * (`step.ts`), because the tick the flame comes off is the tick her beam
 * starts being worth something, and a pull that waited for the beat would
 * spend a beat of `candleSmokeBeats` before the wick was even smoking.
 *
 * **Why the boss needed a hand at all.** Everything above the last step is
 * the trigger: find the column in the dark, fire up it, do not fire up the
 * one he can see and she cannot. That is one gesture, played four times, and
 * the owner's ask of every boss is that its states change and each asks
 * something different (`.claude/skills/new-boss` §6.2). So the last step is
 * taken off the trigger entirely: **the flame is put out by a hand**, which
 * is what a flame is put out by, and then **the wick is finished by the
 * beam**, which is the one light this boss was written never to be able to
 * eat (`candle.ts`). Three things to do instead of one, and the fight ends
 * on the two seats doing different ones inside twelve beats of each other.
 *
 * **It is the pilot's, and the boss is on both screens.** The glow is the
 * only steady light in a black field and is drawn on every screen
 * (`candle-glow.ts`), so either thumb could reach it — and it is his because
 * his hands are otherwise the carriage and hers are otherwise the trigger
 * and the lobe. Hers is the beam behind it; a pull sent from her seat is
 * dropped without a sound, exactly as `queenHeard` drops the other seat's.
 */

/**
 * The pilot's thumb on the flame.
 *
 * `fromYMilli` is how far *down* the thumb has come from where it grabbed,
 * cut to `candlePinchMilli`; a pull upward is no pull, which is what the
 * `Math.max(0, …)` is. The bottom is the event: the tick the depth reaches
 * it the flame is off the wick, the phase is `smoking` and her beam has
 * `candleSmokeBeats` to land. A thumb that lifts before the bottom lets the
 * flame back and nothing has happened.
 *
 * Only in `last`. Every other phase there is a flame with glow behind it and
 * a shot that takes a step off it, and a hand that could pull it out from
 * full would be the whole fight in one stroke.
 */
export function candleWickHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "candleWick") return;
  const c = candleBoss(world);
  if (c === null || player !== 1) return;
  if (!command.on) {
    release(c);
    return;
  }
  if (!candleWicked(c)) return;
  const bottom = world.cfg.candlePinchMilli;
  c.pinchMilli = Math.max(0, Math.min(bottom, Math.round(command.fromYMilli ?? 0)));
  if (c.pinchMilli < bottom) return;
  // Off the wick. `enterCandle` clears the depth on the way out, so the
  // picture has nothing left to draw a half-pulled flame from.
  enterCandle(world, c, "smoking");
  // **THE SLOW is the smoke, exactly** (24 September 2026): the one ask in
  // this fight with a clock on it, opened here and shut by `candle-step.ts`
  // on either way it ends — the beam landing or the wick lighting again.
  openSlow(world, world.cfg.candleSmokeBeats);
}

/**
 * The thumb comes off. From `last` the flame springs back and the depth goes
 * with it; from anywhere else the pull is already spent or was never on, and
 * `pinchMilli` is zero there anyway (`enterCandle`).
 */
function release(c: CandleState): void {
  if (candleWicked(c)) c.pinchMilli = 0;
}
