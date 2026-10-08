import {
  type LatchGrip,
  type LatchState,
  latchBoss,
  latchGripCol,
  latchGripSeat,
} from "./latch.js";
import { latchHauled, latchSlips } from "./latch-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LATCH's hands: two grips on the one tendril, `latchGripLeft` and
 * `latchGripRight`, each pulled **down** — `fromYMilli` the depth, the way
 * THE MANTLE's handles are (`mantle-hand.ts`).
 *
 * **A grip is its seat's**: the pilot's the left and the navigator's the
 * right, crossed in a `cross` level (`latchGripSeat`). A thumb going down on
 * the partner's grip takes hold of nothing and is said (`latchWrong`), never
 * silently ignored — the owner, 7 October 2026, on THE TRAPEZE: *I don't
 * understand why nothing happens on tap.* A grab is the message that has not
 * moved yet; the ones after it are the same thumb going on, and are not said
 * again.
 *
 * **Taking hold** marks where on the tendril the grip is (`anchorMilli`), less
 * the depth the thumb already has, so a thumb that was down before its level
 * lit takes hold without the tendril jumping. **Pulling**, by the grip whose
 * turn it is, carries the tendril down as far as the anchor and the depth
 * reach, never past `latchReachMilli` of depth; the other grip pulled does
 * nothing but hold. **Letting go** after a pull of `latchStrokeMilli` passes
 * the turn (`latchTurn`) — unless the other grip is not held, when both are
 * off and the tendril slips back to the last knot (`latchSlips`), and the
 * same grip pulls again.
 *
 * Outside a level the grips are still taken and let go, so a thumb can be
 * waiting on the tendril when the level lights, but nothing is pulled and
 * nothing slips.
 */
export function latchHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const grip = gripOf(command.target);
  if (grip === null) return;
  const s = latchBoss(world);
  if (s === null || s.phase === "spent") return;
  const seat: 0 | 1 = player === 1 ? 0 : 1;
  const depth = Math.max(
    0,
    Math.min(world.cfg.latchReachMilli, Math.round(command.fromYMilli ?? 0)),
  );
  if (latchGripSeat(s, grip) !== seat) {
    if (command.on && depth === 0 && command.fromMilli === 0) wrong(world, seat, grip);
    return;
  }
  if (!command.on) {
    letGo(world, s, grip);
    return;
  }
  if (!s.down[grip]) take(world, s, seat, grip, depth);
  s.depthMilli[grip] = depth;
  if (s.phase === "level" && grip === s.turn) latchHauled(world, s, s.anchorMilli[grip] + depth);
}

function gripOf(target: string): LatchGrip | null {
  if (target === "latchGripLeft") return 0;
  if (target === "latchGripRight") return 1;
  return null;
}

function take(world: World, s: LatchState, seat: 0 | 1, grip: LatchGrip, depth: number): void {
  s.down[grip] = true;
  s.anchorMilli[grip] = s.hauledMilli - depth;
  world.events.push({ type: "latchGrip", seat, grip, col: latchGripCol(world.cfg, grip) });
}

function letGo(world: World, s: LatchState, grip: LatchGrip): void {
  if (!s.down[grip]) return;
  const pulled = s.depthMilli[grip];
  s.down[grip] = false;
  s.depthMilli[grip] = 0;
  if (s.phase !== "level") return;
  const other: LatchGrip = grip === 0 ? 1 : 0;
  if (!s.down[other] && s.hauledMilli > s.floorMilli) {
    latchSlips(world, s, "both");
    return;
  }
  if (grip !== s.turn || pulled < world.cfg.latchStrokeMilli) return;
  s.turn = other;
  // Its pull starts from where its thumb is now, on the rope the last pull left.
  s.anchorMilli[other] = s.hauledMilli - s.depthMilli[other];
  world.events.push({ type: "latchTurn", grip: other, col: latchGripCol(world.cfg, other) });
}

function wrong(world: World, seat: 0 | 1, grip: LatchGrip): void {
  world.events.push({ type: "latchWrong", seat, grip, col: latchGripCol(world.cfg, grip) });
}
