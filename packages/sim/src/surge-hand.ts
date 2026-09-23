import { liftTogetherUntil } from "./beat-clock.js";
import { type SurgeState, surgeBoss, surgeEverting, surgeHeld, surgeSealing } from "./surge.js";
import { surgeDrop, surgeHandCol, surgeJudge } from "./surge-seam.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two thumbs on THE SURGE**, off the wire, on the tick.
 *
 * Cut off `surge-step.ts` at the seam `sinew-hand.ts` names: next door is
 * what the *bulb* does on the beat — the charge, the leak, the feeding, the
 * burst at the top — and this is what the *hands* do, which is the half
 * with the coupling in it. On the tick rather than the beat (`step.ts`),
 * because the whole fight is two lifts inside one beat of each other, and a
 * lift that waited for the beat to register would be a lift with no time
 * on it.
 *
 * **One target for both seats**, `surgeBulb`: a thumb anywhere on the body
 * charges it, and which seat's it is the wire says (`Command.player`), for
 * `balloonHeard`'s reason. The press is worth nothing in itself — the
 * charge is the clock's — and the *lift* is the command this boss exists
 * for: the first thumb off starts a beat, the second inside it is judged
 * (`surge-seam.ts`), and one after it is a charge lost.
 */

/**
 * One thumb off the bulb. With the other still on, the beat starts and the
 * charge goes on climbing under one hand — the design's *partner problem*.
 * With both off, the lift is judged: mutual if this one came inside
 * `ticksPerBeat` of the first, and lost otherwise.
 */
export function surgeLift(world: World, s: SurgeState, player: 1 | 2): void {
  if (!surgeHeld(s, player)) return;
  surgeDrop(world, s, player);
  if (surgeEverting(s)) return;
  if (surgeHeld(s, player === 1 ? 2 : 1)) {
    s.liftTick = world.tick;
    return;
  }
  const mutual = s.liftTick >= 0 && world.tick <= liftTogetherUntil(world.cfg, s.liftTick);
  s.liftTick = -1;
  surgeJudge(world, s, mutual);
}

/**
 * One seat's thumb on the bulb, off the wire. While the bulb re-seals from a
 * burst nothing takes hold, and a finger that never left the glass is a
 * hand again the beat it stops. A thumb going back on while the other
 * seat's lift is pending cancels the lift: the pair is holding again.
 */
export function surgeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "surgeBulb") return;
  const s = surgeBoss(world);
  if (s === null) return;
  if (!command.on) {
    surgeLift(world, s, player);
    return;
  }
  if (surgeEverting(s) || surgeSealing(s, world) || surgeHeld(s, player)) return;
  if (player === 1) s.heldP1 = true;
  else s.heldP2 = true;
  s.liftTick = -1;
  world.events.push({ type: "surgeGrip", player, col: surgeHandCol(world, player) });
}
