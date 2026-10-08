import {
  type TrapezeSide,
  type TrapezeState,
  trapezeBoss,
  trapezeCaller,
  trapezeInward,
  trapezeLitStep,
  trapezeOnSide,
  trapezeSwiping,
} from "./trapeze.js";
import { trapezeCol, trapezeShove } from "./trapeze-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TRAPEZE's hands: a swipe on either side of the swing, and the pilot's
 * tap on the alien.
 *
 * **A swipe** is `trapezePushLeft` or `trapezePushRight`, by the half of the
 * field the finger went down on: `on: true` the finger down, the lift
 * carrying how far it went across on `fromMilli`. It is judged at the lift,
 * and **it never does nothing silently** — the owner, 7 October 2026: *I
 * don't understand why nothing happens on tap.* A lift that pushes is a
 * `trapezePush`; one while the swing goes out on that side is a
 * `trapezeBrake`; anything else is a `trapezeWhiff` with its reason: not this
 * seat's side (`seat`), the swing not there or this side already pushed this
 * half swing (`time`), or not swiped toward the middle far enough (`way`).
 *
 * **The tap** is `trapezeLock`, the pilot's press on the alien in a `lock`
 * level: the cannon locks on it for `trapezeLockBeats` (`lock.ts` steers the
 * bolt). The navigator's tap there falls through, since the navigator fires.
 */
export function trapezeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = trapezeBoss(world);
  if (s === null) return;
  const seat: 0 | 1 = player === 1 ? 0 : 1;
  if (command.target === "trapezeLock") {
    if (command.on) lock(world, s, seat);
    return;
  }
  const zone = zoneOf(command.target);
  if (zone === 0) return;
  if (command.on) {
    s.down[seat] = zone;
    return;
  }
  if (s.down[seat] !== zone) return;
  s.down[seat] = 0;
  if (!Number.isInteger(command.fromMilli)) return;
  swiped(world, s, seat, zone, command.fromMilli);
}

function zoneOf(target: string): -1 | 0 | 1 {
  if (target === "trapezePushLeft") return -1;
  if (target === "trapezePushRight") return 1;
  return 0;
}

function swiped(
  world: World,
  s: TrapezeState,
  seat: 0 | 1,
  zone: TrapezeSide,
  fromMilli: number,
): void {
  if (!trapezeSwiping(s)) return;
  const cfg = world.cfg;
  const col = trapezeCol(world, s);
  const why =
    trapezeCaller(s, zone) !== seat
      ? "seat"
      : -zone * fromMilli < cfg.trapezeSwipeMilli
        ? "way"
        : trapezeOnSide(cfg, s) !== zone || s.pushedHalf === s.half
          ? "time"
          : null;
  if (why !== null) {
    world.events.push({ type: "trapezeWhiff", seat, zone, why, col });
    return;
  }
  const gain = trapezeInward(cfg, s);
  trapezeShove(world, s, gain, true);
  world.events.push({ type: gain ? "trapezePush" : "trapezeBrake", seat, zone, col });
}

function lock(world: World, s: TrapezeState, seat: 0 | 1): void {
  if (seat !== 0 || trapezeLitStep(s)?.ask !== "lock") return;
  s.lockBeats = world.cfg.trapezeLockBeats;
  world.events.push({ type: "trapezeLock", col: trapezeCol(world, s) });
}
