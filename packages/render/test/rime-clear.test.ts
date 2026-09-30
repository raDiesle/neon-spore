import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PAINTED_STRIPS } from "../src/painted-strips.js";
import { RimeFx } from "../src/rime-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE RIME's painted clearing (`rime-fx.ts`), behind `?raster=1`: the bare
 * core throws it, nothing else does, and with no atlas installed it draws
 * nothing — the reveal as it ships. It plays out on its own sheet's clock
 * and is forgotten on a restart.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
const MID = midCol(DEFAULT_CONFIG);
const ATLAS = {} as CanvasImageSource;
const BARE: SimEvent[] = [{ type: "rimeBare", col: MID }];
const SHEET = PAINTED_STRIPS["rime-clear"];
const LIFE = (SHEET.frames * SHEET.frameMs) / 1000;

function drawn(fx: RimeFx): number {
  const { ctx } = stubCanvas();
  const before = ctx.calls;
  fx.clear.draw(ctx as unknown as CanvasRenderingContext2D);
  return ctx.calls - before;
}

describe("THE RIME's painted clearing", () => {
  it("is thrown by the bare core once an atlas is installed", () => {
    const fx = new RimeFx();
    fx.clear.install(ATLAS);
    fx.ingest(BARE, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(1);
  });

  it("is not thrown by a wipe, a hit or the shatter", () => {
    const fx = new RimeFx();
    fx.clear.install(ATLAS);
    const other: SimEvent[] = [
      { type: "rimeClear", side: 0, wipes: 2, col: MID },
      { type: "rimeHit", hits: 1, col: MID },
      { type: "rimeShatter", col: MID },
    ];
    fx.ingest(other, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(0);
  });

  it("draws nothing with no atlas — the reveal as it ships", () => {
    const fx = new RimeFx();
    fx.ingest(BARE, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(0);
  });

  it("plays out on its own sheet's clock", () => {
    const fx = new RimeFx();
    fx.clear.install(ATLAS);
    fx.ingest(BARE, L, DEFAULT_CONFIG, 0.5, () => {});
    fx.update(LIFE * 0.9);
    expect(drawn(fx)).toBe(1);
    fx.update(LIFE * 0.2);
    expect(drawn(fx)).toBe(0);
  });

  it("is forgotten on a restart, and reached where a host installs it", () => {
    const effects = new Effects();
    effects.boss.rime.clear.install(ATLAS);
    effects.boss.rime.ingest(BARE, L, DEFAULT_CONFIG, 0.5, () => {});
    effects.reset();
    expect(drawn(effects.boss.rime)).toBe(0);
  });
});
