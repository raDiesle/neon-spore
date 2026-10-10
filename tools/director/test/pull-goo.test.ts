import { beforeAll, describe, expect, test } from "bun:test";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { VARIANTS } from "../../versus/candidates/index.js";
import { GOO_DROP } from "../src/pull-goo/drop-look.js";
import { GOO_GRAB, type Grab } from "../src/pull-goo/grab.js";
import { GOO_LOOKS } from "../src/pull-goo/index.js";
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

  test("draw every grab with either drop without a bad call", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const was = { ...GOO_GRAB, ball: GOO_DROP.ball };
    const step = 1 / 30;
    const look = GOO_LOOKS[0] ?? null;
    try {
      for (const kind of ["lean", "squish", "lift", "charge"] as Grab[])
        for (const ball of [false, true]) {
          GOO_GRAB.kind = kind;
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
      GOO_GRAB.kind = was.kind;
      GOO_DROP.ball = was.ball;
    }
  });
});
