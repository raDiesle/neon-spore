import { beforeAll, describe, expect, test } from "bun:test";
import { arrowSize, capSeat, splitOf } from "../../../packages/render/src/goo-arrow.js";
import {
  dotCount,
  dotsEnd,
  ghostFront,
  passed,
  placeBeat,
} from "../../../packages/render/src/goo-beat.js";
import { centre, DROP_SPIN, drop, rimAt } from "../../../packages/render/src/goo-body.js";
import { GOO_CALL } from "../../../packages/render/src/goo-call.js";
import { GOO_DROP } from "../../../packages/render/src/goo-drop-look.js";
import {
  DOTS_SPAN,
  dotIn,
  entering,
  grown,
  POP,
  placeIn,
} from "../../../packages/render/src/goo-enter.js";
import { SPAWN } from "../../../packages/render/src/goo-moment.js";
import { stillSpin, stoppedSpin } from "../../../packages/render/src/goo-soft.js";
import { liftOf } from "../../../packages/render/src/goo-soft-cap.js";
import { CLEAR, craterOf, RIPPLES_STILL } from "../../../packages/render/src/goo-soft-crater.js";
import { specks, splashAt } from "../../../packages/render/src/goo-strand.js";
import { GOO } from "../../../packages/render/src/goo-style.js";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { CALL_LOOKS } from "../src/pull-calls/index.js";
import { flashOf } from "../src/pull-calls/paint.js";
import { autoThumb } from "../src/pull-lab-auto.js";
import { labLooks, paintLab } from "../src/pull-lab-paint.js";
import { freshPull, lift, move, press, tick } from "../src/pull-lab-rule.js";
import { LAB_SHAPES } from "../src/pull-lab-shapes.js";

/**
 * FIZZ, the PULL LAB's GOO look and every pull handle's in the game since 11
 * October 2026 (`packages/render/src/goo-*.ts`): the lab draws every moment of AUTO's
 * loop on every shape — under either OFF PATH rule — through the strict
 * canvas, which names a NaN, a bad colour or a negative radius.
 */
beforeAll(installCanvasGlobals);

