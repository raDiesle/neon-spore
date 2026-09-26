import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type BossKind, DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { Arrivals } from "../src/arrivals.js";
import { BossStrikeFx } from "../src/boss-strike-fx.js";
import { ingestBreach } from "../src/effects-breach.js";
import { computeLayout } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A breach that names its boss is that boss's blow, never a rock replayed
 * falling from the top of the field (`boss-strike-fx.ts`, the owner's rule of
 * 26 September 2026). The crack and the sparks wait for the blow to land, as
 * they waited for the rock.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

beforeAll(installCanvasGlobals);

function breachBy(by: BossKind | undefined): Extract<SimEvent, { type: "breach" }> {
  return {
    type: "breach",
    col: 4,
    kind: "meteorFastest",
    span: 1,
    beat: 3,
    fromRow: 0,
    seed: 0,
    holes: 0,
    color: null,
    weight: "heavy",
    ...(by ? { by } : {}),
  };
}

function ingest(by: BossKind | undefined) {
  const parts = {
    bursts: 0,
    burst: () => {
      parts.bursts += 1;
    },
    rockImpactFx: new RockImpactFx(),
    arrivals: new Arrivals(),
    bossStrike: new BossStrikeFx(),
  };
  ingestBreach(breachBy(by), L, 0, BEAT_SECONDS, parts);
  return parts;
}

describe("a boss's blow at the hull", () => {
  it("is held by the blow, and no rock falls", () => {
    const parts = ingest("oculus");
    expect(parts.bossStrike.active).toBe(1);
    expect(parts.rockImpactFx.coversCrater(L.gridLeft + 4.5 * L.tile, L.tile)).toBe(false);
  });

  it("lands before its crack and its sparks show", () => {
    const parts = ingest("hasp");
    expect(parts.arrivals.has(4, 3)).toBe(false);
    expect(parts.bursts).toBe(0);
    parts.bossStrike.update(0.05, L);
    expect(parts.arrivals.has(4, 3)).toBe(false);
    parts.bossStrike.update(0.3, L);
    expect(parts.arrivals.has(4, 3)).toBe(true);
    expect(parts.bursts).toBeGreaterThan(0);
    parts.bossStrike.update(1, L);
    expect(parts.bossStrike.active).toBe(0);
  });

  it("a breach with no boss on it is still the rock", () => {
    const parts = ingest(undefined);
    expect(parts.bossStrike.active).toBe(0);
  });

  it("draws for every boss, out and back, on a canvas that takes it", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    for (const by of ["oculus", "hasp", "stare", "ledger", "gimbal", "seam"] as const) {
      const fx = new BossStrikeFx();
      fx.spawn(by, 4, BEAT_SECONDS, () => {});
      const before = ctx.calls;
      for (let i = 0; i < 12; i++) {
        fx.draw(c, L, CFG, () => L.hullY, i / 20);
        fx.update(1 / 20, L);
      }
      expect(ctx.calls).toBeGreaterThan(before);
    }
  });

  it("THE INSTAR's blow is its own part's picture, and still lands its crack", () => {
    const { ctx } = stubCanvas();
    const c = ctx as unknown as CanvasRenderingContext2D;
    const parts = ingest("instar");
    expect(parts.bossStrike.active).toBe(1);
    const before = ctx.calls;
    parts.bossStrike.draw(c, L, CFG, () => L.hullY, 0);
    expect(ctx.calls - before).toBeLessThan(4);
    parts.bossStrike.update(0.4, L);
    expect(parts.arrivals.has(4, 3)).toBe(true);
  });

  it("forgets every blow on a restart", () => {
    const fx = new BossStrikeFx();
    fx.spawn("oculus", 4, BEAT_SECONDS, () => {});
    fx.clear();
    expect(fx.active).toBe(0);
  });
});
