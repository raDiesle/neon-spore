import { hullRow, stareBoss, stareOpenLive, undertowBoss, type World } from "@neon-spore/sim";
import { type Pose, runUntil, shoot } from "./pose-kit.js";
import { bossWorld } from "./poses-bosses-kit.js";

/**
 * The frames ONE BOSS'S OWN on CONTROLS › HELPERS draws where no gallery
 * pose holds the one-seat picture (`helpers-bosses.ts`). Every gallery pose
 * of THE UNDERTOW is a lobe already standing, and its bow is the beats
 * before one does; THE STARE's catch is a press no gallery pose makes.
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

/** The tick THE STARE catches the navigator's fire on an open beat: her panel's flash. */
export const STARE_CAUGHT: Pose = {
  name: "HELPERS · THE STARE CATCHING A PRESS",
  note: "P2 fired on an open beat of a live pass, and the eye caught it.",
  crop: "ship",
  role: "p2",
  build: () => {
    const w = bossWorld("stare");
    const open = (x: World): boolean => {
      const s = stareBoss(x);
      return s !== null && stareOpenLive(s);
    };
    runUntil(w, "an open beat", [], open, 200 * w.cfg.tickHz);
    runUntil(w, "the press caught", [shoot(w.tick, "red")], (x) =>
      x.events.some((e) => e.type === "stareCaught"),
    );
    return w;
  },
};
