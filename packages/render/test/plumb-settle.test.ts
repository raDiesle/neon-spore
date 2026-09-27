import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PAINTED_STRIPS } from "../src/painted-strips.js";
import { PlumbFx } from "../src/plumb-fx.js";

/**
 * THE PLUMB's painted settle (`plumb-fx.ts`), behind `?raster=1`: a weight
 * settling true throws it, nothing else does, and with no atlas installed it
 * draws nothing — the settle as it ships. It is hung from the beam's end, so
 * each side's is drawn only from its own chain (`plumb-draw.ts` translates
 * there first), and the navigator's is the pilot's strip mirrored. It plays
 * out on its own sheet's clock and is forgotten on a restart.
 */

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
const MID = midCol(DEFAULT_CONFIG);
const ATLAS = {} as CanvasImageSource;
const SHEET = PAINTED_STRIPS["plumb-settle"];
const LIFE = (SHEET.frames * SHEET.frameMs) / 1000;
const settle = (side: 0 | 1): SimEvent => ({ type: "plumbSettle", side, level: 1, col: MID });

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

function thrown(fx: PlumbFx, events: SimEvent[]): void {
  fx.ingest(events, L, DEFAULT_CONFIG, () => {});
}

function draws(fx: PlumbFx, side: 0 | 1): ReturnType<typeof recorder> {
  const r = recorder();
  fx.swing.draw(r.ctx, side);
  return r;
}

describe("THE PLUMB's painted settle", () => {
  it("is thrown by a settle once an atlas is installed, under that side's chain only", () => {
    const fx = new PlumbFx();
    fx.swing.install(ATLAS);
    thrown(fx, [settle(0)]);
    expect(draws(fx, 0).said).toContain("drawImage");
    expect(draws(fx, 1).said).not.toContain("drawImage");
  });

  it("hangs below the beam's end, and is mirrored for the navigator's weight", () => {
    const fx = new PlumbFx();
    fx.swing.install(ATLAS);
    thrown(fx, [settle(0), settle(1)]);
    const size = L.tile * 3;
    const pilot = draws(fx, 0);
    expect(pilot.said).not.toContain("scale -1 1");
    // Centred on the chain's line, its middle below the hook.
    expect(pilot.at[0]).toEqual([-size / 2, size * 0.4 - size / 2, size, size].map(Math.round));
    const navigator = draws(fx, 1);
    expect(navigator.said).toContain("scale -1 1");
    expect(navigator.said).toContain(`translate 0 ${Math.round(size * 0.4)}`);
  });

  it("is not thrown by a drift, a swing run out, a hit or the free release", () => {
    const fx = new PlumbFx();
    fx.swing.install(ATLAS);
    thrown(fx, [
      { type: "plumbDrift", side: 0, col: MID },
      { type: "plumbSwing", side: 1, col: MID },
      { type: "plumbHit", hits: 1, col: MID },
      { type: "plumbFree", col: MID },
    ]);
    expect(draws(fx, 0).said).not.toContain("drawImage");
    expect(draws(fx, 1).said).not.toContain("drawImage");
  });

  it("draws nothing with no atlas — the settle as it ships", () => {
    const fx = new PlumbFx();
    thrown(fx, [settle(0)]);
    expect(draws(fx, 0).said).not.toContain("drawImage");
  });

  it("plays out on its own sheet's clock", () => {
    const fx = new PlumbFx();
    fx.swing.install(ATLAS);
    thrown(fx, [settle(1)]);
    fx.update(LIFE * 0.9);
    expect(draws(fx, 1).said).toContain("drawImage");
    fx.update(LIFE * 0.2);
    expect(draws(fx, 1).said).not.toContain("drawImage");
  });

  it("is forgotten on a restart, and reached where a host installs it", () => {
    const effects = new Effects();
    effects.boss.plumb.swing.install(ATLAS);
    thrown(effects.boss.plumb, [settle(0)]);
    effects.reset();
    expect(draws(effects.boss.plumb, 0).said).not.toContain("drawImage");
  });
});
