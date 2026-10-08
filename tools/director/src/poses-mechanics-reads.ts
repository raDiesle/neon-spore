import type { World } from "@neon-spore/sim";
import {
  aim,
  fresh,
  living,
  type Pose,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * **The last four of the mechanics' poses**: a pod hanging and a pod falling,
 * and the radar seen from each seat. Lifted out of `poses-mechanics.ts` when
 * it came within twenty lines of its 250; spread back in at the end, so the
 * order the director shows them in is the order it was.
 */

const COL = 5;

export const POD_RADAR_POSES: Pose[] = [
  {
    name: "POD · HANGING",
    note: "It does nothing and blocks nothing. Player 2 has to shoot it loose before player 1 has anything to open the maw for.",
    crop: "tile",
    at: (w) => {
      const p = w.pods[0];
      return {
        col: p ? Math.round(p.colMilli / 1000) : COL,
        row: p ? Math.round(p.rowMilli / 1000) : 4,
      };
    },
    build: () => {
      const w = fresh([], [{ beat: 0, col: COL, row: 5, kind: "ward" }]);
      run(w, TPB * 2);
      return w;
    },
  },
  {
    name: "POD · FALLING",
    note: "Shot loose, sinking like a wreck and sliding the way the seeded rng picked. Neither player knew which way until it moved.",
    crop: "tile",
    at: (w) => {
      const p = w.pods[0];
      return {
        col: p ? Math.round(p.colMilli / 1000) : COL,
        row: p ? Math.round(p.rowMilli / 1000) : 6,
      };
    },
    build: () => {
      const w = fresh([], [{ beat: 0, col: COL, row: 5, kind: "ward" }]);
      // The pod is hung on a beat, so there is nothing in the column to shoot
      // loose until one has passed. Aim first, then fire at something there.
      run(w, TPB * 2, [aim(0, COL)]);
      runUntil(w, "a pod shot loose", [shoot(w.tick, "cyan")], (x) => Boolean(x.pods[0]?.loose));
      run(w, 40);
      return w;
    },
  },
  {
    name: "RADAR · THE PILOT'S HALF",
    note: "The same field, player 1's screen. Rocks are announced here and the living are not — and player 1 cannot fire, so what they read has to be said out loud.",
    crop: "radar",
    role: "p1",
    build: () => radarWorld(),
  },
  {
    name: "RADAR · THE NAVIGATOR'S HALF",
    note: "The same moment, player 2's screen. The living are announced here and the rocks are not — and player 2 cannot move the cannon or trigger the shield.",
    crop: "radar",
    role: "p2",
    build: () => radarWorld(),
  },
];

/**
 * One field with both kinds coming, so the two radar poses are the same
 * moment seen from the two seats. Held a beat short of the first arrival —
 * the strip is a warning, and a warning is only legible before the thing
 * it warns about is on the field.
 */
function radarWorld(): World {
  const w = fresh([rock(2, "meteor", 3), living("red", 7, 4), living("cyan", 9, 5)]);
  run(w, TPB * 2);
  return w;
}
