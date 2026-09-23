import type { TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE RATCHET's two hands, one under each seat's thumb, and **two instants
 * rather than one**, where THE HASP next door photographs one instant twice.
 *
 * Her hold is a level and can be photographed at any tick of it. His press
 * is an edge, and a picture of the pad a beat after it would be a picture of
 * a thumb resting on something that has already happened. So the pawl pose
 * runs her hold first, then his press, and stops on the tick the rack starts
 * to climb. A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** Her thumb on the catch, carried to a depth. A level, so one message is the whole of it. */
function caught(tick: number, depthMilli: number): TimedCommand {
  return {
    tick,
    player: 2,
    command: {
      kind: "drag",
      target: "ratchetCatch",
      on: true,
      fromMilli: 0,
      fromYMilli: depthMilli,
    },
  };
}

const RATCHET_CATCH: Pose = {
  name: "RATCHET · THE CATCH UNDER A THUMB",
  note: "THE RATCHET stood on the middle of the field: a toothed rack in its frame with the pawl against it and the lock at its head. Her catch is the bar on the rail beside the rack, carried most of the way down under the navigator's thumb, past the notch, so the next tooth he presses is clean. Player 2's screen, which is the only one the catch is drawn on.",
  lookAt:
    "whether the bar reads as a thing to carry down and keep there rather than a thing to press, and whether the notch it has to pass is visible without a scale beside it",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "ratchet" });
    // Past the still beats, so a window is lit and the hand counts.
    run(w, TPB * 3);
    run(w, TPB, [caught(w.tick, 900)]);
    return w;
  },
};

const RATCHET_PAWL: Pose = {
  name: "RATCHET · THE PAWL UNDER A THUMB",
  note: "The same rack on the other phone, the tick the pilot's thumb lands on the pad: her catch is down off-screen, so the tooth is clean and the rack has started to climb past the pawl. Player 1's screen; her catch is not drawn on it, and nothing on it says whether she was holding.",
  lookAt:
    "whether the pad reads as one press rather than a hold, and whether the climb that answers it is plainly the rack moving and not the pawl",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "ratchet" });
    run(w, TPB * 3);
    run(w, TPB, [caught(w.tick, 900)]);
    const press: TimedCommand = {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "ratchetPawl", on: true, fromMilli: 0 },
    };
    runUntil(
      w,
      "a clean tooth",
      [press],
      (x) => x.boss?.kind === "ratchet" && x.boss.phase === "climb",
    );
    return w;
  },
};

export const RATCHET_GRIPS: readonly Pose[] = [RATCHET_CATCH, RATCHET_PAWL];
