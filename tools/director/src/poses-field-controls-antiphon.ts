import { antiphonBoss, type TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE ANTIPHON with the pilot's thumb on the organ, a quarter turn in.
 *
 * The eighth pose the ON THE FIELD tab needed, in a file of its own because
 * `poses-field-controls.ts` is at its limit. It is the first pose of a
 * handle on one screen only: the organ hangs on the pilot's and the rail
 * on the navigator's, so this is player 1's screen, and what the reader of
 * that tab is asking is what the pilot sees while he turns the thing to
 * look at it — the contour faced another way, the grip mark filled, the
 * word gone (`render/antiphon-grip.ts`).
 */
export const ANTIPHON_TURN: Pose = {
  name: "ANTIPHON · A THUMB ON THE ORGAN",
  note: "THE ANTIPHON's body over the top of the field with one organ hanging under its middle in the body's violet, a quarter of the way round under a resting thumb, the grip mark on its lower flank filled and no word under it. Player 1's screen: the rail is not drawn here at all.",
  lookAt:
    "whether the organ reads as the same shape turned rather than a different shape, whether the filled mark reads as a thumb on it, and whether nothing on this screen says which column the organ came from",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "antiphon" });
    runUntil(w, "an organ grown", [], (world) => {
      const s = antiphonBoss(world);
      const o = s?.organs[0];
      return o !== undefined && world.beat >= o.grownBeat + world.cfg.antiphonGrowBeats;
    });
    const thumb: TimedCommand = {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "antiphonOrgan", on: true, fromMilli: 0, fromYMilli: 0 },
    };
    run(w, Math.floor((TPB * w.cfg.antiphonTurnBeats) / 4), [thumb]);
    return w;
  },
};
