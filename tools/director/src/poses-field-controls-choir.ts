import type { SpawnEntry } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CHOIR's SHAKE as the pair is offered it: a membrane on the field and
 * the rub in the middle of it, which both seats make together
 * (`render/choir-rub.ts`). It took the place of the two arrows against the
 * walls on 13 October 2026 — the owner: *we will reuse the "rub" control,
 * which is somewhere in the center of the screen*.
 *
 * `CHOIR · TWO VOICES` is the body, cropped to its tile; this is the control.
 */
export const CHOIR_SWIPE: Pose = {
  name: "CHOIR · RUB OR SHAKE",
  note: "A membrane falling on player 1's screen, and in the middle of the field the rub mark both seats scrub together, a light for each seat and a pip for each turn. Shaking the phone does the same; the rub is drawn always, for the phone or the computer that cannot tell.",
  lookAt: "the rub in the middle — whether it reads as something both seats scrub at once",
  crop: "field",
  role: "p1",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: 3, kind: "choir", color: "cyan" };
    const w = fresh([entry]);
    run(w, TPB * 2);
    return w;
  },
};
