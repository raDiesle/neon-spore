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
 * addresses: the dial, the word under it, the two calls, and under all of them
 * the blind seat's mine counts. Each row is asked for here and nothing writes
 * its own number, which is what stops the next row added from landing on one
 * of these — and the fuse ring is the one that did, because it was placed off
 * the field's own top edge instead (`fuseRow`).
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

/**
 * Where the blind seat's fuse rings stand, on their own middles (`mine.ts`).
 *
 * **It was `gridTop + r * 1.3` and nothing else**, which is a measurement off
 * the top of the *field* rather than a row in this stack. On a tall phone the
 * field starts a long way down and the two never met. On any screen short
 * enough that the field is limited by its height rather than its width — a
 * laptop window under about 730 tall, a rehearsal's pane — `gridTop` is the
 * radar's own height, 34, and a ring of radius 15 landed at 54 with the dial's
 * middle at 39 and `DIAL_R` also 15. A mine is a `TALKER` kind, so that dial is
 * lit for the whole time a mine stands: the six pips were a dashed rim around
 * its red disc, and the count — the one thing the blind seat has to read the
 * clock off — was not a thing on the screen.
 *
 * `foot` is `shipTopFoot`: how far the dial, the duty word and the two calls
 * actually reach on this screen, asked of the files that draw them rather than
 * worked out again here. `reach` is how far the ring stands out from its own
 * middle, pips included. The row is the lower of the two, so a screen where the
 * field already begins under the chrome draws exactly what it drew before.
 */
export function fuseRow(l: Layout, r: number, reach: number, foot: number | null): number {
  const own = l.gridTop + r * 1.3;
  return foot === null ? own : Math.max(own, foot + GAP + reach);
}
