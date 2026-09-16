import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { magnetAlarmFoot } from "./magnet-alarm.js";
import { sirenFoot } from "./siren.js";
import { torchAlarmFoot } from "./torch-alarm.js";

/**
 * How far down the ship's own chrome reaches at the top of a screen.
 *
 * Three things are written there and none of them belongs to the field: the
 * siren's dial with the duty word under it, TORCH's call, and THE MAGNET's.
 * All three hang off the same cluster and all three drop together under a
 * rehearsal's plate (`sirenDrop`), so the row they end on is not a constant
 * anybody can copy — it depends on the plate, on which of them is up, and on
 * which seat is looking.
 *
 * **It exists because a rehearsal's caption box was landing on it.** The band
 * used to cover all three, so the caption had nothing to collide with; the
 * moment the chrome came out from under the band (16 September 2026) the page
 * covered it instead — `TORCH · COLUMNS 3-4 · CALL IT` read as `-4 · CALL IT`
 * and the duty word `PULL` was half a word. The caption already knows how to
 * keep off one box, THE HANDOVER's countdown plate; this is the other one
 * (`guide-tide-caption.ts`).
 *
 * Each number is asked of the file that draws it rather than written down
 * again here, which is the rule `caption-anchor.ts` already plays by: a row
 * that moves takes its own clearance with it.
 */
export function shipTopFoot(l: Layout, world: World, clearTop: number | undefined): number | null {
  let foot: number | null = null;
  for (const y of [
    sirenFoot(l, world, clearTop),
    torchAlarmFoot(l, world, clearTop),
    magnetAlarmFoot(l, world, clearTop),
  ]) {
    if (y !== null && (foot === null || y > foot)) foot = y;
  }
  return foot;
}
