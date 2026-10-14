import { type BlisterGesture, blisterIsUp } from "@neon-spore/sim";
import { COL, creatureAt, tile } from "./brush-frame.js";
import { fresh, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * **A CONTROLS brush's picture**: THE BLISTER up out of its pore, wearing its
 * gesture's control, on the screen of the hand that knocks it down — the
 * navigator's, the default `by`. The five brushes paint one body, so the
 * control on it is the whole difference between their buttons
 * (`control-brushes.ts`); the partner's screen would show the waiting clock
 * on all five.
 *
 * It arrives under, so the pose waits for it to come up, then half a beat
 * more for the rise (`RISE_BEATS`, `render/blister.ts`) to finish.
 */
export function controlArt(gesture: BlisterGesture): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "blister", color: null, gesture }]);
  until(world, "the blister up", (w) => w.creatures.some(blisterIsUp));
  run(world, TPB / 2);
  return tile(world, creatureAt(world, "blister"), 3, "p2");
}
