import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import type { BossSequenceStep } from "@neon-spore/sim";
import { InstarFx } from "../src/instar-fx.js";
import { drawFrontHead } from "../src/instar-head.js";
import type { Look } from "../src/instar-plate.js";
import { POSES } from "../src/instar-poses.js";
import { deformed, instarHeadAt } from "../src/instar-shape.js";
import { LipShove } from "../src/instar-shove.js";
import { computeLayout } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, VIEWPORT } from "./frame-harness.js";

/**
 * **A shoved lip trembles** (`instar-shove.ts`, `instar-head.ts`): the jaw
 * pushing back against a thumb on a beat of the second or third bite is
 * seen on the lip that thumb holds, twice as hard at the third's push, and
 * gone before the next — a beat under THE SLOW is nearly two seconds long.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

/** The bite of the breath that pushes back by `pushMilli`. */
function bite(pushMilli: number): BossSequenceStep {
  const step = INSTAR_SCRIPT.find((s) => s.pose === "breath" && s.pushMilli === pushMilli);
  if (step === undefined) throw new Error(`the breath has no bite pushing ${pushMilli}`);
  return step;
}

/** The third bite: the upper jaw, the fire, the lower jaw. */
const THIRD = bite(500);
const SECOND = bite(250);

describe("THE INSTAR's lips under a shove", () => {
  it("tremble on the lip whose thumb was shoved, and not on the fire", () => {
    const lips = new LipShove();
    lips.place(THIRD);
    lips.hit(1, THIRD.pushMilli ?? 0);
    expect([lips.up, lips.down]).toEqual([0, 0]);
    lips.hit(0, THIRD.pushMilli ?? 0);
    expect([lips.up, lips.down]).toEqual([1, 0]);
    lips.hit(2, THIRD.pushMilli ?? 0);
    expect(lips.down).toBe(1);
  });

  it("tremble half as hard at the second bite's push as at the third's", () => {
    const lips = new LipShove();
    lips.place(SECOND);
    lips.hit(0, SECOND.pushMilli ?? 0);
    expect(lips.up).toBeCloseTo(0.5, 5);
  });

  it("are still again two seconds on, and forgotten on clear", () => {
    const lips = new LipShove();
    lips.place(THIRD);
    lips.hit(0, THIRD.pushMilli ?? 0);
    lips.update(1 / 60);
    expect(lips.up).toBeGreaterThan(0.8);
    for (let i = 0; i < 120; i++) lips.update(1 / 60);
    expect(lips.up).toBe(0);
    lips.hit(2, THIRD.pushMilli ?? 0);
    lips.clear();
    expect(lips.down).toBe(0);
  });

  it("reach the tremble through the body's own effects", () => {
    const fx = new InstarFx();
    fx.shove.place(THIRD);
    fx.ingest([{ type: "instarShove", mark: 0, part: "jaw", pushMilli: 500, col: 3 }], L, () => {});
    expect(fx.shove.up).toBe(1);
    fx.clear();
    expect(fx.shove.up).toBe(0);
  });

  it("move the drawn head, and only while shoved", () => {
    const f = deformed(POSES.breath, THIRD.marks, () => 0);
    const { head, r } = instarHeadAt(L, f);
    const drawn = (shoveUp: number, shoveDown: number): string => {
      const { ctx } = stubCanvas();
      const log: string[] = [];
      ctx.log = log;
      const look: Look = {
        f,
        head,
        r,
        time: 1.25,
        fade: 1,
        hurt: 0,
        threat: 0.5,
        fire: 1,
        harden: 0,
        shoveUp,
        shoveDown,
      };
      drawFrontHead(ctx as unknown as CanvasRenderingContext2D, look);
      return log.join("|");
    };
    const still = drawn(0, 0);
    expect(drawn(0, 0)).toBe(still);
    expect(drawn(1, 0)).not.toBe(still);
    expect(drawn(0, 1)).not.toBe(still);
  });
});
