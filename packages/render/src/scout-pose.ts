/**
 * Where THE SCOUT's nautilus is and which way it faces (`scout-shell.ts`),
 * and the frame its parts are laid out in: `u` along the heading, `w` toward
 * the back of the shell, both as shares of the drawn radius. Split off the
 * shell on its line count.
 */

/** Where the little ship is and which way it is facing, in stage pixels. */
export interface ScoutPose {
  readonly x: number;
  readonly y: number;
  /** The drawn radius. Every length below is a share of it. */
  readonly r: number;
  /** Unit vector along the heading. */
  readonly fx: number;
  readonly fy: number;
  /** Unit vector to the shell's back, always the upper side of the screen. */
  readonly dx: number;
  readonly dy: number;
}

export function scoutPose(x: number, y: number, r: number, face: number): ScoutPose {
  const fx = Math.cos(face);
  const fy = Math.sin(face);
  // The back is whichever side of the heading points up the screen, so the
  // coil never draws itself upside down.
  const m = Math.sign(fx) || 1;
  return { x, y, r, fx, fy, dx: m * fy, dy: -m * fx };
}

/** A point of the body: `u` along the heading, `w` toward the back. */
export function px(p: ScoutPose, u: number, w: number): number {
  return p.x + (p.fx * u + p.dx * w) * p.r;
}
export function py(p: ScoutPose, u: number, w: number): number {
  return p.y + (p.fy * u + p.dy * w) * p.r;
}

/** The shell's middle and radius, behind the body and toward the back. */
export const SHELL_U = -0.2;
export const SHELL_W = 0.06;
export const SHELL = 0.8;
/** The soft body at the opening. */
export const FLESH_U = 0.6;
export const FLESH_W = -0.04;
