import { nextInt } from "./rng.js";
import { type SinewState, sinewBandMilli, sinewZoneWidth } from "./sinew.js";
import type { World } from "./world.js";

/*
 * THE SINEW's zone: where on the band the next fibre parts. Cut off
 * `sinew-step.ts` when the stretches made the roll longer than the clock
 * around it; it is called from there, at the install and at every part.
 */

/**
 * Where the zone sits for the fibre now hanging by.
 *
 * **Every fibre but the last gets a stretch of the band of its own** (the
 * owner, 2 October 2026): from `sinewZoneLowMilli` up to just under the last
 * fibre's zone the band is cut into one stretch per fibre, and each roll
 * takes one not yet taken and lands somewhere inside it — so over a fight
 * the zone visits the whole height, in an order the pair cannot learn.
 *
 * The last fibre's zone is the last step under the top: one hand at the
 * limit and the other all but, which is the hardest sum there is to say —
 * and still one that can be over-pulled, because the top of the band is the
 * snap and not the zone, and the last fibre's snap is the one that throws
 * three rocks. It is the only zone that ever reaches the top.
 */
export function rollZone(world: World, s: SinewState): void {
  const cfg = world.cfg;
  const width = sinewZoneWidth(s, cfg);
  const narrow = Math.max(1, cfg.sinewZoneNarrowMilli);
  const lastLow = Math.max(0, sinewBandMilli(cfg) - narrow * 2);
  if (s.fibres <= 1) {
    s.zoneLowMilli = lastLow;
    return;
  }
  const slots = Math.max(1, cfg.sinewFibres - 1);
  const floor = Math.max(0, Math.min(lastLow - width, cfg.sinewZoneLowMilli));
  const size = Math.floor(Math.max(0, lastLow - width - floor) / slots);
  let free = 0;
  for (let k = 0; k < slots; k++) if ((s.zoneSlots & (1 << k)) === 0) free++;
  // Every stretch taken (a config with more fibres than the roll counted):
  // start the round of them again rather than stand the zone still.
  if (free === 0) {
    s.zoneSlots = 0;
    free = slots;
  }
  let pick = nextInt(world.rng, free);
  let slot = 0;
  for (let k = 0; k < slots; k++) {
    if ((s.zoneSlots & (1 << k)) !== 0) continue;
    if (pick === 0) {
      slot = k;
      break;
    }
    pick--;
  }
  s.zoneSlots |= 1 << slot;
  s.zoneLowMilli = floor + slot * size + nextInt(world.rng, size + 1);
}
