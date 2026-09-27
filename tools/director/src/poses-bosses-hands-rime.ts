import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **THE RIME's still**, the one of its four states posed so far: the pane
 * dropped in and standing, both halves frosted, no step lit yet. The other
 * three are the look lane's and stay on `OWED`
 * (`test/boss-states.test.ts`).
 *
 * `rime:pane` is judged here, because the frost is whole and nothing of the
 * story is moving on it: a glint crossing the ice is only seen where the
 * pane is otherwise still.
 */
export const RIME_POSES: Pose[] = [
  bossPose(
    "rime",
    "still",
    "The frosted pane has dropped in over the middle column, both halves frosted. P1 and P2 wait: no half is lit yet.",
    {
      hold: Math.round(TPB * 1.9),
      lookAt:
        "the frosted pane — whether the ice reads as a surface light moves on or as a painted plate",
    },
  ),
];
