import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Canvas2DRenderer } from "@neon-spore/render";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { stageGeometry } from "../src/stage-point.js";

/**
 * **THE DIRECTOR'S STAGE FOLLOWS ITS BOX, AND NOTHING PINS IT.**
 *
 * `Canvas2DRenderer.resize` used to write the size it was handed onto the
 * canvas as an inline CSS width and height, and a sheet-sized host had to
 * delete both before every measurement or the first size stuck through every
 * later one. The renderer sets only the backing store now; this proves the
 * director's geometry, driven through a real renderer, follows a box that
 * moved and leaves no inline length behind.
 */

let observers: (() => void)[] = [];
const saved: Record<string, unknown> = {};

beforeAll(() => {
  const g = globalThis as Record<string, unknown>;
  saved.window = g.window;
  saved.ResizeObserver = g.ResizeObserver;
  g.window = { devicePixelRatio: 2 };
  g.ResizeObserver = class {
    constructor(private fn: () => void) {
      observers.push(fn);
    }
    observe(): void {}
  };
});

afterAll(() => {
  const g = globalThis as Record<string, unknown>;
  for (const k of ["window", "ResizeObserver"]) {
    if (saved[k] === undefined) delete g[k];
    else g[k] = saved[k];
  }
  observers = [];
});

describe("the director's stage when its box changes size", () => {
  test("remeasures, resizes the backing store and writes no inline size", () => {
    const { canvas } = stubCanvas();
    let rect = { left: 0, top: 0, width: 360, height: 640 };
    Object.assign(canvas, {
      getBoundingClientRect: () => rect,
      parentElement: {},
    });
    const renderer = new Canvas2DRenderer(canvas);
    const geo = stageGeometry(
      canvas,
      DEFAULT_CONFIG,
      () => "test",
      (v) => renderer.resize(v),
    );

    expect(geo.viewport()).toEqual({ width: 360, height: 640, dpr: 2 });
    expect(canvas.width).toBe(720);

    // The column resizer is dragged: the sheet gives the canvas a new box.
    rect = { left: 0, top: 0, width: 300, height: 540 };
    for (const fn of observers) fn();

    expect(geo.viewport()).toEqual({ width: 300, height: 540, dpr: 2 });
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(1080);
    expect(canvas.style.width).toBeUndefined();
    expect(canvas.style.height).toBeUndefined();
  });
});
