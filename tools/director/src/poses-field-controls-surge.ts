import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE SURGE with both thumbs on the bulb and the pressure climbing.
 *
 * The seventh pose the ON THE FIELD tab needed, in a file of its own because
 * `poses-field-controls.ts` was at 231 lines and one more pose would have
 * taken it over the limit. It is the first pose of a handle both seats
 * take: there is one target, `surgeBulb`, and each seat's `drag` on it is
 * that seat's thumb (`sim/surge-hand.ts`). Player 1's screen here, so the
 * seam carries the notches and the next band and never the pressure —
 * the thing the reader of that tab is asking is what the pilot sees while
 * he is counting to the lift.
 *
 * Three beats of two thumbs, so the pressure is off the left end of the
 * seam and the body on the navigator's screen would already be swelling
 * — which this screen is not shown (`render/surge-draw.ts`).
 */
export const SURGE_HOLD: Pose = {
  name: "SURGE · BOTH THUMBS ON THE BULB",
  note: "THE SURGE hung over the middle of the field: a ribbed violet bulb with a dark seam round its equator and a grip mark on each lower flank, both filled. Player 1's screen: the white slits and ticks along the seam are the notches, the pale stretch round the bright one is the next notch's band, and the pressure is not drawn here at all.",
  lookAt:
    "whether the seam reads as a gauge with a target on it rather than a decoration, whether the two filled grip marks read as two thumbs on one thing, and whether nothing on this screen gives the pressure away",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "surge" });
    run(w, TPB * 2);
    const thumb = (player: 1 | 2): TimedCommand => ({
      tick: w.tick,
      player,
      command: { kind: "drag", target: "surgeBulb", on: true, fromMilli: 0, fromYMilli: 0 },
    });
    run(w, TPB * 3, [thumb(1), thumb(2)]);
    return w;
  },
};
