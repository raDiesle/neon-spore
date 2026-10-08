import type { GallWhy } from "./events-gall.js";
import {
  GALL_POINTS,
  type GallState,
  gallBoss,
  gallCharged,
  gallLitStep,
  gallPointCol,
  gallSeatAt,
} from "./gall.js";
import { gallThrown } from "./gall-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * A hand on THE GALL: `gallPress`, a finger — or the mouse button — put down
 * on the alien and lifted again, `id` the point it went down on. The lift is
 * the gesture, and carries how far the hand went: `fromMilli` across and
 * `fromYMilli` down, in thousandths of a tile.
 *
 * - **A tap** is a lift that hardly moved: a charge, `gallTap`.
 * - **A pull** is a lift dragged up by `gallPullMilli` or more, and more up
 *   than across — toward the top of the field, where it is thrown over the
 *   middle. Charged, it throws the alien (`gallThrown`); short of its taps,
 *   it is refused as `early`.
 * - Anything between is refused as `way`.
 *
 * **Nothing is refused silently** (the owner's rule for THE TRAPEZE, 7
 * October 2026): a hand on the other seat's half is `seat`, and one on a
 * point the alien is not on is `empty`. **Geometry says whose point is
 * whose**, THE MANTLE's rule: the two left points answer only the pilot and
 * the two right only the navigator.
 *
 * Held still, a finger does nothing: the owner, 8 October 2026, held THE
 * GALL's earlier press and *nothing happens* — so nothing here waits on a
 * finger kept down.
 */
export function gallHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gallPress") return;
  const s = gallBoss(world);
  if (s === null) return;
  const point = command.id ?? -1;
  if (!Number.isInteger(point) || point < 0 || point >= GALL_POINTS) return;
  const seat = player === 1 ? 0 : 1;
  if (command.on) {
    s.down[seat] = point;
    return;
  }
  if (s.down[seat] !== point) return;
  s.down[seat] = -1;
  lifted(world, s, player, point, command.fromMilli, command.fromYMilli ?? 0);
}

function lifted(
  world: World,
  s: GallState,
  player: 1 | 2,
  point: number,
  dx: number,
  dy: number,
): void {
  const step = gallLitStep(s);
  if (step?.ask !== "leap") return;
  const why = refused(world, s, player, point, dx, dy);
  const col = gallPointCol(world.cfg, point);
  if (why !== null) {
    world.events.push({ type: "gallWhiff", point, why, col });
    return;
  }
  if (pulled(world, dx, dy)) {
    gallThrown(world, s);
    return;
  }
  s.taps = Math.min(step.taps, s.taps + 1);
  world.events.push({ type: "gallTap", point, taps: s.taps, need: step.taps, col });
}

function refused(
  world: World,
  s: GallState,
  player: 1 | 2,
  point: number,
  dx: number,
  dy: number,
): GallWhy | null {
  if (gallSeatAt(point) !== player) return "seat";
  if (point !== s.point) return "empty";
  if (pulled(world, dx, dy)) return gallCharged(s) ? null : "early";
  return tapped(world, dx, dy) ? null : "way";
}

/** Dragged up far enough, and more up than across. */
function pulled(world: World, dx: number, dy: number): boolean {
  return -dy >= world.cfg.gallPullMilli && -dy >= Math.abs(dx);
}

/** Hardly moved: inside half a pull either way. */
function tapped(world: World, dx: number, dy: number): boolean {
  const reach = world.cfg.gallPullMilli / 2;
  return Math.abs(dx) < reach && Math.abs(dy) < reach;
}
