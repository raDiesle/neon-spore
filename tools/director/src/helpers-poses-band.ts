import { batonHand } from "@neon-spore/hands";
import { batonBoss, batonLocked, failHolds, type World } from "@neon-spore/sim";
import { aim, type Pose, run, runUntil, shoot } from "./pose-kit.js";
import { bossPose, bossWorld } from "./poses-bosses-kit.js";

/**
 * Two frames CONTROLS › HELPERS draws where no gallery pose ends on the
 * moment: a wave lost to a bolt in the wrong colour (`helpers-aim.ts`), and
 * THE BATON's grey panel over the seat that just acted (`helpers-faults.ts`).
 * The band THE MIRROR puts out is `THE MIRROR · SHOW` as the gallery has it.
 */

const queen = (w: World) => w.creatures.find((c) => c.kind === "queen");

/** Ticks the stamp is left to settle: it is a fifth larger for its first sixth of a second. */
const SETTLED = 12;

/**
 * THE BULB QUEEN in bloom, a bolt in the other colour fired up the mark on
 * her right, and the field held on the tick it lands. The hull is not
 * invulnerable here, as it is in every other pose (`POSE_CONFIG`): that is
 * what keeps a pose from ever being lost, and this one is about being lost.
 */
export const WRONG_COLOUR: Pose = {
  name: "HELPERS · LOST TO THE WRONG COLOUR",
  note: "A bolt in the wrong colour into THE BULB QUEEN's mark, and the wave lost on the tick.",
  crop: "field",
  role: "p2",
  build: () => {
    const w = bossWorld("queen", { hullInvulnerable: false });
    runUntil(w, "her bloom", [], (x) => Boolean(queen(x)?.color), 60 * 40);
    const q = queen(w);
    const other = q?.color === "red" ? "cyan" : "red";
    const t = w.tick;
    runUntil(w, "the wave lost", [aim(t, (q?.col ?? 3) + 1), shoot(t + 8, other)], failHolds, 600);
    run(w, SETTLED);
    return w;
  },
};

const BATON_LOCKED = bossPose("baton", "passing", "", {
  hand: batonHand,
  want: (w) => {
    const b = batonBoss(w);
    return b !== null && batonLocked(b, 1, w.beat);
  },
  budgetBeats: 110,
});

/** The pilot's panel greyed for the beat after his press on THE BATON's bead. */
export const BATON_GREY: Pose = {
  ...BATON_LOCKED,
  name: "HELPERS · THE PILOT'S PANEL GREYED",
  note: "P1 has just pressed; his band is grey until the next beat, and the bead is P2's.",
  crop: "ship",
  role: "p1",
};
