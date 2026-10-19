import { ticksPerBeat, type World } from "@neon-spore/sim";
import { drawFenceArcs } from "./fence-arc.js";
import { type HullMood, type LobePositions, surfaceSampler } from "./hull.js";
import { hullCrown } from "./hull-crown.js";
import type { HullFrame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawLockLight } from "./lock-light.js";
import { drawMawReach } from "./maw-reach.js";
import { drawOtherHand } from "./other-hand.js";
import { drawGrippedPods } from "./pods.js";
import { drawReachArm } from "./reach-arm.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawThroatGraft } from "./throat-graft.js";

/**
 * **What grows out of the ship**, drawn over the membrane once the hull pass
 * has laid it: THE FENCE's current, THE CLAW's arm, the maw's reach, the
 * lock's light, THE THROAT's root and a hand on the lance. Each is the ship rather than the
 * field, which is why none of them is in the field pass under the hull.
 *
 * Cut out of `frame-ship.ts` on 16 October 2026, when the maw's reach took
 * that file to within a few lines of its limit. The seam is the one the
 * comments already drew: everything here is laid *on* the skin the hull pass
 * made, off the same sampler, and nothing here draws the ship itself.
 */
export function drawShipGrowths(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  mood: HullMood,
  at: LobePositions,
  f: HullFrame,
  /** Whether the swelling player 1 slides is THE CLAW's hand (`frame-ship.ts`). */
  arm: boolean,
): void {
  // **THE FENCE's current, jumping between a wall on its way down and the dome
  // under it** — here rather than in the field pass, because that pass runs
  // under the hull and a bolt drawn there would be painted over at exactly the
  // end that matters (`fence-arc.ts`). Off the same membrane the hull was drawn
  // from, so it lands on the skin the eye is looking at.
  drawFenceArcs(ctx, l, world, at, surfaceSampler(f), view.beatPhase, view.time);
  // THE CLAW's arm, out of the swelling that was the gun and up its column. In
  // the ship pass rather than the field one, and after the hull: it *is* the
  // ship on this panel, and an arm drawn under the membrane would come out
  // from behind the thing it is part of (`reach-arm.ts`).
  drawReachArm(ctx, l, world, surfaceSampler(f), arm, f.cannonX);
  // How far the open maw reaches, on the gun and never on a hand (`maw-reach.ts`).
  if (!arm) drawMawReach(ctx, l, mood.intake, at.cannon, world.cfg.podCatchCols, surfaceSampler(f));
  // Whether a lock is ready, on the gun's own lobe and nowhere a gun is not
  // (`lock-light.ts`).
  if (hullCrown(world, arm) === "gun")
    drawLockLight(ctx, l, world, f, view.time, view.beatPhase, mood.intake);
  // And a heavy pod held in it, waiting for the second press (`pods.ts`).
  drawGrippedPods(ctx, l, world.pods, view.time, ticksPerBeat(world.cfg));
  // THE THROAT's root, grown out of the membrane round the gullet — after the
  // hull for the same reason as the arm: it is the ship (`throat-graft.ts`).
  drawThroatGraft(ctx, l, world, surfaceSampler(f), seatSkin(view.role), view.beatPhase, view.time);
  // A hand on the lance, read straight off the world both devices share (other-hand.ts).
  drawOtherHand(ctx, l, world, view.time, mood, at, f);
}
