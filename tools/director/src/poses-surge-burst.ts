import { surgeHandWith } from "@neon-spore/hands";
import type { World } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE SURGE on the tick it bursts — the pose `surge:spray` is judged on. THE
 * SURGE · SEALING stands six ticks past the burst, and a pair is handed only
 * the events of its world's last tick, so a spray could never be seen from
 * there: this one stops on the burst itself and replays on the event rhythm.
 */
export const SURGE_BURST_POSE: Pose = {
  name: "THE SURGE · BURST",
  note: "Both thumbs held the bulb past the band and it burst. P1 is thrown off it; P2 is thrown off too.",
  lookAt: "the whole ship, bulb to hull, over the beats after the burst",
  crop: "full",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("surge");
    const burst = (world: World) => world.events.some((e) => e.type === "surgeBurst");
    runHand(w, "THE SURGE bursting", surgeHandWith(false), burst, 120 * TPB);
    return w;
  },
};
