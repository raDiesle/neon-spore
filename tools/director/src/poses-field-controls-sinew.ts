import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE SINEW with both hands on it and the sum somewhere on the band.
 *
 * The sixth, and the first where the two hands are not each answering a side
 * but adding into one number: player 1 pulls his handle down a whole tile and
 * player 2 hers a little over half, and the collar's band shows what each
 * seat is shown of that. Player 1's screen here, so the band carries the zone
 * and not the sum — the thing the reader of that tab is asking is what the
 * pilot sees while he is saying *more*.
 *
 * `fromYMilli` is the depth; the default's zone is rolled from the wave's
 * seed, so the sum is set where the band is busiest rather than where the
 * zone is, and the hold pips may or may not be lit.
 */
export const SINEW_PULL: Pose = {
  name: "SINEW · BOTH HANDS ON THE PULL",
  note: "THE SINEW hanging from the top of the field: a lobed mass on a fanned tendon with a collar of strain band round it, and a handle either side pulled down on its cord. Player 1's screen: the green segment on the band is the zone he can see and player 2 cannot; the sum is not drawn here at all.",
  lookAt:
    "whether the two cords read as pulled to different depths, and whether the band's zone reads as a target on a scale rather than a decoration on the collar",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "sinew" });
    run(w, TPB * 3);
    const pull = (player: 1 | 2, fromYMilli: number): TimedCommand => ({
      tick: w.tick,
      player,
      command: {
        kind: "drag",
        target: player === 1 ? "sinewLeft" : "sinewRight",
        on: true,
        fromMilli: 0,
        fromYMilli,
      },
    });
    run(w, 2, [pull(1, 1000), pull(2, 600)]);
    return w;
  },
};
