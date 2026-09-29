/**
 * **The bosses' `life` level** (`docs/spec/living-bosses.md` §1, "One number
 * turns it down"): how much of the living motion this device draws, 0 to 1.
 *
 * The source is the player's motion setting and nothing else (the owner, 27
 * September 2026, left the choice to the lane; `docs/queue.md` "Living bosses
 * — what turns the bosses' life down"): a device that has asked the game to
 * be still draws `0`, which stills every part and halves the body drift, and
 * every other device draws `1`. No frame-time governor, no battery guess.
 *
 * One value per page rather than a field of the view, because the pose it
 * scales is read in two places that must agree: the drawer, and the hit test
 * that finds a mark where it is drawn (`warden-grip.ts`, `gorge-grip.ts`),
 * which is handed a `Field`, not a view. It is a device's preference, like the
 * canvas it draws on, and never touches a `World`.
 */

let level = 1;

/** Sets this device's level; the game calls it from the motion setting. */
export function setMotionLife(life: number): void {
  level = Math.max(0, Math.min(1, life));
}

/** The part drift's multiplier: 0 draws every part at its parent's angles. */
export function motionLife(): number {
  return level;
}

/** The body drift's multiplier: a still device keeps half, so a boss still breathes. */
export function bodyLife(): number {
  return 0.5 + 0.5 * level;
}
