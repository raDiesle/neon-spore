import { instarHand } from "@neon-spore/hands";
import { instarActing, instarBoss, instarStep, step } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * THE INSTAR's fire on its way down, three beats into the window, while
 * nobody answers: the globs out of the mouth in the rear, the embers off the
 * wings in the spread — the poses `instar:spit` is judged on, because the
 * first flash of the window shows the fire still in the mouth.
 */
function falling(pose: "rear" | "spread", name: string, note: string, lookAt: string): Pose {
  return {
    name,
    note,
    lookAt,
    crop: "field",
    cadenceSeconds: EVENT_CADENCE_SECONDS,
    build: () => {
      const w = bossWorld("instar");
      runHand(
        w,
        name,
        instarHand,
        (world) => {
          const s = instarBoss(world);
          return s !== null && instarActing(s) && instarStep(s)?.pose === pose;
        },
        900 * TPB,
      );
      for (let i = 0; i < 3 * TPB; i++) step(w, []);
      return w;
    },
  };
}

export const INSTAR_REAR_POSE = falling(
  "rear",
  "INSTAR · THE GLOBS FALLING",
  "THE INSTAR reared back, two globs of fire out of its mouth and halfway down to the hull, one over each half.",
  "whether each glob reads as a ball of fire with a flame behind it, and not as a gold dot",
);

export const INSTAR_SPREAD_POSE = falling(
  "spread",
  "INSTAR · THE EMBERS FALLING",
  "THE INSTAR's wings spread, embers shaken off them drifting down to the hull.",
  "whether the embers read as sparks, and not as dust",
);
