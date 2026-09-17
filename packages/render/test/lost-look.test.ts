import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, DEFAULT_CONFIG, type Scar } from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { LOST_LOOK, type LostPaint } from "../src/lost-look.js";
import { drawLostScreen } from "../src/lost-screen.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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

/**
 * And the record's own paint, actually drawn.
 *
 * Everything above this replaces `veil` and `words` to read what they were
 * handed, so until `shutters` shipped nothing in the tree ever ran the real
 * ones through a canvas. What the stub refuses is exactly what this screen can
 * get wrong: a rivulet's head at a NaN coordinate when `age` is 0 and its
 * phase is still gathering, a negative radius out of a thickness that went the
 * wrong side of zero, an unparseable colour out of an alpha over one.
 *
 * Three ages, because the screen is three different pictures: the instant it
 * arrives with the field still open, the half second the plates are sliding
 * in from both edges, and the settled state the pair reads — shut, with one
 * lit slot in the breach column.
 */
describe("the lost screen's own paint survives a canvas that refuses what a real one does", () => {
  for (const age of [0, 0.25, 2.5]) {
    it(`draws at ${age} seconds with a breach to cut around`, () => {
      const world = createWorld(CFG, 1);
      world.scars.push({ col: 7, beat: 5, kind: "meteor" });
      const { ctx } = stubCanvas();
      drawLostScreen(ctx as never, L, world, { age });
      expect(ctx.calls).toBeGreaterThan(0);
    });
  }

  it("draws on a wave the ship came out of unscarred", () => {
    // `breachX` is null here, which is the branch the tear is skipped on.
    const { ctx } = stubCanvas();
    drawLostScreen(ctx as never, L, createWorld(CFG, 1), { age: 2.5 });
    expect(ctx.calls).toBeGreaterThan(0);
  });
});