describe("the GOO look, as it ships", () => {
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
          if (i % 6 === 0) paintLab(c, { shape, pull, look: null, time: t, stray });
        }
      }
  });

  test("draw every CALL round a waiting drop, flashing first in the dots' run", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const shipped = GOO_CALL.paint;
    expect(labLooks()).toEqual(expect.arrayContaining([...CALL_LOOKS]));
    for (const look of CALL_LOOKS)
      for (const shape of LAB_SHAPES) {
        const pull = freshPull(shape);
        for (let t = 0; t < 3; t += 1 / 20) {
          tick(shape, pull, 1 / 20);
          paintLab(c, { shape, pull, look, time: t, stray: "half" });
          // Held for the frame only: the game's call is back after it.
          expect(GOO_CALL.paint).toBe(shipped);
        }
      }
    // The drop lights as the ghost sets off, before the first dot; never while the path comes in.
    expect(flashOf(0, 9)).toBe(1);
    expect(flashOf(0, 0)).toBe(0);
  });

  test("draw the grab without a bad call", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const step = 1 / 30;
    const look = null;
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

  test("light the place one dot's beat after the last dot, at the dots' own pace", () => {
    for (const shape of LAB_SHAPES) {
      const t = shape.track;
      const n = dotCount(t, 14);
      const marks = [...Array.from({ length: n }, (_, i) => (dotsEnd(t, 14) * (i + 1)) / n)];
      marks.push(placeBeat(t, 14));
      // The second each mark first lights, the ghost's front run frame by frame.
      const lit = marks.map((along) => {
        for (let f = 0; f < 960; f++) if (passed(ghostFront(f / 600), along) > 0) return f / 600;
        return Number.NaN;
      });
      const gaps = lit.slice(1).map((s, i) => s - (lit[i] as number));
      const first = gaps[0] as number;
      for (const g of gaps)
        expect([shape.key, Math.abs(g - first) < 0.004]).toEqual([shape.key, true]);
    }
  });

  test("keep the crater in the middle of the drop and clear of its rim, however pressed", () => {
    for (const time of [0, 0.7, 2.3, 5.1])
      for (const depth of [0.1, 0.6, 1])
        for (const b of [
          drop({ x: 0, y: 0 }, 40, { lean: { x: 0, y: 1 }, stretch: 0.3, squash: 1.1, shake: 0.1 }),
          drop({ x: 0, y: 0 }, 40, { lean: { x: 0, y: -1 }, stretch: 0.2 }),
        ]) {
          const cr = craterOf(b, GOO, time, depth);
          const c = centre(b);
          const sq = b.squash ?? 1;
          for (const p of cr.pts) {
            const x = p.x - c.x;
            const y = p.y - c.y;
            const rim = rimAt(b, GOO, time, Math.atan2(y * sq, x / sq));
            expect(Math.hypot(x, y)).toBeLessThanOrEqual(
              Math.hypot(rim.x, rim.y) - CLEAR * 40 + 1e-6,
            );
          }
          expect(cr.r).toBeGreaterThan(40 * 0.4);
          expect(Math.hypot(cr.mid.x - c.x, cr.mid.y - c.y)).toBeLessThan(40 * 0.15);
        }
  });

  test("stop a still drop's turning once taken, from where the turning had it", () => {
    expect(stoppedSpin(3, 0)).toBeCloseTo(3 * DROP_SPIN, 9);
    expect(stoppedSpin(3.01, 0.01) - stoppedSpin(3, 0)).toBeGreaterThan(0);
    expect(stoppedSpin(5, 2) - stoppedSpin(4, 1)).toBeCloseTo(0, 2);
    // Held 1.5 s from 3 s on, let go at 4.5 s: no jump at the grab, at the let go, or
    // once it has caught up.
    const at = (time: number) =>
      time < 3
        ? stillSpin(time, { held: false, grabbed: 61, lifted: 1 })
        : time < 4.5
          ? stillSpin(time, { held: true, grabbed: time - 3, lifted: 9 })
          : stillSpin(time, { held: false, grabbed: time - 3, lifted: time - 4.5 });
    for (let f = 0; f < 300; f++) {
      const t = 2.5 + f / 100;
      expect(Math.abs(at(t + 0.01) - at(t))).toBeLessThan(0.05);
    }
    expect(at(6)).toBeCloseTo(6 * DROP_SPIN, 9);
    expect(stillSpin(1, { held: false, grabbed: 61, lifted: 1 })).toBeCloseTo(DROP_SPIN, 9);
  });

  test("slow RIPPLES · STILL to a crawl while pulled, not a stop, and catch it up after", () => {
    const keep = RIPPLES_STILL.still ?? 1;
    expect(keep).toBeGreaterThan(0);
    expect(keep).toBeLessThan(0.25);
    expect(stoppedSpin(5, 2, keep) - stoppedSpin(4, 1, keep)).toBeCloseTo(keep * DROP_SPIN, 2);
    const at = (time: number) =>
      time < 4.5
        ? stillSpin(time, { held: true, grabbed: time - 3, lifted: 9 }, keep)
        : stillSpin(time, { held: false, grabbed: time - 3, lifted: time - 4.5 }, keep);
    for (let f = 0; f < 300; f++) {
      const t = 3 + f / 100;
      expect(Math.abs(at(t + 0.01) - at(t))).toBeLessThan(0.05);
    }
    expect(at(6)).toBeCloseTo(6 * DROP_SPIN, 9);
  });

  test("draw every drop as RIPPLES · STILL, the owner's pick and the only one", () => {
    expect(GOO_DROP).toBe(RIPPLES_STILL);
  });

  test("stand the cap up untouched and push it level by half way in", () => {
    const b = drop({ x: 0, y: 0 }, 40);
    expect(liftOf(b, 0)).toBeGreaterThan(40 * 0.15);
    expect(liftOf(b, 0.25)).toBeLessThan(liftOf(b, 0));
    expect(liftOf(b, 0.5)).toBe(0);
    expect(liftOf(b, 1)).toBe(0);
  });

  test("sit the arrow smaller and half way up a standing cap, full size once it is pressed", () => {
    const b = drop({ x: 0, y: 0 }, 40);
    const up = liftOf(b, 0);
    const standing = capSeat({ ...b, lift: up });
    expect(standing.size).toBeLessThan(0.9);
    expect(standing.up).toBeCloseTo(up / 2, 9);
    expect(capSeat({ ...b, lift: liftOf(b, 1) })).toEqual({ size: 1, up: 0 });
  });

  test("leave a splash at the start, widest there and drawn out to nothing along the pull", () => {
    const r = 20;
    expect(splashAt(0, r, 200)).toBeGreaterThan(r * 0.2);
    expect(splashAt(r * 0.5, r, 200)).toBeLessThan(splashAt(0, r, 200));
    expect(splashAt(r * 2, r, 200)).toBe(0);
    // A short pull draws it out no further than part of the way the drop has come.
    expect(splashAt(6, r, 10)).toBe(0);
  });
});
