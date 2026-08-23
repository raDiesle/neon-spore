/**
 * A spring that chases a value. Render-only motion: the simulation moves the
 * cannon a whole column at a time, because a column is what two devices can
 * agree on — but a lobe of a membrane that teleports between columns does not
 * read as one body moving, it reads as two shapes swapped. So the eye is given
 * a continuous position that follows the discrete one, and nothing is ever read
 * back into the world.
 *
 * Slightly under-damped on purpose: the lobe arrives, leans a hair past the
 * column and settles. That overshoot is the whole difference between a shape
 * being moved and a shape moving itself.
 */
export interface Glide {
  value: number;
  velocity: number;
}

/** Undamped frequency, radians per second. Higher is a faster arrival. */
const OMEGA = 21;
/** 1 is critical damping; below it the lobe overshoots and settles back. */
const ZETA = 0.68;
/** Longest step integrated at once. A dropped frame is split, not sprung. */
const MAX_STEP = 1 / 60;

export function glideTo(g: Glide, target: number, dt: number, omega = OMEGA, zeta = ZETA): void {
  // First frame, or a jump that is not motion at all — a wave restart puts the
  // cannon back in the middle, and it should be there, not travel there.
  if (!Number.isFinite(g.value) || Math.abs(target - g.value) > 100) {
    g.value = target;
    g.velocity = 0;
    return;
  }
  let left = Math.min(dt, 0.25);
  while (left > 0) {
    const step = Math.min(left, MAX_STEP);
    const accel = omega * omega * (target - g.value) - 2 * zeta * omega * g.velocity;
    g.velocity += accel * step;
    g.value += g.velocity * step;
    left -= step;
  }
}
