import { liftTogetherUntil } from "./beat-clock.js";
import {
  type BellowsState,
  bellowsBoss,
  bellowsChamberCol,
  bellowsHeld,
  bellowsLast,
  bellowsShared,
  bellowsTurn,
  bellowsWorking,
  NO_HAND,
  NO_LIFT,
} from "./bellows.js";
import { jamHandles, markAgain, partSeam, splitWaist } from "./bellows-step.js";
import { midCol } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two handles on THE BELLOWS**, off the wire, on the tick.
 *
 * Cut off `bellows-step.ts` at the seam `sinew-hand.ts` names: next door is
 * what the *lung* does on the beat, and this is what the *hands* do — which
 * on this boss is nearly the whole fight, because the one question it asks is
 * whether a stroke came in the right seat's beat, and that is decided the
 * instant it lands or not at all. On the tick rather than the beat
 * (`step.ts`) for `surge-hand.ts`' reason with more riding on it: the finale
 * is two hands off inside a beat of each other, and a lift that waited for
 * the beat to register would be a lift with no time on it.
 *
 * **A handle per seat, fixed, and never negotiated**, `sinewLeft`'s rule:
 * `bellowsPull` is player 1's and `bellowsPush` player 2's, so the seat is
 * checked against the target's name here rather than carried beside it.
 *
 * **The act is an edge and never a level.** A handle *crossing*
 * `bellowsWorkMilli` on its way down is the stroke; a thumb resting past it
 * is nothing at all, and a second stroke needs the hand lifted and brought
 * down again. Level would make a held handle an act every tick, which on a
 * boss whose whole rule is *not in her beat* would jam the pair for holding
 * still.
 */

/**
 * One seat's hand on its own handle, off the wire. `fromYMilli` is how far
 * *down* it has been carried from where it was taken hold of, cut to
 * `bellowsReachMilli`; a stroke upward is no stroke, which is `sinewHeard`'s
 * rule and the same reason — a chamber already shut has nowhere shut to go.
 */
export function bellowsHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const side = command.target === "bellowsPull" ? 1 : command.target === "bellowsPush" ? 2 : null;
  if (side === null || side !== player) return;
  const s = bellowsBoss(world);
  if (s === null) return;
  if (!command.on) {
    releaseBellows(world, s, player);
    return;
  }
  // Jammed handles take no hand, and a split waist has none to take.
  if (s.phase === "jam" || s.phase === "vent" || s.phase === "still") return;
  const reach = world.cfg.bellowsReachMilli;
  const was = s.handMilli[player - 1] ?? NO_HAND;
  const now = Math.max(0, Math.min(reach, Math.round(command.fromYMilli ?? 0)));
  s.handMilli[player - 1] = now;
  if (was === NO_HAND) {
    // A hand going back on cancels a pending lift: the pair is holding again.
    s.liftTick = NO_LIFT;
    world.events.push({ type: "bellowsGrip", player, col: bellowsChamberCol(world.cfg, player) });
  }
  if (bellowsLast(s) || !bellowsWorking(s)) return;
  const work = world.cfg.bellowsWorkMilli;
  const from = was === NO_HAND ? 0 : was;
  if (from >= work || now < work) return;
  workHandle(world, s, player);
}

/**
 * **One stroke, judged against whose beat it is** — `Alternation`, and the
 * whole of this boss.
 *
 * `bellowsTurn` names the seat the lung is waiting on; anyone else's stroke
 * jams both handles and spends the exchange. His lands the pull and hands the
 * beat to her; hers lands the push, and a clean pull-then-push is a seam — in
 * the shared window, the `bellowsExchanges`th of them, each one short of it
 * lighting the marks again.
 */
function workHandle(world: World, s: BellowsState, player: 1 | 2): void {
  if (bellowsTurn(s) !== player) {
    jamHandles(world, s, {
      type: "bellowsJam",
      player,
      col: bellowsChamberCol(world.cfg, player),
    });
    return;
  }
  if (player === 1) {
    s.phase = "push";
    s.phaseBeat = world.beat;
    world.events.push({ type: "bellowsPulled", col: bellowsChamberCol(world.cfg, 1) });
    return;
  }
  if (bellowsShared(s) && s.exchanged + 1 < world.cfg.bellowsExchanges) {
    s.exchanged += 1;
    markAgain(world, s);
    return;
  }
  partSeam(world, s);
}

/**
 * One hand off its handle. Anywhere but the finale that is worth nothing —
 * the stroke has already been judged, or has not happened, and a hand coming
 * off is a hand the next stroke starts from.
 *
 * **In the finale it is the gesture.** The first hand off starts a beat and
 * the second inside it splits the waist; the second outside it is the last
 * seam holding, and the pair takes hold again. A single hand that was never
 * one of a pair is judged as nothing at all, so a seat feeling for the handle
 * alone cannot spend the finale by itself.
 */
export function releaseBellows(world: World, s: BellowsState, player: 1 | 2): void {
  if (!bellowsHeld(s, player)) return;
  s.handMilli[player - 1] = NO_HAND;
  if (!bellowsLast(s)) return;
  if (bellowsHeld(s, player === 1 ? 2 : 1)) {
    s.liftTick = world.tick;
    return;
  }
  if (s.liftTick === NO_LIFT) return;
  const mutual = world.tick <= liftTogetherUntil(world.cfg, s.liftTick);
  s.liftTick = NO_LIFT;
  if (mutual) splitWaist(world, s);
  else world.events.push({ type: "bellowsHold", col: midCol(world.cfg) });
}
