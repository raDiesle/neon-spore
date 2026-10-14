import { type Pull, pullHeard } from "./pull.js";
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
 * carrying how far it went across on `fromMilli`; a move between keeps how
 * far toward the middle it has come in `carryMilli`, which only the zone's
 * knob reads (`render/trapeze-marks.ts`). It is judged at the lift,
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
  // The one generic PULL (`pull.ts`), sideways toward the middle of the
  // field — the zone's inward — and `trapezeSwipeMilli` long, once per hold:
  // a carry that has counted stays at the end until the lift.
  const pull: Pull = {
    way: "signed",
    sign: zone < 0 ? 1 : -1,
    reachMilli: world.cfg.trapezeSwipeMilli,
  };
  const counted = (s.carryMilli[seat] ?? 0) >= pull.reachMilli;
  if (command.on) {
    if (s.down[seat] !== zone) s.carryMilli[seat] = 0;
    else if (Number.isInteger(command.fromMilli)) {
      const { travelMilli, heard } = pullHeard(pull, counted, true, command.fromMilli);
      s.carryMilli[seat] = counted ? pull.reachMilli : travelMilli;
      if (heard === "counted") swiped(world, s, seat, zone, true);
    }
    s.down[seat] = zone;
    return;
  }
  if (s.down[seat] !== zone) return;
  s.down[seat] = 0;
  s.carryMilli[seat] = 0;
  if (!Number.isInteger(command.fromMilli)) return;
  const { heard } = pullHeard(pull, counted, false, command.fromMilli);
  if (heard !== "home") swiped(world, s, seat, zone, heard === "counted");
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
  full: boolean,
): void {
  if (!trapezeSwiping(s)) return;
  const cfg = world.cfg;
  const col = trapezeCol(world, s);
  // A carry let go short is this boss's whiff `way`, its own word for the
  // generic PULL's short lift.
  const why =
    trapezeCaller(s, zone) !== seat
      ? "seat"
      : !full
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
