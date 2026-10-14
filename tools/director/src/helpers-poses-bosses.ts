import { hullRow, undertowBoss, type World } from "@neon-spore/sim";
import { type Pose, runUntil } from "./pose-kit.js";
import { bossWorld } from "./poses-bosses-kit.js";

/**
 * The frames ONE BOSS'S OWN on CONTROLS › HELPERS draws where no gallery
 * pose holds the one-seat picture (`helpers-bosses.ts`). Every gallery pose
 * of THE UNDERTOW is a lobe already standing, and its bow is the beats
 * before one does.
 */

/** A beat of the bow left: the plate near its full lift and shaking. */
const bowNearlyThrough = (w: World): boolean => {
  const u = undertowBoss(w);
  const last = w.cfg.undertowBowBeats - 1;
  return u?.lobes.some((l) => l.stage === "bowing" && w.beat - l.stageBeat >= last) === true;
};

/** THE UNDERTOW's plate bowing under a lobe about to come through, on the pilot's screen. */
export const UNDERTOW_BOWING: Pose = {
  name: "HELPERS · THE UNDERTOW'S PLATE BOWING",
  note: "A beat before a lobe stands, the hull plate lifted and shaking over it.",
  crop: "tile",
  role: "p1",
  // Round the plate, at the hull: at the size of the ship the lift is a hair.
  span: 3,
  at: (w) => {
    const bowing = undertowBoss(w)?.lobes.find((l) => l.stage === "bowing");
    return { col: bowing?.col ?? 0, row: hullRow(w.cfg) - 0.5 };
  },
  build: () => {
    const w = bossWorld("undertow");
    runUntil(w, "a plate nearly through", [], bowNearlyThrough);
    return w;
  },
};
