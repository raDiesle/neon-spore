import { type FlueStep, flueEmberCol, flueSteady, type World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE FLUE's tap, **photographed from the tapper's seat**, the screen it is
 * pressed on. A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** Act 13's first vent, the navigator keeping still and the pilot tapping, and the fire after it. */
const STEPS: FlueStep[] = [
  { ask: "vent", rester: 2, notches: [-2, 1], color: "either", beats: 12 },
  { ask: "fire", rester: "both", notches: [], color: "red", beats: 3 },
];

/** The navigator has kept still until the ember stopped, and the pilot has tapped it once. */
function emberSteady(): World {
  const w = fresh([], [], { kind: "flue", steps: STEPS });
  runUntil(w, "the ember steady", [], (x) => x.boss?.kind === "flue" && flueSteady(x, x.boss));
  const b = w.boss;
  if (b?.kind !== "flue") throw new Error("the flue pose stood no flue");
  const col = flueEmberCol(w.cfg, b);
  run(w, TPB / 2, [
    {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "flueTap", on: true, fromMilli: 0, id: col },
    },
    {
      tick: w.tick + 2,
      player: 1,
      command: { kind: "drag", target: "flueTap", on: false, fromMilli: 0, id: col },
    },
  ]);
  return w;
}

const FLUE_EMBER: Pose = {
  name: "FLUE · THE EMBER STEADY",
  note: "THE FLUE across the field: seven soot-black units in a row, a slot cut through them and an ember riding in it. The first vent is lit; player 2 has kept still until the ember stopped, and player 1 has tapped it once — one stud of three filled. Player 1's screen, the tapper's.",
  lookAt: "whether the stopped ember reads as *tap here*, and the stud as one of three",
  crop: "field",
  role: "p1",
  build: emberSteady,
};

export const FLUE_GRIPS: readonly Pose[] = [FLUE_EMBER];
