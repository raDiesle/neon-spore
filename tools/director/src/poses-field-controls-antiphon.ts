import {
  antiphonBoss,
  antiphonIsOrgan,
  antiphonStanding,
  antiphonVeinMilli,
  type TimedCommand,
} from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE ANTIPHON's two handles posed, one to a screen: the explainer's thumb
 * on the organ, a quarter turn in, and the chooser carrying a candidate down
 * its vein. On the first level the explainer is the pilot and the chooser
 * the navigator; the seats swap every level after (`antiphonExplainer`).
 *
 * The eighth pose the ON THE FIELD tab needed, in a file of its own because
 * `poses-field-controls.ts` is at its limit. It is the first pose of a
 * handle on one screen only: the organ stands on the explainer's and the
 * rail on the chooser's, so this is player 1's screen, and what the reader of
 * that tab is asking is what the pilot sees while he turns the thing to
 * look at it — the contour faced another way, the grip mark filled, the
 * word gone (`render/antiphon-grip.ts`).
 */
export const ANTIPHON_TURN: Pose = {
  name: "ANTIPHON · A THUMB ON THE ORGAN",
  note: "THE ANTIPHON's body over the top of the field with one green organ standing in the middle under where the rail would be, a quarter of the way round under a resting thumb, the grip mark on its lower flank filled and no word under it. Player 1's screen: the rail is not drawn here at all.",
  lookAt:
    "whether the organ reads as the same shape turned rather than a different shape, whether the filled mark reads as a thumb on it, and whether nothing on this screen says which candidate the organ is",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "antiphon" });
    runUntil(w, "an organ grown", [], (world) => {
      const s = antiphonBoss(world);
      return s !== null && antiphonStanding(s, world.cfg, world.beat);
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
 * THE ANTIPHON with a candidate half way down its vein, on the navigator's
 * screen — the mirror of the pose above, and the gesture that answers the
 * fight. What the reader of that tab is asking is whether the candidate in
 * hand reads as *on its way* to the organ's place: its ring goes with it,
 * every candidate left keeps its ring so nothing on the rail says which one
 * is the organ, and the word is gone while the thumb is down
 * (`render/antiphon-rail-grip.ts`). A decoy, so the pose is the carry and
 * never the verdict.
 */
export const ANTIPHON_CARRY: Pose = {
  name: "ANTIPHON · A CANDIDATE ON ITS VEIN",
  note: "THE ANTIPHON's rail of three green candidates a third of the way down the field, a ring on each, and one of them carried half way down its vein toward the middle two rows below. Player 2's screen: the organ is not drawn here at all, and no word is under the rail while her thumb is down.",
  lookAt:
    "whether the carried candidate reads as on its way somewhere rather than falling, whether the rings read as a row of things to choose between rather than one thing to press, and whether nothing on this screen says which candidate is the organ",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh([], [], { kind: "antiphon" });
    runUntil(w, "an organ grown", [], (world) => {
      const s = antiphonBoss(world);
      return s !== null && antiphonStanding(s, world.cfg, world.beat);
    });
    const s = antiphonBoss(w);
    const id = s === null ? -1 : s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i));
    const carry: TimedCommand = {
      tick: w.tick,
      player: 2,
      command: {
        kind: "drag",
        target: "antiphonRail",
        on: true,
        ...(s === null ? { fromMilli: 0, fromYMilli: 0 } : antiphonVeinMilli(w.cfg, s, id, 500)),
        id,
      },
    };
    run(w, TPB, [carry]);
    return w;
  },
};
