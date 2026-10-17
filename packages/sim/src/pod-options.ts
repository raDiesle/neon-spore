import { hullRow, ticksPerBeat } from "./config.js";
import type { PodEntry } from "./entries.js";
import { inMawReach, takeCargo } from "./pod-intake.js";
import { nextInt } from "./rng.js";
import type { Color, Pod } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **Five ways a pod can be harder to take**, from the owner's SUCK page of 16
 * October 2026, each one sentence a player can say back:
 *
 * - a **coloured** pod is freed only by a shot of its colour — "that one's
 *   cyan, load cyan";
 * - a **heavy** pod falls straight and needs two presses — "got it — again!";
 * - a **swinging** pod is let go the way it was swinging — "wait for it to
 *   swing left — now";
 * - a pod whose **clock is on one screen**, player 1's — "free the top one
 *   first, it's nearly out" (drawn by `render/pods.ts`, nothing here);
 * - a pod that **drops on its own**, for the husk — "leave it! don't suck".
 *
 * Its own file rather than three more branches in `pods.ts`, which was at its
 * limit when THE ROE was strung: each is a small rule at one moment of a pod's
 * life — the shot, the hanging, the mouth — and `pods.ts` asks this file at
 * each of those moments.
 */

/** The fields an entry's options put on a pod as it is hung. */
export function podOptions(world: World, entry: PodEntry): Partial<Pod> {
  return {
    ...(entry.tint ? { tint: entry.tint } : {}),
    ...(entry.heavy ? { heavy: true as const } : {}),
    ...(entry.swing ? { swingMilli: entry.col * MILLI, crossMilli: swingStepMilli(world) } : {}),
    ...(entry.clockP1 ? { clockP1: true as const } : {}),
    ...(entry.truthP1 ? { truthP1: true as const } : {}),
    ...(entry.drop !== undefined ? { dropTicks: entry.drop * ticksPerBeat(world.cfg) } : {}),
  };
}

function swingStepMilli(world: World): number {
  return Math.round((world.cfg.podSwingTilesPerBeat * MILLI) / ticksPerBeat(world.cfg));
}

/**
 * **A shot of the wrong colour, turned away.** True when the pod is coloured
 * and the shot is not its colour: the shot ends there, as a bolt off a plate
 * does, and says so with the plate's own event (`bounce`).
 */
export function podRefusesShot(world: World, pod: Pod, color: Color): boolean {
  if (pod.tint === undefined || pod.tint === color) return false;
  world.events.push({
    type: "bounce",
    col: Math.round(pod.colMilli / MILLI),
    row: Math.round(pod.rowMilli / MILLI),
    color,
  });
  return true;
}

/**
 * Which way a freed pod slides: the way it was swinging, on a swinging one;
 * not at all, on a heavy one; and otherwise drawn from the seeded rng, because
 * which way a wreck falls away is the one thing about an ordinary pod neither
 * player may know in advance.
 */
export function releaseDir(world: World, pod: Pod): number {
  if (pod.swingMilli !== undefined) return pod.crossMilli < 0 ? -1 : 1;
  if (pod.heavy) return 0;
  return nextInt(world.rng, 2) === 0 ? -1 : 1;
}

/**
 * A moored pod's tick of its options: a swing, and the countdown on one that
 * lets go by itself. True on the tick it does, and the caller frees it.
 */
export function mooredStep(pod: Pod): boolean {
  swingStep(pod);
  if (pod.dropTicks === undefined) return false;
  pod.dropTicks -= 1;
  return pod.dropTicks <= 0;
}

/** A moored swinging pod's tick: across, and turned at a column either side. */
function swingStep(pod: Pod): void {
  if (pod.swingMilli === undefined) return;
  pod.colMilli += pod.crossMilli;
  const lo = pod.swingMilli - MILLI;
  const hi = pod.swingMilli + MILLI;
  if (pod.colMilli <= lo || pod.colMilli >= hi) {
    pod.colMilli = Math.max(lo, Math.min(hi, pod.colMilli));
    pod.crossMilli = -pod.crossMilli;
  }
}

/**
 * **A heavy pod caught by the first press.** True when it is heavy and not
 * yet gripped: it stops in the mouth, in the cannon's column, and waits for
 * the second press (`heavyPressed`). Asked by `podArrived` once the column and
 * the moment have already been judged good.
 */
export function gripHeavy(world: World, pod: Pod): boolean {
  if (!pod.heavy || pod.gripTicks !== undefined) return false;
  pod.gripTicks = world.cfg.podGripBeats * ticksPerBeat(world.cfg);
  pod.colMilli = world.cannonCol * MILLI;
  pod.rowMilli = hullRow(world.cfg) * MILLI;
  pod.driftMilli = 0;
  world.events.push({ type: "podGripped", col: world.cannonCol, row: hullRow(world.cfg) });
  return true;
}

/**
 * **The second press.** Every gripped pod inside the maw's reach is swallowed,
 * and taken off the field. Called on the press itself, so it is a *new* press
 * that takes it — the one that gripped it does not count twice.
 */
export function heavyPressed(world: World): void {
  if (!world.pods.some((p) => p.gripTicks !== undefined)) return;
  world.pods = world.pods.filter((p) => {
    if (p.gripTicks === undefined) return true;
    const col = Math.round(p.colMilli / MILLI);
    if (!inMawReach(world, col)) return true;
    takeCargo(world, col);
    return false;
  });
}

/**
 * A gripped pod's tick: true while it is still held. At nought it slips out of
 * the mouth, and the caller loses it as a pod that broke on the skin.
 */
export function gripHolds(pod: Pod): boolean {
  if (pod.gripTicks === undefined) return true;
  pod.gripTicks -= 1;
  return pod.gripTicks > 0;
}
