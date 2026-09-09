import type { TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  living,
  type Pose,
  rock,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";

/**
 * The two poses about **damage** — a rock being marked, and a body being
 * destroyed.
 *
 * Split out of `poses-versus.ts` when the second of them took that file past
 * its line ceiling, and the seam is a real one rather than a convenient cut:
 * every other pose over there is a state a *look* is compared on, held still,
 * and both of these are a **shot landing**. Each is handed to the pair with a
 * bolt already in the air and a named number of rows still to cover, because
 * what they are about only exists for the instant after that — and each carries
 * `cadenceSeconds` so the instant comes round again every two seconds.
 *
 * The column both of them use. Middle-ish, and the same one `poses-versus.ts`
 * spawns in, so a session flipping between the two sheets is looking at the
 * same part of the field.
 */
const COL = 5;

/**
 * How far under the rock the bolt is when the pair is handed the world.
 *
 * Eleven rows and not two, and the number is a *duration*: a bolt covers twelve
 * tiles a beat, so two rows is a sixth of a beat — about a tenth of a second,
 * which is not long enough for anybody to see what an unmarked rock looks
 * like, and it is why nobody ever had. Eleven is nearly a whole beat of clean
 * rock before the first crater opens.
 */
const UNHIT_ROWS = 11;

/**
 * An untouched rock with the first bolt still in the air when the pair takes
 * the world over, so every crater it ever has opens on screen.
 *
 * It handed over with three craters already cut until 8 September 2026, and
 * the owner asked what the rock looks like before anything has hit it — which
 * turned out to be a question the pose could not answer at all, because the
 * pair had never once seen this creature in the state it spends most of its
 * life in. The fourth crater opening was the whole picture. It is the first
 * one now, and the three that follow arrive on the replay clock, so the state
 * a rock arrives on the field in is the state the page opens on.
 */
export const METEOR_HIT_POSE: Pose = {
  name: "METEOR · A SHOT ARRIVING",
  note: "An unmarked rock with a shot still climbing towards it. Shooting a rock does not shrink it, slow it or break it — it only leaves craters. The craters are how the game says so, and here you watch the first one open.",
  lookAt: "the face of the rock before anything has hit it, and the crater the next shot opens",
  crop: "tile",
  at: firstOfKind("meteor"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([rock(COL)]);
    // The cannon is lined up and nothing has been fired: `holes` is still 0
    // when the pair is handed the world, which is the whole change.
    const cmds: TimedCommand[] = [aim(0, COL), shoot(TPB, "red")];
    runUntil(w, "a bolt eleven tiles under the rock", cmds, (x) => {
      const b = x.bullets[0];
      const c = x.creatures[0];
      return b !== undefined && c !== undefined && b.row - c.row <= UNHIT_ROWS;
    });
    return w;
  },
};

/**
 * How far under the body the bolt is when the pair is handed the world.
 *
 * `METEOR · A SHOT ARRIVING`'s number and its reasoning, arrived at for the
 * same reason: a bolt covers twelve tiles a beat, so a handover two rows short
 * puts the kill on screen before anybody has looked at the body it happened to.
 * Six is half a beat of a whole, living slick — long enough to have seen what
 * is about to come apart, which is the only way a break means anything.
 */
const UNBROKEN_ROWS = 6;

/**
 * How many rows short of the hull the body is when the shot is fired.
 *
 * Three, and the number is the whole of why this pose works. A slick shot where
 * it spawns dies at the top of the field, well outside the crop that contains
 * the ship — so the pair watched an empty lane and the debris fell out of the
 * picture. Killed three rows up, the break happens over the hull and the pieces
 * land on it, which is half of what the candidate is claiming.
 */
const ROWS_ABOVE_HULL = 3;

/**
 * A slick over the ship with a matching bolt still climbing at it: the kill
 * itself, replayed.
 *
 * The pose `creature:break` is judged on, and the only one on this page whose
 * whole subject happens *after* the body is gone. So it is handed over before
 * the shot lands rather than after — a pose held on the frame of the burst
 * would show the pair a picture of debris and never the body it used to be, and
 * half of what a break has to do is say **which creature that was**.
 *
 * Red, and therefore a slick (`living` asks `kindForColor`), because a slick is
 * the body the pair sees most and the one a break has to work on first.
 */
export const BREAK_POSE: Pose = {
  name: "BREAK · A BODY COMING APART",
  note: "A living slick three rows over the ship with a red bolt half a beat under it. The shot lands, the body is destroyed, and whatever the kill leaves behind happens where you are already looking.",
  lookAt: "the moment the body stops being a body — what is left of it, and where that goes",
  // The ship and the rows above it, not the tile. A tile crop is centred on the
  // body the pose is named after, and this is the one pose whose body **stops
  // existing** halfway through: the crop then falls back to the middle of the
  // field and photographs an empty lane.
  crop: "ship",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([living("red", COL)]);
    // Let it come down over the ship first. The cannon lines up while it falls,
    // so nothing is pressed after the handover — `pose-kit.ts`'s rule.
    runUntil(
      w,
      "a slick three rows over the hull",
      [aim(0, COL)],
      (x) => (x.creatures[0]?.row ?? 0) >= x.cfg.rows - 1 - ROWS_ABOVE_HULL,
    );
    const cmds: TimedCommand[] = [shoot(w.tick, "red")];
    runUntil(w, "a bolt six tiles under a slick", cmds, (x) => {
      const b = x.bullets[0];
      const c = x.creatures[0];
      return b !== undefined && c !== undefined && b.row - c.row <= UNBROKEN_ROWS;
    });
    return w;
  },
};
