import { beforeAll, describe, expect, setDefaultTimeout, test } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type QueenState, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { craneElbow, craneJoints, craneRelease } from "../src/queen-crane.js";
import { QUEEN_FIGURE, queenRoot } from "../src/queen-figure.js";
import { QUEEN_ARM, type QueenParts, queenParts } from "../src/queen-parts.js";
import { maxSpeed, sample } from "./drift-stats.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";
import { queenOnField } from "./queen-on-field.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE BULB QUEEN's arms, her large parts (`queen-parts.ts`, `QUEEN_ARM`): the
 * owner left how far she moves to the lane on the condition that what falls
 * and the torches barely move sideways, and neither takes a part at all. So
 * her elbows swing a tile, slowed to stay under the spec's 20° a second, and
 * the arm is at its still pose on every drop.
 */

describe("THE BULB QUEEN's arms", () => {
  // Two phone stills at her widest moment tell apart by a tile or more of elbow.
  test("her elbow, as drawn, swings a tile at its widest and never past `QUEEN_ARM.tip`", () => {
    const { l, queen, root } = queenOnField();
    const bodyY = tileCY(l, queen.row) + QUEEN_FIGURE.bodyCy * l.tile;
    const j = craneJoints(l.tile, tileCX(l, queen.col), bodyY, 1, 700, tileCY(l, queen.row), 30, 0);
    let worst = 0;
    for (let f = 0; f <= 600 * 20; f++) {
      const a = (queenParts(l, queen, f / 20, 1, root.reach) as QueenParts).arm.right;
      const e = craneElbow(j, a, 0);
      worst = Math.max(worst, Math.hypot(e.x - j.elbow.x, e.y - j.elbow.y) / l.tile);
    }
    expect(worst).toBeLessThanOrEqual(QUEEN_ARM.tip);
    expect(worst).toBeGreaterThanOrEqual(1);
  });

  test("the arm's swing is gone once it has straightened to let go", () => {
    const { l, queen, root } = queenOnField();
    const a = (queenParts(l, queen, 9.1, 1, root.reach) as QueenParts).arm.right;
    const bodyY = tileCY(l, queen.row) + QUEEN_FIGURE.bodyCy * l.tile;
    const j = (release: number) =>
      craneJoints(l.tile, tileCX(l, queen.col), bodyY, 1, 700, tileCY(l, queen.row), 30, release);
    expect(craneElbow(j(1), a, 1)).toEqual(j(1).elbow);
    const held = craneElbow(j(0), a, 0);
    expect(Math.hypot(held.x - j(0).elbow.x, held.y - j(0).elbow.y)).toBeGreaterThan(1);
  });

  // The claw is drawn at the rock's wrist and takes no part (`drawCraneClaw`), so the arm is all there is to still.
  test("on every drop of her wave, the arm that lets go is at its still pose", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const index = waveWith("queen");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    const l = computeLayout(VIEWPORT, CFG, "test");
    let drops = 0;
    for (let tick = 0; tick < ticksPerBeat(CFG) * 64; tick++) {
      step(world, []);
      const boss = world.boss as QueenState | null;
      const queen = world.creatures.find((c) => c.kind === "queen");
      if (boss?.kind !== "queen" || !queen || boss.releaseSide === 0) continue;
      if (boss.releaseBeat !== world.beat) continue;
      const side = boss.releaseSide;
      const release = craneRelease(boss, side, world.beat, world.beat, 0, 0);
      expect(release).toBe(1);
      const parts = queenParts(l, queen, tick / 60, 1, queenRoot(l, queen).reach) as QueenParts;
      const a = side === 1 ? parts.arm.right : parts.arm.left;
      const bodyY = tileCY(l, queen.row) + QUEEN_FIGURE.bodyCy * l.tile;
      const j = craneJoints(
        l.tile,
        tileCX(l, queen.col),
        bodyY,
        side,
        700,
        tileCY(l, queen.row),
        30,
        release,
      );
      expect(craneElbow(j, a, release)).toEqual(j.elbow);
      drops++;
    }
    expect(drops).toBeGreaterThan(0);
  });

  // Her arm moves further than its row, so it is slowed (`QUEEN_ARM.slow`) to stay under the own ceiling.
  test("her arm's own swing is under 20° a second", () => {
    const { l, queen, root } = queenOnField();
    const at = (t: number) => (queenParts(l, queen, t, 1, root.reach) as QueenParts).arm.right;
    expect(maxSpeed(sample((t) => at(t)?.rotate ?? 0, 120))).toBeLessThanOrEqual(20);
  });
});
