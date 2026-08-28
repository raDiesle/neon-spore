import type { OwnMotion } from "@neon-spore/content";

/**
 * A pose, positionally.
 *
 * Every motion in this folder ends in a call to it, so the five numbers are
 * named in one place and a motion that means to leave one alone writes nothing
 * rather than the wrong default. It lives beside them rather than inside one
 * of them because `plane.ts` and `depth.ts` both need it and neither owns it.
 */
export function pose(
  dx: number,
  dy: number,
  rot: number,
  sx = 1,
  sy = 1,
): ReturnType<OwnMotion["poseAt"]> {
  return { dx, dy, rot, sx, sy };
}
