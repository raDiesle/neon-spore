import { antiphonBoss, antiphonStanding } from "@neon-spore/sim";
import { fresh, type Pose, runUntil } from "./pose-kit.js";

/**
 * THE ANTIPHON's rail on a level whose organ rests at a turn
 * (`sim/antiphon-turn.ts`, `antiphonRestingTurn`, off as it ships): the
 * three candidates are the organ's one contour at three quarter turns, so
 * the question is which way up rather than which shape. On from the first
 * level here, so the rail is turned on the navigator's screen. VERSUS
 * patches drawing round one world and cannot offer a simulation switch, so
 * this is where the switch is seen before the owner throws it.
 */
export const ANTIPHON_TURNED_RAIL_POSE: Pose = {
  name: "ANTIPHON · A RAIL TURNED",
  note: "THE ANTIPHON's rail with the resting turn on: three green candidates a third of the way down, one contour three ways up, a ring on each. Player 2's screen: the organ, resting a quarter round, is not drawn here.",
  lookAt:
    "whether the three read as one shape three ways up rather than three shapes, and whether the turn between them is large enough to be said",
  crop: "field",
  role: "p2",
  build: () => {
    const w = fresh(
      [],
      [],
      { kind: "antiphon" },
      { antiphonRestingTurn: true, antiphonTurnPits: 0 },
    );
    runUntil(w, "an organ grown", [], (world) => {
      const s = antiphonBoss(world);
      return s !== null && antiphonStanding(s, world.cfg, world.beat);
    });
    return w;
  },
};
