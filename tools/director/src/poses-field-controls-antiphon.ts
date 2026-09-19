import { antiphonBoss, antiphonIsOrgan, type TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE ANTIPHON's two handles posed, one to a screen: the pilot's thumb on
 * the organ, a quarter turn in, and the navigator crossing a candidate off
 * her rail.
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

/**
 * THE ANTIPHON with a candidate crossed off the rail, on the navigator's
 * screen — the mirror of the pose above, and the only gesture on this boss
 * that changes the fight. What the reader of that tab is asking is whether a
 * crossed candidate reads as *out* without reading as *wrong*: the ring goes
 * and a stroke takes its place, and every candidate still in keeps its ring
 * so nothing on the rail says which one is the organ
 * (`render/antiphon-rail-grip.ts`).
 */
export const ANTIPHON_PULL: Pose = {
  name: "ANTIPHON · A CANDIDATE OFF THE RAIL",
  note: "THE ANTIPHON's rail of candidates hanging over the columns, a ring on each one still in and a stroke through the one she has carried down off it. Player 2's screen: the organ is not drawn here at all, and no word is under the rail while her thumb is still on it.",
  lookAt:
    "whether the struck candidate reads as one she has ruled out rather than one the boss has taken, whether the rings read as a row of things to choose between rather than one thing to press, and whether nothing on this screen says which candidate is the organ",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "antiphon" });
    runUntil(w, "an organ grown", [], (world) => {
      const s = antiphonBoss(world);
      const o = s?.organs[0];
      return o !== undefined && world.beat >= o.grownBeat + world.cfg.antiphonGrowBeats;
    });
    const s = antiphonBoss(w);
    const id = s === null ? -1 : s.rail.findIndex((c) => !antiphonIsOrgan(s, c));
    const pull: TimedCommand = {
      tick: w.tick,
      player: 2,
      command: {
        kind: "drag",
        target: "antiphonRail",
        on: true,
        fromMilli: 0,
        fromYMilli: w.cfg.antiphonPullMilli,
        id,
      },
    };
    run(w, TPB, [pull]);
    return w;
  },
};
