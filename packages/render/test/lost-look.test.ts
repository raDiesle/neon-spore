import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, type Scar } from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { LOST_LOOK, type LostPaint } from "../src/lost-look.js";
import { drawLostScreen } from "../src/lost-screen.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The seam the lost wave's screen is offered through.
 *
 * The shipped record draws what this screen has always drawn, so there is no
 * picture to hold here — what there is, is the one fact every answer in
 * `lost:screen` depends on and none of them could work out for itself: **where
 * the ship was broken**. The slot exists because a full-screen statement must
 * not cover the breach the pair is meant to be looking at, so an answer is
 * handed the column, and a screen handed the wrong one would cut its hole over
 * intact plating.
 *
 * The other half is the absence: a wall earths through the dome and scars
 * nothing at all (`breachUnscarred`), and an answer has to be told that rather
 * than left to draw a hole at column zero.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

beforeAll(installCanvasGlobals);

function shown(scars: Scar[]): LostPaint {
  const world = createWorld(CFG, 1);
  world.scars.push(...scars);
  const seen: LostPaint[] = [];
  const was = { veil: LOST_LOOK.veil, words: LOST_LOOK.words };
  Object.assign(LOST_LOOK, {
    veil: (_ctx: unknown, p: LostPaint) => seen.push(p),
    words: () => {},
  });
  try {
    drawLostScreen(stubCanvas().ctx as never, L, world, { age: 1 });
  } finally {
    Object.assign(LOST_LOOK, was);
  }
  return seen[0] as LostPaint;
}

describe("the lost screen is told where it got through", () => {
  it("hands the answer the column the hull was last broken in", () => {
    const p = shown([
      { col: 2, beat: 1, kind: "meteor" },
      { col: 7, beat: 5, kind: "meteor" },
    ]);
    expect(p.breachX).toBe(tileCX(L, 7));
  });

  it("says so plainly when nothing scarred the ship", () => {
    // A wall earths through the dome: the wave is lost and the skin is whole.
    expect(shown([]).breachX).toBeNull();
  });

  it("hands over the buttons' own line, so an answer can stay above it", () => {
    const p = shown([{ col: 4, beat: 2, kind: "meteor" }]);
    expect(p.buttonsY).toBeGreaterThan(0);
    expect(p.buttonsY).toBeLessThan(L.height);
  });
});
