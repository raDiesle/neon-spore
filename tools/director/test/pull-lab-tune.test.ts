import { beforeAll, describe, expect, test } from "bun:test";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { autoDrive } from "../src/pull-lab-auto.js";
import { paintLab } from "../src/pull-lab-paint.js";
import { freshPull, press, tick } from "../src/pull-lab-rule.js";
import {
  knobOf,
  LAB_KNOB,
  LAB_SHAPES,
  LAB_TILE,
  labShape,
  sized,
  tileOf,
} from "../src/pull-lab-shapes.js";
import { strayReach } from "../src/pull-lab-stray.js";

/**
 * The PULL LAB's size (`pull-lab-tune.ts`): the owner, 12 October 2026,
 * after seeing FIZZ on THE LAMPREY. A size moves the whole control and the
 * reach a press is taken at, never the length the rule asks for.
 */
beforeAll(installCanvasGlobals);

const down = labShape("down");

test("draws every shape twice the size without a bad value", () => {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  for (const shape of LAB_SHAPES)
    paintLab(c, { shape: sized(shape, 2), pull: freshPull(shape), look: null, time: 1 });
});

describe("a size", () => {
  test("moves the knob and the channel, and leaves the length and the tile", () => {
    for (const shape of LAB_SHAPES) {
      const big = sized(shape, 2);
      expect(knobOf(big)).toBeCloseTo(LAB_KNOB * 2);
      expect(big.track.w).toBeCloseTo(shape.track.w * 2);
      expect(big.track.pts).toBe(shape.track.pts);
      expect(tileOf(big)).toBe(LAB_TILE);
    }
    expect(sized(down, 1)).toBe(down);
  });

  test("takes a press as far out as the knob it draws", () => {
    const start = down.track.pts[0] as { x: number; y: number };
    // Outside the grab round a knob of one size, inside the one of twice it.
    const at = { x: start.x + LAB_KNOB * 3, y: start.y };
    expect(press(down, freshPull(down), at)).toBe(false);
    expect(press(sized(down, 2), freshPull(down), at)).toBe(true);
  });

  test("AUTO still counts a doubled pull the whole way", () => {
    const shape = sized(down, 2);
    const pull = freshPull(shape);
    let held = false;
    for (let t = 0; t < 3 && pull.counted === 0; t += 1 / 60) {
      held = autoDrive(shape, pull, t, held, { stray: "half", short: "refuse" }).down;
      tick(shape, pull, 1 / 60);
    }
    expect(pull.counted).toBe(1);
  });
});

test("the OFF PATH reach is in the shape's own tile", () => {
  expect(strayReach("half")).toBe(LAB_TILE / 2);
  expect(strayReach("half", false, 60)).toBe(30);
  expect(strayReach("half", true, 60)).toBe(60);
  expect(strayReach("free", false, 60)).toBeNull();
});
