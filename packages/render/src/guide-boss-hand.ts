import { INNER, NO_LATCH, OUTER, type World } from "@neon-spore/sim";
import { gimbalHeld } from "./gimbal-grip.js";
import { handleCircle } from "./handles.js";
import { haspWheelHand } from "./hasp-grip.js";
import type { Circle, Layout } from "./layout.js";

/**
 * **The ghost hand on a clock boss's own handle** — the ones gripped on both
 * seats at once, where `guide-hand.ts` draws one pilot's hand on a cord.
 *
 * Its own file because `guide-hand.ts` sits at the length ceiling and three
 * bosses were waiting to be filmed behind this one, each a hand per seat. The
 * rule is that file's: the simulation says whether a hand is on, and the
 * handle's own circle — the one a real thumb is hit-tested against — says
 * where, so the ghost cannot stand where the finger would have missed.
 *
 * THE GIMBAL first: the outer ring is the pilot's and the inner the
 * navigator's, by geometry (`sim/gimbal-hand.ts`), and a ring is held for as
 * long as the simulation has a bearing for it. THE HASP's latch is the
 * pilot's, held while it has a depth; the wheel is the navigator's, and her
 * thumb is drawn where her hand has gone round to rather than where the
 * wheel stands, so a seized wheel is a hand going round a wheel that is not.
 */
export function bossThumb(l: Layout, world: World, seat: 1 | 2, beatPhase: number): Circle | null {
  const b = world.boss;
  if (b?.kind === "gimbal") {
    if (!gimbalHeld(b, seat === 1 ? OUTER : INNER)) return null;
    return handleCircle(l, world, seat === 1 ? "gimbalOuter" : "gimbalInner", beatPhase);
  }
  if (b?.kind === "hasp") {
    if (seat === 2) return haspWheelHand(l, world.cfg, b);
    if (b.latchMilli === NO_LATCH) return null;
    return handleCircle(l, world, "haspLatch", beatPhase);
  }
  return null;
}
