import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimEvent } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PAINTED_STRIPS } from "../src/painted-strips.js";
import { SlingFx } from "../src/sling-fx.js";

/**
 * THE SLING's painted draw (`sling-fx.ts`), behind `?raster=1`: a draw loosed
 * true throws it over the cord that took it, nothing else does, and with no
 * atlas installed it draws nothing — the cord as it ships. The strip is
 * painted for the pilot's cord, so the navigator's is the same strip
 * mirrored. It plays out on its own sheet's clock and is forgotten on a
 * restart.
 */

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
const MID = midCol(DEFAULT_CONFIG);
const ATLAS = {} as CanvasImageSource;
const SHEET = PAINTED_STRIPS["sling-draw"];
const LIFE = (SHEET.frames * SHEET.frameMs) / 1000;
const loose = (side: 0 | 1): SimEvent => ({ type: "slingLoose", side, draws: 1, col: MID });

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

function thrown(fx: SlingFx, events: SimEvent[]): void {
  fx.ingest(events, L, DEFAULT_CONFIG);
}

describe("THE SLING's painted draw", () => {
  it("is thrown by a draw loosed true once an atlas is installed, one per cord", () => {
    const fx = new SlingFx();
    fx.draw.install(ATLAS);
    thrown(fx, [loose(0), loose(1)]);
    const { ctx, said } = recorder();
    fx.draw.draw(ctx);
    expect(said.filter((s) => s === "drawImage")).toHaveLength(2);
  });

  it("is mirrored for the navigator's cord and not for the pilot's", () => {
    const pilot = new SlingFx();
    pilot.draw.install(ATLAS);
    thrown(pilot, [loose(0)]);
    const left = recorder();
    pilot.draw.draw(left.ctx);
    expect(left.said).toContain("drawImage");
    expect(left.said).not.toContain("scale -1 1");

    const navigator = new SlingFx();
    navigator.draw.install(ATLAS);
    thrown(navigator, [loose(1)]);
    const right = recorder();
    navigator.draw.draw(right.ctx);
    expect(right.said).toContain("scale -1 1");
    // Mirrored about its own point, so it sits on the drawn cord either way —
    // and the navigator's cord is the one to the right.
    const size = L.tile * 3;
    expect(right.at[0]).toEqual([-size / 2, -size / 2, size, size].map(Math.round));
    const pilotX = (left.at[0]?.[0] ?? 0) + size / 2;
    const [, navigatorX] = (right.said.find((s) => s.startsWith("translate")) ?? "").split(" ");
    expect(Number(navigatorX)).toBeGreaterThan(pilotX);
  });

  it("is not thrown by a slack cord, a spring, the yoke or a cup hit", () => {
    const fx = new SlingFx();
    fx.draw.install(ATLAS);
    thrown(fx, [
      { type: "slingSlack", side: 0, col: MID },
      { type: "slingSpring", side: 1, col: MID },
      { type: "slingYoke", col: MID },
      { type: "slingHit", hits: 1, col: MID },
    ]);
    const { ctx, said } = recorder();
    fx.draw.draw(ctx);
    expect(said).not.toContain("drawImage");
  });

  it("draws nothing with no atlas — the cord as it ships", () => {
    const fx = new SlingFx();
    thrown(fx, [loose(0)]);
    const { ctx, said } = recorder();
    fx.draw.draw(ctx);
    expect(said).not.toContain("drawImage");
  });

  it("plays out on its own sheet's clock", () => {
    const fx = new SlingFx();
    fx.draw.install(ATLAS);
    thrown(fx, [loose(1)]);
    fx.update(LIFE * 0.9);
    const early = recorder();
    fx.draw.draw(early.ctx);
    expect(early.said).toContain("drawImage");
    fx.update(LIFE * 0.2);
    const late = recorder();
    fx.draw.draw(late.ctx);
    expect(late.said).not.toContain("drawImage");
  });

  it("is forgotten on a restart, and reached where a host installs it", () => {
    const effects = new Effects();
    effects.boss.sling.draw.install(ATLAS);
    thrown(effects.boss.sling, [loose(0)]);
    effects.reset();
    const { ctx, said } = recorder();
    effects.boss.sling.draw.draw(ctx);
    expect(said).not.toContain("drawImage");
  });
});
