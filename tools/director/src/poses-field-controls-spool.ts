import { spoolBrakeForRateMilli } from "@neon-spore/sim";
import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE SPOOL's brake under the pilot's thumb — one picture, where THE GIMBAL
 * and THE HASP next door each need two.
 *
 * One, because this boss's control is **one control on one seat**: there is a
 * single brake, it is the pilot's by the target's own name, and the navigator
 * is never drawn it at all (`sim/spool-hand.ts`). A second picture of her
 * screen would be a picture of a zone, which is a reading rather than a
 * control and belongs to the STATES sheet.
 *
 * The depth is the one this leg's rolled rate actually asks for, taken off
 * `spoolBrakeForRateMilli` rather than picked — a grip at a round number
 * would photograph a thumb that is quietly wrong, and what the row wants
 * shown is the fight being held right.
 */
export const SPOOL_BRAKE: Pose = {
  name: "SPOOL · THE BRAKE UNDER A THUMB",
  note: "THE SPOOL slung across the top of the field, four wooden ribs round its casing and its line run down to the hull. The brake is the lever on the pilot's own side of it, and his thumb has it part way down its reach — shallow lets the line run, deep slows it, and no hand at all runs fastest. Player 1's screen: he is shown his own grip and nothing else, no zone and no number.",
  lookAt:
    "whether the lever reads as a thing to hold rather than a thing to press, and whether how far down it is sitting is legible without a scale beside it",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "spool" });
    // Past the taut beats, so the line is running and the brake is live.
    run(w, TPB * 3);
    const s = w.boss?.kind === "spool" ? w.boss : null;
    if (s === null) throw new Error("the wave installed no spool");
    const at = spoolBrakeForRateMilli(w.cfg, s.wantRateMilli);
    run(w, 2, [
      {
        tick: w.tick,
        player: 1,
        command: { kind: "drag", target: "spoolBrake", on: true, fromMilli: 0, fromYMilli: at },
      },
    ]);
    return w;
  },
};
