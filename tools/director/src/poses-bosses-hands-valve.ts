import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE VALVE's still**, the one of its ten states posed so far: the drum
 * dropped in and standing, all three pins hung under it, no step lit yet.
 * The other nine are the look lane's and stay on `OWED`
 * (`test/boss-states.test.ts`).
 *
 * `valve:pin` is judged here, because every pin is still in and nothing of
 * the story is moving: a pin swinging on its own is only seen where the
 * drum is otherwise still.
 */
export const VALVE_POSES: Pose[] = [
  bossPose(
    "valve",
    "still",
    "The drum has dropped in over the middle column, its three pins hung under it. P1 and P2 wait: nothing is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt: "the three hung pins — whether they hang from the drum or are bolted to it",
    },
  ),
];
