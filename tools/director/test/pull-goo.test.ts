import { beforeAll, describe, expect, test } from "bun:test";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { VARIANTS } from "../../versus/candidates/index.js";
import { arrowSize, splitOf } from "../src/pull-goo/arrow.js";
import { GOO_DROP } from "../src/pull-goo/drop-look.js";
import { DOTS_SPAN, dotIn, entering, grown, POP, placeIn } from "../src/pull-goo/enter.js";
import { GOO_LOOKS } from "../src/pull-goo/index.js";
import { SPAWN } from "../src/pull-goo/moment.js";
import { specks } from "../src/pull-goo/strand.js";
import { autoThumb } from "../src/pull-lab-auto.js";
import { labLooks, paintLab } from "../src/pull-lab-paint.js";
import { freshPull, lift, move, press, tick } from "../src/pull-lab-rule.js";
import { LAB_SHAPES } from "../src/pull-lab-shapes.js";

/**
 * The PULL LAB's own GOO looks (`pull-goo/`): they are on the lab's picker
 * and nowhere in VERSUS, and every one of them draws every moment of AUTO's
 * loop on every shape — under either OFF PATH rule — through the strict
 * canvas, which names a NaN, a bad colour or a negative radius.
 */
beforeAll(installCanvasGlobals);

describe("the GOO looks", () => {
  test("are on the lab's picker beside OOZE, and are not VERSUS candidates", () => {
    expect(labLooks().map((v) => v.name)).toEqual(["ooze", ...GOO_LOOKS.map((v) => v.name)]);
    for (const v of GOO_LOOKS) expect(VARIANTS).not.toContain(v);
  });

  test("draw every moment of the loop on every shape without a bad call", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const step = 1 / 60;
    for (const shape of LAB_SHAPES)
      for (const stray of ["tile", "free"] as const) {
        const pull = freshPull(shape);
        let down = false;
        for (let i = 0; i * step < 7.2; i++) {
          const t = i * step;
          const th = autoThumb(shape, t, stray !== "free");
          if (th.down && !down) press(shape, pull, th.at);
          if (th.down) move(shape, pull, th.at, stray);
          if (!th.down && down) lift(shape, pull, "refuse");
          down = th.down;
          tick(shape, pull, step);
          if (i % 6 === 0)
            for (const look of GOO_LOOKS) paintLab(c, { shape, pull, look, time: t, stray });
        }
      }
  });

  test("draw the grab with either drop without a bad call", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const was = GOO_DROP.ball;
    const step = 1 / 30;
    const look = GOO_LOOKS[0] ?? null;
    try {
      for (const ball of [false, true]) {
        GOO_DROP.ball = ball;
        for (const shape of LAB_SHAPES) {
          const pull = freshPull(shape);
          let down = false;
          for (let i = 0; i * step < 3.4; i++) {
            const t = i * step;
            const th = autoThumb(shape, t, true);
            if (th.down && !down) press(shape, pull, th.at);
            if (th.down) move(shape, pull, th.at, "half");
            if (!th.down && down) lift(shape, pull, "refuse");
            down = th.down;
            tick(shape, pull, step);
            paintLab(c, { shape, pull, look, time: t, stray: "half" });
          }
        }
      }
    } finally {
      GOO_DROP.ball = was;
    }
  });

  test("leave their specks where they fell, however the drop swings or goes on", () => {
    const at: string[][] = [];
    const record = (): CanvasRenderingContext2D => {
      const seen: string[] = [];
      at.push(seen);
      return {
        save() {},
        restore() {},
        beginPath() {},
        fill() {},
        ellipse: (x: number, y: number) => seen.push(`${x.toFixed(3)},${y.toFixed(3)}`),
      } as unknown as CanvasRenderingContext2D;
    };
    for (const shape of LAB_SHAPES) {
      at.length = 0;
      const t = shape.track;
      const origin = shape.origin;
      const to = origin > 0 ? 0.1 : 0.7;
      specks(record(), { t, origin, at: to, off: { x: 0, y: 0 } }, 14, 1);
      specks(record(), { t, origin, at: to, off: { x: 12, y: -9 } }, 14, 1);
      specks(record(), { t, origin, at: origin > 0 ? 0.05 : 0.9, off: { x: -8, y: 4 } }, 14, 1);
      const [still, swung, on] = at as [string[], string[], string[]];
      expect(still.length).toBeGreaterThan(2);
      expect([shape.key, swung]).toEqual([shape.key, still]);
      expect([shape.key, on.slice(0, still.length)]).toEqual([shape.key, still]);
    }
  });

  test("come in drop first, then the path, then the place, each quicker than the one before", () => {
    expect(grown(0.01)).toBeGreaterThan(0.1);
    expect(grown(0.01)).toBeLessThan(0.4);
    expect(dotIn(1, 12, SPAWN * 0.4)).toBeNull();
    expect(dotIn(1, 12, SPAWN * 0.6)).not.toBeNull();
    expect(DOTS_SPAN).toBeLessThan(SPAWN);
    expect(POP).toBeLessThan(DOTS_SPAN);
    expect(placeIn(12, SPAWN * 0.55 + DOTS_SPAN)).toBeNull();
    expect(entering(SPAWN + DOTS_SPAN + POP)).toBe(false);
  });

  test("carry an arrow ahead of the drop's size, two apart for a two-way pull until pulled", () => {
    expect(arrowSize(10, 0.2)).toBeGreaterThan(10 * 0.2);
    expect(arrowSize(10, 1)).toBe(10);
    expect(arrowSize(10, 0)).toBe(0);
    expect(splitOf(true, 0)).toBe(1);
    expect(splitOf(true, 0.08)).toBeGreaterThan(0);
    expect(splitOf(true, -0.08)).toBeLessThan(1);
    expect(splitOf(true, 0.3)).toBe(0);
    expect(splitOf(false, 0)).toBe(0);
  });
});
