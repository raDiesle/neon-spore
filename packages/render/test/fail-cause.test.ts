import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, DEFAULT_CONFIG, failWave, type World } from "@neon-spore/sim";
import { drawFailCause, failReason } from "../src/fail-cause.js";
import { computeLayout } from "../src/layout.js";
import { LOST_LOOK, type LostPaint } from "../src/lost-look.js";
import { drawLostScreen } from "../src/lost-screen.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The owner, 10 October 2026: a boss shot in the wrong colour loses the wave
 * and says why, *in very visible text … in the exact moment the shot hit
 * wrong* (`fail-cause.ts`).
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

beforeAll(installCanvasGlobals);

function lost(cause: "hull" | "wrongColour"): World {
  const world = createWorld({ ...CFG }, 1);
  world.scars.push({ col: 3, beat: 1, kind: "meteor" });
  failWave(world, cause);
  return world;
}

function drawn(world: World): string[] {
  const { ctx } = stubCanvas();
  const texts: { text: string }[] = [];
  Object.assign(ctx, { texts });
  drawFailCause(ctx as never, L, world);
  return texts.map((t) => t.text);
}

function paintOf(world: World): LostPaint {
  const seen: LostPaint[] = [];
  const was = { veil: LOST_LOOK.veil, words: LOST_LOOK.words };
  Object.assign(LOST_LOOK, { veil: (_c: unknown, p: LostPaint) => seen.push(p), words: () => {} });
  try {
    drawLostScreen(stubCanvas().ctx as never, L, world, { age: 1 });
  } finally {
    Object.assign(LOST_LOOK, was);
  }
  return seen[0] as LostPaint;
}

describe("why a wave was lost, in words", () => {
  it("says WRONG COLOUR over the held field from the tick of the shot", () => {
    const world = lost("wrongColour");
    for (const after of [0, 30, 200]) {
      world.tick = world.failTick + after;
      expect(drawn(world)).toContain("WRONG COLOUR");
    }
  });

  it("says nothing for a breach, whose tear is the reason", () => {
    expect(failReason(lost("hull"))).toBeNull();
    expect(drawn(lost("hull"))).toEqual([]);
  });

  it("says nothing while the wave is live", () => {
    expect(failReason(createWorld({ ...CFG }, 1))).toBeNull();
  });

  it("tells the lost screen the reason, and no breach from an earlier wave", () => {
    const wrong = paintOf(lost("wrongColour"));
    expect(wrong.reason).toBe("WRONG COLOUR");
    expect(wrong.breachX).toBeNull();
    const hull = paintOf(lost("hull"));
    expect(hull.reason).toBeNull();
    expect(hull.breachX).not.toBeNull();
  });

  it("draws the reason line on the lost screen's own paint", () => {
    const world = lost("wrongColour");
    const { ctx } = stubCanvas();
    const texts: { text: string }[] = [];
    Object.assign(ctx, { texts });
    drawLostScreen(ctx as never, L, world, { age: 2.5 });
    expect(texts.map((t) => t.text)).toContain("WRONG COLOUR");
  });
});
