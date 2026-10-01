import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { queenRoot } from "../src/queen-figure.js";
import { CFG, VIEWPORT, waveWith } from "./frame-harness.js";

/** Her wave started, her creature, the test layout and her root on it. */
export function queenOnField() {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const index = waveWith("queen");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const queen = world.creatures.find((c) => c.kind === "queen");
  if (!queen) throw new Error("no queen");
  const l = computeLayout(VIEWPORT, CFG, "test");
  return { l, queen, root: queenRoot(l, queen) };
}
