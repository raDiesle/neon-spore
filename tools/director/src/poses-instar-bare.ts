import { instarHand } from "@neon-spore/hands";
import { instarActing, instarBoss, instarStep } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE INSTAR bare after the moult, side-on, the old hide off both halves and
 * the new body pale in the split along the back — the pose `instar:moult` is
 * judged on, because the split is widest here (`render/instar-poses-second.ts`).
 * A hand plays every step before it and stops the moment the bare window
 * opens; the window then runs out unanswered, so the pose replays on the
 * ordinary event rhythm.
 */
export const INSTAR_BARE_POSE: Pose = {
  name: "INSTAR · BARE",
  note: "THE INSTAR side-on after the moult, the old hide peeled off both halves and the new body pale and wet in the split along its back, the window just opened.",
  lookAt:
    "whether the new body reads as fresh skin come out of the old one, soft and wet, and not as a pink hole",
  crop: "field",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("instar");
    runHand(
      w,
      "THE INSTAR bare",
      instarHand,
      (world) => {
        const s = instarBoss(world);
        return s !== null && instarActing(s) && instarStep(s)?.pose === "bare";
      },
      900 * TPB,
    );
    return w;
  },
};
