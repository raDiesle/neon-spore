import { instarHand } from "@neon-spore/hands";
import { instarActing, instarBoss, instarStep } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE INSTAR in its brood, the two nests on its back full and the marks up
 * over them — the pose `instar:nest` is judged on, because the nests are
 * drawn in this step and in no other (`render/instar-poses.ts`). A hand plays
 * the breath before it and stops the moment the brood's window opens, so
 * every egg is still in its silk; the window then runs out unanswered, so
 * the pose replays on the ordinary event rhythm.
 */
export const INSTAR_BROOD_POSE: Pose = {
  name: "INSTAR · THE BROOD",
  note: "THE INSTAR side-on in its brood, two nests of eggs in silk on its back, the pilot's TAP mark on one and the navigator's SWIPE DOWN on the other, the window just opened.",
  lookAt:
    "whether the nests read as eggs sitting in silk on the back, and whether they still read as the thing to tap and swipe",
  crop: "field",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("instar");
    runHand(
      w,
      "THE INSTAR's brood",
      instarHand,
      (world) => {
        const s = instarBoss(world);
        return s !== null && instarActing(s) && instarStep(s)?.pose === "brood";
      },
      200 * TPB,
    );
    return w;
  },
};
