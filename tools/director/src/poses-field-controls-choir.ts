import type { SpawnEntry } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CHOIR's SHAKE as the pilot is offered it: a membrane on the field and
 * the two arrows against its walls, each marked SWIPE (`render/choir-arrows.ts`).
 *
 * `CHOIR · TWO VOICES` is the body, cropped to its tile, and shows neither
 * arrow; this is the control. The owner, 6 October 2026: the picture for the
 * shake is the arrows with SWIPE on the left and the right. Player 1's screen,
 * because the arrows are drawn on no other.
 */
export const CHOIR_SWIPE: Pose = {
  name: "CHOIR · SWIPE OR SHAKE",
  note: "A membrane falling on player 1's screen, and against each wall of the field an arrow pointing out over it, marked SWIPE. Shaking the phone does the same; the arrows are drawn always, for the phone or the computer that cannot tell.",
  lookAt: "the two arrows at the walls — whether each reads as a swipe outward",
  crop: "field",
  role: "p1",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: 3, kind: "choir", color: "cyan" };
    const w = fresh([entry]);
    run(w, TPB * 2);
    return w;
  },
};
