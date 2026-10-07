import { describe, expect, it } from "bun:test";
import { sceneScript, WAVES } from "@neon-spore/content";
import { DEFAULT_CONFIG, hiveBoss, SceneRun } from "@neon-spore/sim";
import { handleThumb } from "../src/guide-hand.js";
import { hiveLobeCircle } from "../src/hive-grip.js";
import { computeLayout } from "../src/layout.js";

/**
 * **The navigator's ghost thumb on THE HIVE's lobe**, in the film that holds
 * one: the fifth site is wrung from beat 33 until it opens at 36
 * (`content/scenes/the-hive.ts`). The haul's thumb is proved beside it in
 * `hive-frame.test.ts`; this is the other reading of the same handle, and
 * before it `handleThumb` answered nothing for her seat at all.
 *
 * And the pilot's third reading of it, the hold on a high cocoon up a wall,
 * from beat 46 until the red bolt it steers seals the cocoon at 47.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "test");
const WAVE = WAVES.findIndex((w) => w.guide?.scene === "theHive");

function at(tick: number) {
  const run = new SceneRun(sceneScript("theHive", WAVE, CFG));
  run.restart(tick);
  return run.world;
}

describe("THE HIVE's film, her hand on a swelling lobe", () => {
  it("puts her thumb on the lobe she is holding, and his nowhere", () => {
    const world = at(2100);
    const s = hiveBoss(world);
    expect(s?.pinch).toBe(4);
    const thumb = handleThumb(L, world, 2, 0.5);
    const lobe = s && hiveLobeCircle(L, CFG, s, 4, world.beat, 0.5);
    expect(thumb).toEqual(lobe);
    expect(handleThumb(L, world, 1, 0.5)).toBeNull();
  });

  it("lifts it on the tick the lobe opens wrung", () => {
    const world = at(2170);
    expect(hiveBoss(world)?.wrung[4]).toBe(true);
    expect(handleThumb(L, world, 2, 0.5)).toBeNull();
  });
});

describe("THE HIVE's film, his hand on a high cocoon", () => {
  it("puts his thumb on the cocoon his shots are steering into", () => {
    const world = at(2800);
    const s = hiveBoss(world);
    expect(s?.aim).toBe(6);
    expect(s?.rows[6]).toBe(3);
    const thumb = handleThumb(L, world, 1, 0.5);
    const cocoon = s && hiveLobeCircle(L, CFG, s, 6, world.beat, 0.5);
    expect(thumb).toEqual(cocoon);
  });

  it("lifts it once the cocoon is sealed", () => {
    const world = at(2850);
    expect(hiveBoss(world)?.sealed[6]).toBe(true);
    expect(handleThumb(L, world, 1, 0.5)).toBeNull();
  });
});
