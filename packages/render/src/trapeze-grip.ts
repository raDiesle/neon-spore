import {
  type SimConfig,
  type TrapezeSide,
  type TrapezeState,
  trapezeCaller,
  trapezeLitStep,
  trapezeSwiping,
} from "@neon-spore/sim";
import { hitCircle } from "./hit.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { inZone, trapezeZone } from "./trapeze-marks.js";
import { trapezeAlienAt, trapezeDeg, trapezeSpeed } from "./trapeze-shape.js";

/**
 * **THE TRAPEZE's controls**: the two zones, `trapezePushLeft` and
 * `trapezePushRight`, and the alien itself, `trapezeLock`.
 *
 * **A zone takes any finger in a swipe level, from either seat.** Whose side
 * it is and whether it is the time are the simulation's to judge
 * (`sim/trapeze-hand.ts`), and a swipe it refuses says why
 * (`trapezeWhiff`) — the owner, 7 October 2026: *why nothing happens on a
 * tap*. A finger found nothing at all would be silent again. The lift carries
 * the swipe's sideways run on `fromMilli`, so `touch.ts`' `swiped` set knows
 * both zones.
 *
 * **A zone names the seat that pushes there** to the test screen's one mouse
 * (`trapezeGripSeat`, `desk-grab.ts`), so a press in the left zone in the
 * first level is the pilot's, and in a call level whoever is badged.
 *
 * **The alien is the pilot's, in a lock level**: a tap on it locks the cannon
 * (`sim/lock.ts`), and the press is an edge the simulation reads.
 */

/** How far round the alien a tap lands, in tiles, before `hitReach`. */
const ALIEN_R = 1;

/** The circle round the alien this frame, where the pilot taps to lock. */
export function trapezeAlienCircle(l: Layout, cfg: SimConfig, s: TrapezeState): Circle {
  const at = trapezeAlienAt(l, cfg, trapezeDeg(cfg, s), trapezeSpeed(cfg, s));
  return { x: at.torso.x, y: (at.torso.y + at.head.y) / 2, r: ALIEN_R * l.tile };
}

/** The middle of a zone, where a finger is put down on it, or null outside a swipe level. */
export function trapezeZoneCircle(
  l: Layout,
  cfg: SimConfig,
  s: TrapezeState,
  side: TrapezeSide,
): Circle | null {
  if (!trapezeSwiping(s)) return null;
  const z = trapezeZone(l, cfg, side);
  return { x: z.x + z.w / 2, y: z.y + z.h / 2, r: Math.min(z.w, z.h) / 2 };
}

export function trapezePushUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "trapeze");
  if (s === null || !trapezeSwiping(s)) return null;
  for (const side of [-1, 1] as const) {
    if (!inZone(trapezeZone(l, field.cfg, side), x, y)) continue;
    const target = side < 0 ? "trapezePushLeft" : "trapezePushRight";
    return {
      player: field.seat,
      command: { kind: "drag", target, on: true, fromMilli: 0 },
      hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
    };
  }
  return null;
}

export function trapezeLockUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "trapeze");
  if (s === null || field.seat !== 1 || trapezeLitStep(s)?.ask !== "lock") return null;
  const c = trapezeAlienCircle(l, field.cfg, s);
  if (!hitCircle(c, x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "trapezeLock", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "trapezeLock", player: 1, originX: x, originY: y },
  };
}

/** The seat a press in a zone is for, on the screen that speaks for both. */
export function trapezeGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "trapeze");
  if (s === null || !trapezeSwiping(s)) return undefined;
  for (const side of [-1, 1] as const)
    if (inZone(trapezeZone(l, field.cfg, side), x, y)) return trapezeCaller(s, side) === 0 ? 1 : 2;
  return undefined;
}
