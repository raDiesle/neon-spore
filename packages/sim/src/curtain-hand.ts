import { curtainBoss, curtainHemHigh } from "./curtain.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE CURTAIN that is not the shove**: the hem, lifted off
 * the floor by the pilot while the rail is jammed, off the wire, on the tick.
 *
 * Cut off `curtain-step.ts` at the seam `gorge-hand.ts` names: next door is
 * what the *sheet* does on the beat — the jam running down, the soft set
 * redrawn, the core firing — and this is what the *thumb* does. On the tick
 * rather than the beat (`step.ts`), because the gap over the core is open
 * only while it is held, and a lift that waited for the beat would be one the
 * pilot had already let go of.
 *
 * **Why the boss needed a second hand at all.** Everything THE CURTAIN asked
 * for was one gesture played over: shove the sheet off the core, fire up the
 * column. That is a good sentence and the fight said it three times in a row,
 * and the owner's ask of every boss is that its states change and each asks
 * something different (`.claude/skills/new-boss` §6.2). So a hit now **jams
 * the rail** for `curtainPinBeats`: the shove is refused whole
 * (`curtain-shove.ts`), and the only way back to the core is under the cloth
 * rather than around it. Three short words across the table instead of two —
 * **SHOVE**, **FIRE**, **LIFT** — and the middle one is the only one that
 * works in every state.
 *
 * **It is the pilot's, and the boss is on both screens.** Which lobes are
 * soft is his to read and where the shadow stands is hers (`curtain.ts`), so
 * the hem is his for the reason the shadow is not: the hand goes to the seat
 * that is not already being asked for the column. Hers is the shot through
 * the gap he opens; a lift sent from her seat is dropped without a sound,
 * exactly as `gorgeHeard` drops the other seat's.
 *
 * **Only while `pinned`.** A sheet free to slide gives sideways before it
 * gives upward, and a hem that could be lifted from `hung` would be a second,
 * quieter way to do the shove's job with one hand instead of two.
 */

/**
 * The pilot's thumb under the hem.
 *
 * `fromYMilli` is how far the thumb has come from where it grabbed and is
 * negative going *up* the screen, so the lift is `-fromYMilli` cut to
 * `curtainLiftMilli`; a carry downward is no lift, which is what the
 * `Math.max(0, …)` is. Unlike THE CANDLE's pull there is no bottom that
 * spends the gesture: the gap is open **while** the hem is at the top and
 * shuts the tick it is not, so the pair has to fire into a hand that is still
 * holding (`curtainHemHigh`, `curtainCoreBare`).
 */
export function curtainHemHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "curtainHem") return;
  const c = curtainBoss(world);
  if (c === null || player !== 1) return;
  if (!command.on) {
    c.liftMilli = 0;
    return;
  }
  if (c.phase !== "pinned") return;
  const was = curtainHemHigh(c, world.cfg);
  const top = world.cfg.curtainLiftMilli;
  c.liftMilli = Math.max(0, Math.min(top, -Math.round(command.fromYMilli ?? 0)));
  // The edge, not the depth: how far the hem has come is in the world every
  // frame, and the tick worth saying is the one the gap opens
  // (`events-curtain.ts`).
  if (!was && curtainHemHigh(c, world.cfg)) {
    world.events.push({ type: "curtainLift", col: c.coreCol });
  }
}
