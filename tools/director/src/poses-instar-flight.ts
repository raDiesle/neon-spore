import { instarHand } from "@neon-spore/hands";
import { instarBoss, instarStep, step } from "@neon-spore/sim";
import { EVENT_CADENCE_SECONDS, type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossWorld, runHand } from "./poses-bosses-kit.js";

/**
 * **THE INSTAR in flight**: the hand answers every step up to the first that
 * `passes` — the brood's, which crosses the frame twice before it comes in —
 * and the world is held a few beats into its morph, while the whole body is
 * carried side-on across the field (`instar-flight.ts`).
 *
 * The one pose where `instar:flight`'s candidate and the shipped body differ:
 * the serpent's wave runs only while the body flies, never while it stays
 * (`instar-serpent.ts`). Until this pose the slot showed `INSTAR · PERCHED`,
 * where the two are drawn the same.
 */

/** How many beats into the morph the world is held: on the first pass, side-on. */
const INTO = 4;

export const INSTAR_FLIGHT_POSE: Pose = {
  name: "INSTAR · IN FLIGHT",
  note: "THE INSTAR on its first pass across the field before the brood, the whole body flying side-on.",
  lookAt: "whether the long body swims through the air as it flies, or is carried stiff",
  crop: "field",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = bossWorld("instar");
    runHand(
      w,
      "INSTAR · IN FLIGHT",
      instarHand,
      (world) => {
        const s = instarBoss(world);
        return s !== null && s.phase === "morph" && instarStep(s)?.arrive === "passes";
      },
      900 * TPB,
    );
    for (let i = 0; i < INTO * TPB; i++) step(w, []);
    return w;
  },
};

/** Beats into the first morph the fly-in is caught at: a speck high up, still far. */
const ARRIVING = 1;
/** Seconds the fly-in plays before it is built again: the whole approach, the turn face-on at its end. */
const APPROACH_SECONDS = 9;

/**
 * **THE INSTAR flying in**: the first step's approach from the start, a speck
 * far off growing at the screen to the breath. `instar:flight` is judged
 * here — the owner, 7 October 2026: *it looks ugly when it flies in* — and
 * the whole approach plays before the replay, so the turn face-on at its end
 * is seen.
 */
export const INSTAR_ARRIVING_POSE: Pose = {
  name: "INSTAR · FLYING IN",
  note: "THE INSTAR's first approach, a speck far off growing at the screen until it faces the ship.",
  lookAt: "whether the body reads as a dragon flying in, or a mask trailing a tube",
  crop: "field",
  cadenceSeconds: APPROACH_SECONDS,
  build: () => {
    const w = bossWorld("instar");
    for (let i = 0; i < 400 * TPB; i++) {
      const s = instarBoss(w);
      if (s !== null && s.phase === "morph" && instarStep(s)?.arrive === "approach") break;
      step(w, []);
    }
    for (let i = 0; i < ARRIVING * TPB; i++) step(w, []);
    return w;
  },
};
