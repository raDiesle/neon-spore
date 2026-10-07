/** A point on the screen. */
interface At {
  readonly x: number;
  readonly y: number;
}

/** How fast the mass rings on its tendon, in cycles a second. Slow: it is heavy. */
const HZ = 0.75;
/** How little the ringing is damped: low enough that a jolt overshoots by half. */
const DAMP = 0.18;
/** The step the spring is integrated on, in seconds. */
const STEP = 1 / 240;
/** A gap longer than this is a world rebuilt or a restart, not a frame. */
const GAP = 0.25;

/**
 * **The mass carried on a spring toward where it hangs.**
 *
 * The memory lives here, in the candidate, because only the candidate's side
 * of the pair draws through it; adopted, it belongs in `SinewFx` with the
 * snap's whip, cleared in `reset()`. Stepped on the simulation's clock and
 * never the wall's, so a frozen pair is the same picture every run, and
 * thrown away whenever that clock jumps — backwards, or by more than a frame.
 */
const at = { t: Number.NaN, x: 0, y: 0, vx: 0, vy: 0, tile: 0 };

export function carryHeavy(hung: At, seconds: number, tile: number): At {
  const dt = seconds - at.t;
  if (!(dt >= 0 && dt <= GAP) || tile !== at.tile) {
    Object.assign(at, { t: seconds, x: hung.x, y: hung.y, vx: 0, vy: 0, tile });
    return hung;
  }
  const w = 2 * Math.PI * HZ;
  for (let left = dt; left > 0; left -= STEP) {
    const h = Math.min(STEP, left);
    at.vx += (w * w * (hung.x - at.x) - 2 * DAMP * w * at.vx) * h;
    at.vy += (w * w * (hung.y - at.y) - 2 * DAMP * w * at.vy) * h;
    at.x += at.vx * h;
    at.y += at.vy * h;
  }
  at.t = seconds;
  return { x: at.x, y: at.y };
}
