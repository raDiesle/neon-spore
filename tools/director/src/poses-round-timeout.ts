import { fleetBeatsLeft } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { until } from "./pose-kit.js";
import { bossWorld } from "./poses-bosses-kit.js";

/**
 * **A round running out on nobody** — the timeout hit, which breaks the hull
 * when a round's clock empties and no hand has answered it. The
 * `round:timeout-hit` slot is judged here: the game draws that hit as a rock
 * (`rock-impact.ts`) and a candidate paints the round's own picture in its
 * place (`round-strike-look.ts`).
 *
 * THE FLEET and not THE PULSE, which the queue item suggested: the pulse, the
 * gauge, the snake, the pinball and the scout take the whole picture over, so
 * their breach is never drawn on the field and there is nothing on the frame
 * to compare. THE FLEET's chart sits over the field and its clock is a plain
 * count of beats, so nobody touching anything reaches the hit. Its clock is
 * cut to a few beats so the pose does not run a hundred and sixty of them to
 * get there; the hit itself is the one the round always makes, in the middle
 * column. Stops a beat short, so the fall is the first thing after the pair
 * takes the world over. Replays every six seconds, not every three: the hit
 * falls from the top of the field, so it reaches the skin about two and a
 * half seconds into the replay and three would cut its ring off.
 */
export const ROUND_TIMEOUT_POSE: Pose = {
  name: "THE FLEET · TIME RUNS OUT",
  note: "The fleet round's clock empties with nobody at the controls, and running out costs the hull: a hit comes down in the middle of the ship. This is the moment it arrives.",
  lookAt: "the middle of the ship, the frame the hit reaches the skin and the second after it",
  crop: "ship",
  cadenceSeconds: 6,
  build: () => {
    const w = bossWorld("fleet", { fleetRoundBeats: 6 });
    until(w, "the fleet round's last beat", (x) => {
      const b = x.boss;
      return b?.kind === "fleet" && fleetBeatsLeft(x, b) <= 1;
    });
    return w;
  },
};
