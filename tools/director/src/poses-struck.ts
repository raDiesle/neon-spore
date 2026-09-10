import type { Color, TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  fresh,
  living,
  type Pose,
  runUntil,
  shoot,
} from "./pose-kit.js";

/**
 * A living body over the ship with a matching bolt still climbing at it: the
 * kill itself, replayed — once for each kind whose hit has a record of its
 * own (`body-hit.ts`).
 *
 * Split out of `poses-damage.ts` when the second of them arrived. The first
 * was the pose `creature:break` was judged on and it is the one `slick:hit`
 * is judged on now; `bulb:hit` gets the same run with the other colour, and
 * `living` turns a colour into the body that wears it, so the two poses are
 * one build and a colour. The whole subject of both happens *after* the body
 * is gone, so each is handed over before the shot lands rather than after — a
 * pose held on the frame of the burst would show the pair a picture of what
 * is left and never the body it used to be, and half of what a hit has to do
 * is say **which creature that was**.
 *
 * The column is `poses-damage.ts`'s, so a session flipping between the sheets
 * is looking at the same part of the field.
 */
const COL = 5;

/**
 * How far under the body the bolt is when the pair is handed the world.
 *
 * `METEOR · A SHOT ARRIVING`'s number and its reasoning, arrived at for the
 * same reason: a bolt covers twelve tiles a beat, so a handover two rows short
 * puts the kill on screen before anybody has looked at the body it happened to.
 * Six is half a beat of a whole, living body — long enough to have seen what
 * is about to come apart, which is the only way a hit means anything.
 */
const UNBROKEN_ROWS = 6;

/**
 * How many rows short of the hull the body is when the shot is fired.
 *
 * Three, and the number is the whole of why this pose works. A body shot where
 * it spawns dies at the top of the field, well outside the crop that contains
 * the ship — so the pair watched an empty lane and whatever the hit left fell
 * out of the picture. Killed three rows up, the strike happens over the hull
 * and what it leaves lands on it, which is half of what a candidate is
 * claiming.
 */
const ROWS_ABOVE_HULL = 3;

function struck(color: Color, name: string, note: string, lookAt: string): Pose {
  return {
    name,
    note,
    lookAt,
    // The ship and the rows above it, not the tile. A tile crop is centred on
    // the body the pose is named after, and this is the one pose whose body
    // **stops existing** halfway through: the crop then falls back to the
    // middle of the field and photographs an empty lane.
    crop: "ship",
    cadenceSeconds: EVENT_CADENCE_SECONDS,
    build: () => {
      const w = fresh([living(color, COL)]);
      // Let it come down over the ship first. The cannon lines up while it
      // falls, so nothing is pressed after the handover — `pose-kit.ts`'s rule.
      runUntil(
        w,
        "a body three rows over the hull",
        [aim(0, COL)],
        (x) => (x.creatures[0]?.row ?? 0) >= x.cfg.rows - 1 - ROWS_ABOVE_HULL,
      );
      const cmds: TimedCommand[] = [shoot(w.tick, color)];
      runUntil(w, "a bolt six tiles under the body", cmds, (x) => {
        const b = x.bullets[0];
        const c = x.creatures[0];
        return b !== undefined && c !== undefined && b.row - c.row <= UNBROKEN_ROWS;
      });
      return w;
    },
  };
}

/**
 * Red, and therefore a slick (`living` asks `kindForColor`), because a slick is
 * the body the pair sees most and the one a hit has to work on first. The pose
 * `slick:hit` is judged on, and `creature:break` was.
 */
export const BREAK_POSE: Pose = struck(
  "red",
  "BREAK · A BODY COMING APART",
  "A living slick three rows over the ship with a red bolt half a beat under it. The shot lands, the body is destroyed, and whatever the kill leaves behind happens where you are already looking.",
  "the moment the body stops being a body — what is left of it, and where that goes",
);

/** Cyan, and therefore a bulb: the pose `bulb:hit` is judged on. */
export const BULB_STRUCK_POSE: Pose = struck(
  "cyan",
  "BULB · STRUCK",
  "A living bulb three rows over the ship with a cyan bolt half a beat under it. The shot lands and the bulb is destroyed; what it does on that beat, and what it leaves on the hull, happens where you are already looking.",
  "the beat the bulb is struck — what the body does, in its own cyan, and what is left of it on the ship",
);
