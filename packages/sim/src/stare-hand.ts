import { stareCharging } from "./stare.js";
import { stareBoss, stareVented } from "./stare-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE STARE**: the lid, pulled down over the charging eye
 * so the beam vents out to the sides, off the wire, on the tick.
 *
 * Cut off `stare-step.ts` at the seam `sinew-hand.ts` names: next door is
 * what the *eye* does on the beat, this is what the *thumb* does. On the tick,
 * because a charge is a race and a lid that waited for the beat would lose it
 * up to a beat after the thumb had won.
 *
 * **Either seat may pull**, and only while the eye charges: the owner, 29
 * September 2026 — *it looks like it's charging a massive beam, so they need
 * to open it in time so it releases energy to the sides.* Whoever has a thumb
 * free takes it, which is the sentence the charge exists for: *I have it*.
 */

/**
 * One seat's thumb on the lid. `fromYMilli` is how far *down* the thumb has
 * come from where it grabbed, cut to `stareLidPullMilli`; the bottom is the
 * vent. A thumb that lifts before the bottom lets the lid spring back.
 */
export function stareLidHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "stareLid") return;
  const s = stareBoss(world);
  if (s === null) return;
  if (!command.on) {
    if (s.lidSeat !== player) return;
    s.lidSeat = 0;
    s.lidMilli = 0;
    return;
  }
  if (!stareCharging(s)) return;
  // The first thumb on it has it; a second is on nothing until that one lifts.
  if (s.lidSeat !== 0 && s.lidSeat !== player) return;
  const bottom = world.cfg.stareLidPullMilli;
  s.lidSeat = player;
  s.lidMilli = Math.max(0, Math.min(bottom, Math.round(command.fromYMilli ?? 0)));
  if (s.lidMilli < bottom) return;
  s.lidSeat = 0;
  s.lidMilli = 0;
  stareVented(world, s, player);
}
