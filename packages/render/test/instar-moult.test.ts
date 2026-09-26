import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { step } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { InstarFx } from "../src/instar-fx.js";
import { instarFigure } from "../src/instar-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import { acting, hung } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE INSTAR's moult (`instar-moult.ts`): the hide split along the back on a
 * pale body, each seat's swipes peeling its own half off it, and — left
 * undone — the strike setting the split dark and whole until the next morph.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MOULT = INSTAR_SCRIPT.findIndex((s) => s.pose === "moult");
const COIL = INSTAR_SCRIPT.findIndex((s) => s.pose === "coil");
/** The pale body's colour at any alpha, as the canvas is handed it. */
const PALE = rgba(PALETTE.sheenRim, 0.5).replace(/[\d.]+\)$/, "");

describe("THE INSTAR's moult", () => {
  it("splits the back and peels each half by its own seat's swipes", () => {
    const world = hung();
    const s = acting(world, MOULT);
    const at = () => instarFigure(s, world.beat, 0);
    expect(at().split).toBe(1);
    expect([at().shedNear, at().shedFar]).toEqual([0, 0]);
    const marks = INSTAR_SCRIPT[MOULT]?.marks ?? [];
    const near = marks.findIndex((m) => m.xMilli < 500);
    expect(marks[near]?.seat).toBe("p1");
    s.progress[near] = (marks[near]?.need ?? 0) / 2;
    expect(at().shedNear).toBe(0.5);
    expect(at().shedFar).toBe(0);
  });

  it("draws the pale body in the split on the moult and on no other pose", () => {
    const pale = (cursor: number): number => {
      const world = hung();
      acting(world, cursor);
      const log: string[] = [];
      runFrames(world, "p1", 2, {
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (_, w) => step(w, []),
      });
      return log.join("|").split(PALE).length - 1;
    };
    expect(pale(MOULT)).toBeGreaterThan(pale(COIL));
  });

  it("hardens the split on a strike and keeps it set until the next morph", () => {
    const fx = new InstarFx();
    expect(fx.strike.harden).toBe(0);
    fx.ingest([{ type: "instarStrike", part: "hide", col: 4 }], L, () => {});
    for (let i = 0; i < 60; i++) fx.update(1 / 30);
    expect(fx.strike.active).toBe(false);
    expect(fx.strike.harden).toBe(1);
    fx.ingest([{ type: "instarMorph", step: 0, pose: "moult", col: 4 }], L, () => {});
    expect(fx.strike.harden).toBe(0);
    fx.ingest([{ type: "instarStrike", part: "hide", col: 4 }], L, () => {});
    fx.update(1 / 30);
    expect(fx.strike.harden).toBeGreaterThan(0);
    fx.clear();
    expect(fx.strike.harden).toBe(0);
  });
});
