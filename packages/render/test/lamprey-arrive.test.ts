import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { framePhase, lampreyBoss, step, ticksPerBeat } from "@neon-spore/sim";
import { lampreyPose } from "../src/lamprey-pose.js";
import { lampreySpine, lampreyTailTip, type Point } from "../src/lamprey-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { stood } from "./lamprey-harness.js";

/**
 * THE LAMPREY stops where it was going (the owner, 9 October 2026: *it
 * should have fluent movement where it was before and where it stops for
 * players to take action. right now its jumping positions*): from the meal
 * through the crawl onto its first tile and two beats into the bite, neither
 * the mouth nor the tail's tip moves more than a fraction of a tile between
 * one tick and the next (`lamprey-pose.ts`, `crawledTo`).
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const TPB = ticksPerBeat(CFG);
/** The most a tick may carry either end, in tiles: a crawl of three tiles a beat stays well under it. */
const STEP = 0.35;

const far = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y) / L.tile;

describe("THE LAMPREY onto its first tile", () => {
  it("glides from the crawl into the bite instead of jumping", () => {
    const world = stood();
    let last: { mouth: Point; tip: Point } | null = null;
    let bit = -1;
    let worst = { mouth: 0, tip: 0 };
    for (let i = 0; i < TPB * 80 && (bit < 0 || world.beat < bit + 2); i++) {
      step(world, []);
      const s = lampreyBoss(world);
      if (s === null) throw new Error("the wave lost its lamprey");
      if (bit < 0 && s.phase === "bite") bit = world.beat;
      const pose = lampreyPose(L, CFG, s, world.beat, framePhase(world));
      const now = { mouth: { x: pose.x, y: pose.y }, tip: lampreyTailTip(lampreySpine(L, pose)) };
      if (last !== null && s.phase !== "entering") {
        worst = {
          mouth: Math.max(worst.mouth, far(last.mouth, now.mouth)),
          tip: Math.max(worst.tip, far(last.tip, now.tip)),
        };
      }
      last = now;
    }
    expect(bit).toBeGreaterThan(0);
    expect(worst.mouth).toBeLessThan(STEP);
    expect(worst.tip).toBeLessThan(STEP);
  });
});
