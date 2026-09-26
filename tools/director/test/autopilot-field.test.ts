import { describe, expect, test } from "bun:test";
import {
  buildBoss,
  buildPods,
  buildQueue,
  controlSet,
  placedFaults,
  WAVES,
} from "@neon-spore/content";
import { computeLayout, type Field } from "@neon-spore/render";
import { step, type World } from "@neon-spore/sim";
import { fresh, POSE_CONFIG } from "../src/pose-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **AUTO plays an ordinary wave too**: the cannon and the shield together,
 * fed through `step` the way a thumb's presses are (`packages/hands/src/autopilot-field-hand.ts`).
 * Pinned here: BOTH clears ONE LAST CHANCE, rocks and slimes both, with every
 * rock turned by the dome; and every ordinary wave not named below is cleared
 * with the hull unscarred.
 */

/** Ordinary waves whose creatures have a verb of their own — a hold, a reach,
 * a drag, a lure — that the field hand does not play. A wave that gains one
 * is a name here or a hand for its creature. The pods have theirs
 * (`autopilot-pod-hand.ts`). */
const HALF_PLAYED = new Set([
  "THE LURE",
  "THE SHELL",
  "THE CLASP",
  "THE WISP",
  "THE LID",
  "THE CRYSTAL",
  "THE STRAND",
  "THE CRAWLER",
  "THE MAGNET",
  "THE JAM",
  "THE LIMPET",
  "THE LEECH",
  "THE CHOIR",
  "THE BEATBOX",
  "THE WEIGHT",
  "THE MINE",
  "THE MOULT",
]);

/** Wave `index` stood up the way the game starts it, on the poses' config. */
function waveWorld(index: number): World {
  const cols = POSE_CONFIG.cols;
  return fresh(
    buildQueue(index, cols),
    buildPods(index, cols),
    buildBoss(index, cols),
    {},
    index,
    placedFaults(WAVES[index]?.faults),
  );
}

/** AUTO on BOTH until the wave is credited, or the budget is spent. */
function playOut(world: World): World {
  // The finger AUTO draws is placed on the stage's own layout and field, so
  // the rig is the one `autopilot.test.ts` stands a boss up with.
  const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, world.cfg, "test");
  const field = (seat: 1 | 2): Field =>
    stageField(world, "test", controlSet("default"), world.cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode("both");
  for (let i = 0; i < 30_000 && world.balance.wavesCleared === 0; i++) {
    step(world, auto.commands(world));
  }
  return world;
}

describe("AUTO on a wave with no boss", () => {
  test("BOTH clears ONE LAST CHANCE with every rock turned by the dome", () => {
    const index = WAVES.findIndex((w) => w.name === "ONE LAST CHANCE");
    const world = playOut(waveWorld(index));
    expect(world.balance.wavesCleared).toBe(1);
    expect(world.scars).toEqual([]);
    expect(world.guard.tries).toBeGreaterThan(0);
    expect(world.guard.deflected).toBe(world.guard.tries);
  });

  test("BOTH clears every ordinary wave not named as half played, unscarred", () => {
    const failed: string[] = [];
    WAVES.forEach((wave, index) => {
      if (wave.boss || HALF_PLAYED.has(wave.name)) return;
      const world = playOut(waveWorld(index));
      if (world.balance.wavesCleared !== 1 || world.scars.length > 0) failed.push(wave.name);
    });
    expect(failed).toEqual([]);
  });
});
