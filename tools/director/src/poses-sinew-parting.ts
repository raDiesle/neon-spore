import { sinewHand } from "@neon-spore/hands";
import { slowing, type World } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE SINEW just after a hold parts a fibre: five strings still standing and
 * THE SLOW open over the part (`sinewPartSlowBeats`) — the pose
 * `sinew:fibres` is judged on, because it is the one moment the fight has
 * fibres on the field and a window open at once. Every other SINEW pose has
 * one or the other. The window then runs out, so it replays on the ordinary
 * event rhythm.
 */
export const SINEW_PARTING_POSE: Pose = {
  name: "SINEW · PARTING",
  note: "THE SINEW a beat after the pair's hold parted a fibre: five strings left between the crown and the mass, and THE SLOW open over the part.",
  lookAt:
    "the strings between the crown and the mass — whether they read as held in a slowed moment",
  crop: "full",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("sinew");
    const parted = (world: World) =>
      world.boss?.kind === "sinew" && world.boss.fibres < 6 && slowing(world);
    runHand(w, "THE SINEW parting", sinewHand, parted, 120 * TPB);
    run(w, TPB);
    return w;
  },
};
