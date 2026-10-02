import { stareCharging, stareLashesOwed } from "./stare.js";
import { stareBoss, stareVented } from "./stare-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The one hand on THE STARE**: its lashes, pulled up off the charging eye
 * one at a time so the beam vents out to the sides, off the wire, on the tick.
 *
 * Cut off `stare-step.ts` at the seam `sinew-hand.ts` names: next door is
 * what the *eye* does on the beat, this is what the *thumb* does. On the tick,
 * because a charge is a race and a lash that waited for the beat would lose
 * it up to a beat after the thumb had won.
 *
 * **Both seats pull at once**, and only while the eye charges: the owner,
 * 2 October 2026 — *instead of pulling middle, players need to pull up a
 * number of lashes.* The count is the pair's together, so a level with
 * thirty-two of them is split between two thumbs, out loud: *I have the left*.
 * Which lash comes up is the picture's (render/): the simulation counts.
 */

/**
 * One seat's thumb on the lashes. `fromYMilli` is how far the thumb has come
 * from where it grabbed, down positive; a lash comes up each time the thumb
 * has risen `stareLashPullMilli` above the lowest it has been since the last
 * one, so a thumb pulls lash after lash by going up, down and up again.
 */
export function stareLashHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "stareLash") return;
  const s = stareBoss(world);
  if (s === null) return;
  const seat = player - 1;
  if (!command.on || !stareCharging(s)) {
    s.lashHeld[seat] = false;
    s.lashMilli[seat] = 0;
    return;
  }
  const y = Math.round(command.fromYMilli ?? 0);
  if (!s.lashHeld[seat]) {
    s.lashHeld[seat] = true;
    s.lashBaseMilli[seat] = y;
  }
  const base = Math.max(s.lashBaseMilli[seat] as number, y);
  s.lashBaseMilli[seat] = base;
  const pull = world.cfg.stareLashPullMilli;
  const up = base - y;
  if (up < pull) {
    s.lashMilli[seat] = Math.max(0, up);
    return;
  }
  s.lashesUp += 1;
  s.lashBaseMilli[seat] = y;
  s.lashMilli[seat] = 0;
  const owed = stareLashesOwed(s, world.cfg);
  world.events.push({ type: "stareLash", player, up: s.lashesUp, of: owed });
  if (s.lashesUp >= owed) stareVented(world, s, player);
}
