import { handMeans, lockChargeMilli, lockReady, type World } from "@neon-spore/sim";
import { arcFromTop } from "./arc-from-top.js";
import { strokeGlow } from "./glow.js";

/**
 * **Whether THE LOCK is ready, worn on the cannon's own egg** — the white
 * border round the body in the cannon's mouth turns yellow. The owner, 19
 * October 2026: *take the existing white border of the inner circle bubble
 * and colour it yellow according to the current state.* So nothing is added
 * to the ship: while the lock rests the yellow sweeps round the border from
 * the top as the rest runs (`sim/lock-rest.ts`), and a whole yellow border is
 * a lock ready to take. Both screens, because player 1 locks and player 2
 * fires into it.
 *
 * It replaces the lamp under the mouth the first version shipped and the
 * VERSUS slot opened against it, `ship:lock-light`.
 */

/**
 * How much of the border is yellow, 0 to 1, or undefined when the border
 * stays white: no body on the field player 1's hand would aim at and no rest
 * running. A yellow border over nothing to lock would say the opposite of
 * what it is for.
 */
export function lockRim(world: World): number | undefined {
  const aimable = world.creatures.some((c) => handMeans(c.kind, 1) === "aim");
  if (!aimable && lockReady(world)) return undefined;
  return lockChargeMilli(world) / 1000;
}

/**
 * The yellow over `share` of the egg's border, from twelve o'clock clockwise,
 * at the weight and glow the white border was drawn with, in `color` — the
 * caller's yellow, still taking a shot's burn the way the white does. A wedge
 * clip rather than a part of the path, because the contour is the egg's own
 * and swells with every shot. `reach` is past the contour in every direction.
 */
export function strokeLockRim(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  cx: number,
  cy: number,
  reach: number,
  share: number,
  color: string,
  width: number,
  alpha: number,
): void {
  if (share <= 0) return;
  ctx.save();
  if (share < 1) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    arcFromTop(ctx, cx, cy, reach, share);
    ctx.closePath();
    ctx.clip();
  }
  strokeGlow(ctx, path, color, width, alpha);
  ctx.restore();
}
