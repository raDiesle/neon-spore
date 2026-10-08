import { leadHand } from "@neon-spore/hands";
import type { World } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE LEAD on the tick its run drops a torch or a rock — the pose
 * `lead:drop` is judged on. A pair is handed only the events of its world's
 * last tick, so THE LEAD · RUNNING, six ticks past whatever it last dropped,
 * shows a drop only if the live pair happens to make one: this stops on the
 * drop itself and replays on the event rhythm.
 */
export const LEAD_DROPPING_POSE: Pose = {
  name: "THE LEAD · DROPPING",
  note: "The body runs two columns a beat and drops a torch behind it or a rock ahead. P1 wards it; P2 calls the column.",
  lookAt: "the ridge's underside over the column the torch or rock comes down",
  crop: "full",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("lead");
    const drops = (world: World) =>
      world.events.some((e) => e.type === "leadTorch" || e.type === "leadRock");
    runHand(w, "THE LEAD dropping", leadHand, drops, 200 * TPB);
    return w;
  },
};
