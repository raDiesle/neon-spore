import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PAINTED_STRIPS } from "../src/painted-strips.js";
import { TrivetFx } from "../src/trivet-fx.js";

/**
 * THE TRIVET's painted plant (`trivet-fx.ts`), behind `?raster=1`: a plant
 * throws it under the foot that bit, nothing else does, and with no atlas
 * installed it draws nothing — the thud as it ships. The strip is painted for
 * the pilot's foot, so the navigator's is the same strip mirrored. It plays
 * out on its own sheet's clock and is forgotten on a restart.
 */

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
const MID = midCol(DEFAULT_CONFIG);
const ATLAS = {} as CanvasImageSource;
const SHEET = PAINTED_STRIPS["trivet-plant"];
const LIFE = (SHEET.frames * SHEET.frameMs) / 1000;
const plant = (side: 0 | 1): SimEvent => ({ type: "trivetPlant", side, level: 1, col: MID });

/** A context that writes down the calls a sprite burst makes, and nothing else. */
function recorder(): { ctx: CanvasRenderingContext2D; said: string[]; at: number[][] } {
  const said: string[] = [];
  const at: number[][] = [];
  const ctx = {
    save: () => said.push("save"),
    restore: () => said.push("restore"),
    translate: (x: number, y: number) => said.push(`translate ${Math.round(x)} ${Math.round(y)}`),
    scale: (x: number, y: number) => said.push(`scale ${x} ${y}`),
    drawImage: (...args: unknown[]) => {
      said.push("drawImage");
      at.push((args.slice(5) as number[]).map(Math.round));
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, said, at };
}

function thrown(fx: TrivetFx, events: SimEvent[]): void {
  fx.ingest(events, L, DEFAULT_CONFIG, 0.5, () => {});
}

describe("THE TRIVET's painted plant", () => {
  it("is thrown by a plant once an atlas is installed, one per foot", () => {
    const fx = new TrivetFx();
    fx.plant.install(ATLAS);
    thrown(fx, [plant(0), plant(1)]);
    const { ctx, said } = recorder();
    fx.plant.draw(ctx);
    expect(said.filter((s) => s === "drawImage")).toHaveLength(2);
  });

  it("is mirrored for the navigator's foot and not for the pilot's", () => {
    const pilot = new TrivetFx();
    pilot.plant.install(ATLAS);
    thrown(pilot, [plant(0)]);
    const left = recorder();
    pilot.plant.draw(left.ctx);
    expect(left.said).toContain("drawImage");
    expect(left.said).not.toContain("scale -1 1");

    const navigator = new TrivetFx();
    navigator.plant.install(ATLAS);
    thrown(navigator, [plant(1)]);
    const right = recorder();
    navigator.plant.draw(right.ctx);
    expect(right.said).toContain("scale -1 1");
    // Mirrored about its own point, so it is centred on the foot either way —
    // and the navigator's foot is the one to the right.
    const size = L.tile * 2.6;
    expect(right.at[0]).toEqual([-size / 2, -size / 2, size, size].map(Math.round));
    const pilotX = (left.at[0]?.[0] ?? 0) + size / 2;
    const [, navigatorX] = (right.said.find((s) => s.startsWith("translate")) ?? "").split(" ");
    expect(Number(navigatorX)).toBeGreaterThan(pilotX);
  });

  it("is not thrown by a slip, a spring, the brace or a hub hit", () => {
    const fx = new TrivetFx();
    fx.plant.install(ATLAS);
    thrown(fx, [
      { type: "trivetSlip", side: 0, col: MID },
      { type: "trivetSpring", side: 1, col: MID },
      { type: "trivetBrace", col: MID },
      { type: "trivetHit", hits: 1, col: MID },
    ]);
    const { ctx, said } = recorder();
    fx.plant.draw(ctx);
    expect(said).not.toContain("drawImage");
  });

  it("draws nothing with no atlas — the thud as it ships", () => {
    const fx = new TrivetFx();
    thrown(fx, [plant(0)]);
    const { ctx, said } = recorder();
    fx.plant.draw(ctx);
    expect(said).not.toContain("drawImage");
  });

  it("plays out on its own sheet's clock", () => {
    const fx = new TrivetFx();
    fx.plant.install(ATLAS);
    thrown(fx, [plant(1)]);
    fx.update(LIFE * 0.9);
    const early = recorder();
    fx.plant.draw(early.ctx);
    expect(early.said).toContain("drawImage");
    fx.update(LIFE * 0.2);
    const late = recorder();
    fx.plant.draw(late.ctx);
    expect(late.said).not.toContain("drawImage");
  });

  it("is forgotten on a restart, and reached where a host installs it", () => {
    const effects = new Effects();
    effects.boss.trivet.plant.install(ATLAS);
    thrown(effects.boss.trivet, [plant(0)]);
    effects.reset();
    const { ctx, said } = recorder();
    effects.boss.trivet.plant.draw(ctx);
    expect(said).not.toContain("drawImage");
  });
});
