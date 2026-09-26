import { INNER, NO_CATCH, NO_LATCH, OUTER, type World } from "@neon-spore/sim";
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
 * THE RATCHET's catch is the navigator's, drawn while it has a depth, and its
 * pawl the pilot's, drawn for as long as his thumb is down on the pad.
 * THE MANTLE's knobs are one a seat, left the pilot's and right the
 * navigator's, each drawn while the simulation has it pulled down its groove.
 * THE OCULUS's halves are the same pair, each drawn while its leaf is held,
 * and THE VISE's lobes, each drawn while a pinch is on it. THE TRIVET's
 * feet are one a seat again, each drawn while any pad of its chord is down,
 * and THE CYST's flanks, each drawn while its pincher has it closing.
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
  if (b?.kind === "ratchet") {
    if (seat === 1) return b.pawlDown ? handleCircle(l, world, "ratchetPawl", beatPhase) : null;
    if (b.catchMilli === NO_CATCH) return null;
    return handleCircle(l, world, "ratchetCatch", beatPhase);
  }
  if (b?.kind === "mantle") {
    if (b.depthMilli[seat === 1 ? 0 : 1] <= 0) return null;
    return handleCircle(l, world, seat === 1 ? "mantleLeft" : "mantleRight", beatPhase);
  }
  if (b?.kind === "oculus") {
    if (!b.held[seat === 1 ? 0 : 1]) return null;
    return handleCircle(l, world, seat === 1 ? "oculusLeafLeft" : "oculusLeafRight", beatPhase);
  }
  if (b?.kind === "vise") {
    if (b.gapMilli[seat === 1 ? 0 : 1] >= world.cfg.viseOpenMilli) return null;
    return handleCircle(l, world, seat === 1 ? "viseLobeLeft" : "viseLobeRight", beatPhase);
  }
  if (b?.kind === "sling") {
    if (!b.holding[seat === 1 ? 0 : 1]) return null;
    return handleCircle(l, world, seat === 1 ? "slingDrawLeft" : "slingDrawRight", beatPhase);
  }
  if (b?.kind === "trivet") {
    if (b.padsDown[seat === 1 ? 0 : 1] === 0) return null;
    return handleCircle(l, world, seat === 1 ? "trivetPadFront" : "trivetPadRear", beatPhase);
  }
  if (b?.kind === "cyst") {
    const side = seat === 1 ? 0 : 1;
    if (b.gapMilli[side] >= world.cfg.cystOpenMilli) return null;
    return handleCircle(l, world, side === 0 ? "cystFlankLeft" : "cystFlankRight", beatPhase);
  }
  if (b?.kind === "davit") {
    if (!b.holding[seat === 1 ? 0 : 1]) return null;
    return handleCircle(l, world, seat === 1 ? "davitLooseLeft" : "davitLooseRight", beatPhase);
  }
  return null;
}
