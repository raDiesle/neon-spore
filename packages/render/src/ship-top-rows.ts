import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { sirenDrop, sirenFoot } from "./siren.js";

/**
 * The rows the two alarm bands are written on, stacked under the siren.
 *
 * **They used to be two constants and one of them was the siren's.** The duty
 * word is drawn on its own middle at `cy + DIAL_R + DUTY_DROP`, a baseline of
 * 66 with the dial where it stands; TORCH's call was drawn at `ALARM_TOP +
 * ALARM_HEIGHT - 2`, which is also 66. So a wave that raised a call *and* owed
 * a word printed the two over each other — the word centred, the call
 * right-aligned and long enough to reach the middle — and had done since the
 * alarm was written. It was found on a rehearsal (photographed 0efcf7ba,
 * `ROCK` sitting under the word TORCH) only because the tutorial band had
 * covered both until that morning.
 *
 * So the top of the ship's own chrome is a stack rather than a set of
 * addresses: the dial, the word under it, then the two calls. Each row is
 * asked for here and nothing writes its own number, which is what stops the
 * next row added from landing on one of these.
 */

/** How tall a band is, and how it is drawn (`torch-alarm.ts`). */
export const ALARM_HEIGHT = 12;
/** Clear of the hull bar (`hud.ts`, y = 14) and the guard balance (y = 48),
 * when the siren is not up and nothing else is claiming the room. */
const TORCH_TOP = 56;
/** Between the siren's lowest row and the first band under it. */
const GAP = 2;
/** Between the two bands. The two never share a wave today and a director
 * could still author one that does. */
const STEP = ALARM_HEIGHT + 2;

/** Where each band's top edge goes on this screen. */
export function alarmRows(
  l: Layout,
  world: World,
  clearTop: number | undefined,
): { torch: number; magnet: number } {
  const under = sirenFoot(l, world, clearTop);
  const torch = Math.max(TORCH_TOP + sirenDrop(clearTop), under === null ? 0 : under + GAP);
  return { torch, magnet: torch + STEP };
}
