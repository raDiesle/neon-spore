import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { VISE_CRACK_SHEET } from "../src/sprite-burst.js";
import { ViseFx } from "../src/vise-fx.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE VISE's painted kernel crack (`vise-fx.ts`'s `crack`), behind
 * `?raster=1`: the split spawns it, nothing else does, and with no atlas
 * installed it draws nothing — the split as it ships. It plays out on its
 * own sheet's clock and is forgotten on a restart.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
const MID = midCol(DEFAULT_CONFIG);
const ATLAS = {} as CanvasImageSource;
const SPLIT: SimEvent[] = [{ type: "viseSplit", col: MID }];
const LIFE = (VISE_CRACK_SHEET.frames * VISE_CRACK_SHEET.frameMs) / 1000;

function drawn(fx: ViseFx): number {
  const { ctx } = stubCanvas();
  const before = ctx.calls;
  fx.crack.draw(ctx as unknown as CanvasRenderingContext2D);
  return ctx.calls - before;
}

describe("THE VISE's painted crack", () => {
  it("is thrown by the split once an atlas is installed", () => {
    const fx = new ViseFx();
    fx.crack.install(ATLAS);
    fx.ingest(SPLIT, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(1);
  });

  it("is not thrown by a hit or a crack", () => {
    const fx = new ViseFx();
    fx.crack.install(ATLAS);
    const other: SimEvent[] = [
      { type: "viseHit", hits: 3, col: MID },
      { type: "viseCrack", side: 0, cracks: 2, col: MID },
    ];
    fx.ingest(other, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(0);
  });

  it("draws nothing with no atlas — the split as it ships", () => {
    const fx = new ViseFx();
    fx.ingest(SPLIT, L, DEFAULT_CONFIG, 0.5, () => {});
    expect(drawn(fx)).toBe(0);
  });

  it("plays out on its own sheet's clock", () => {
    const fx = new ViseFx();
    fx.crack.install(ATLAS);
    fx.ingest(SPLIT, L, DEFAULT_CONFIG, 0.5, () => {});
    fx.update(LIFE * 0.9);
    expect(drawn(fx)).toBe(1);
    fx.update(LIFE * 0.2);
    expect(drawn(fx)).toBe(0);
  });

  it("is forgotten on a restart, and reached where a host installs it", () => {
    const effects = new Effects();
    effects.boss.vise.crack.install(ATLAS);
    effects.boss.vise.ingest(SPLIT, L, DEFAULT_CONFIG, 0.5, () => {});
    effects.reset();
    expect(drawn(effects.boss.vise)).toBe(0);
  });
});
