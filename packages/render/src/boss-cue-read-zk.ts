import {
  type HalterState,
  halterGripped,
  halterLitStep,
  halterResters,
  halterSeatIndex,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { fieldX } from "./field-flip.js";
import { halterGripStanding } from "./halter-grip.js";
import type { Layout } from "./layout.js";

/**
 * **What THE HALTER is asking for** — page thirty-seven of the readings, THE
 * TRIVET's (`boss-cue-read-zh.ts`) with half of it taken away. Both screens
 * draw the whole seam, the lit segment and its two grips included, so the
 * word only keeps itself to the seat whose thumbs can act on it.
 *
 * **`HOLD` between the lit segment's grips, to the seat that grips**: the
 * pilot on a left step, the navigator on a right. It goes the moment both
 * grips are down — a word over a chord held could only say *keep going* —
 * and a chord let go is owed it again. **A guard** may be gripped by either
 * seat, and which one is the pair's to settle out loud, so until a thumb is
 * on a grip both are shown it; after, only the seat with the thumb.
 *
 * **Nothing on the resting seat, ever.** Its answer is to do nothing, and
 * the plating going still under the other seat's chord is what tells it so
 * (`halterShake`); a word would be a thing on the glass inviting a thumb.
 *
 * **`FIRE` at the hull under the middle column** on a shot with the centre
 * bared, to either seat. The step's colour is never named — the core is lit
 * in it, on both screens.
 */

const HALF_W = 0.9;
const HALF_H = 0.62;

export function halterCues(
  l: Layout,
  world: World,
  s: HalterState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = { halfW: l.tile * HALF_W, halfH: l.tile * HALF_H };
  const step = halterLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.bared) return [];
    const x = fieldX(l, midCol(world.cfg));
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, seed: 157 }];
  }
  const left = halterGripStanding(l, world.cfg, s, 0, world.beat, beatPhase);
  const right = halterGripStanding(l, world.cfg, s, 1, world.beat, beatPhase);
  if (left === null || right === null) return [];
  const seat = gripper(s);
  const held: readonly (1 | 2)[] = seat === null ? [1, 2] : [seat];
  if (held.some((k) => halterGripped(s, k))) return [];
  const x = (left.x + right.x) / 2;
  const y = (left.y + right.y) / 2;
  return [{ seat, kind: "HOLD", word: "HOLD", x, y, ...frame, seed: 158 }];
}

/**
 * The seat the lit step wants gripping: the one that may not rest; on a
 * guard the one with a thumb already down, or `null` — both — while neither
 * has one.
 */
function gripper(s: HalterState): 1 | 2 | null {
  const resters = halterResters(s);
  if (resters.length === 1) return resters[0] === 1 ? 2 : 1;
  const down = ([1, 2] as const).filter((seat) => s.grips[halterSeatIndex(seat)] !== 0);
  return down.length === 1 ? (down[0] ?? null) : null;
}
