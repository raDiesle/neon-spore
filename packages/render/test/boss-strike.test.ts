import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type BossKind, DEFAULT_CONFIG, type SimEvent } from "@neon-spore/sim";
import { Arrivals } from "../src/arrivals.js";
import { strikeFrom } from "../src/boss-strike-from.js";
import { BossStrikeFx } from "../src/boss-strike-fx.js";
import { lash, type StrikeFrame, type StrikeLook, strikeLook } from "../src/boss-strike-look.js";
import { burgeeSpindleAt } from "../src/burgee-shape.js";
import { capstanCentre } from "../src/capstan-shape.js";
import { cystCentre } from "../src/cyst-shape.js";
import { ingestBreach } from "../src/effects-breach.js";
import { flueCentre } from "../src/flue-shape.js";
import { gallRootAt } from "../src/gall-shape.js";
import { grindstoneCentre } from "../src/grindstone-shape.js";
import { halterCentre } from "../src/halter-shape.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { slingCentre } from "../src/sling-shape.js";
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
    const bosses = [
      ...["oculus", "hasp", "stare", "ledger", "gimbal", "seam", "mantle"],
      ...["ratchet", "valve", "vise", "rime", "trivet", "plumb", "davit", "halter"],
      ...["capstan", "gall", "burgee", "cyst", "grindstone", "sling", "flue", "filament"],
    ] as const;
    for (const by of bosses) {
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

  it("THE FILAMENT's blow leaves the line at the tile it struck from", () => {
    const from = strikeFrom(L, CFG, "filament", 4, 6);
    expect(from).toEqual({ x: tileCX(L, 4), y: tileCY(L, 6) });
    expect(strikeLook("filament")).not.toBe(lash);
    // And the row rides the event through to the blow, not row 0.
    const { ctx } = stubCanvas();
    const fx = new BossStrikeFx();
    fx.spawn("filament", 4, BEAT_SECONDS, () => {}, undefined, 6);
    const moves: number[] = [];
    const spy = new Proxy(ctx, {
      get(t, k) {
        if (k === "moveTo") return (x: number, y: number) => moves.push(y) && t.moveTo(x, y);
        const v = Reflect.get(t, k);
        return typeof v === "function" ? v.bind(t) : v;
      },
    }) as unknown as CanvasRenderingContext2D;
    fx.update(0.05, L);
    fx.draw(spy, L, CFG, () => L.hullY, 0);
    expect(moves[0]).toBe(tileCY(L, 6));
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

  it.each([
    ["THE HALTER sheds a plate from under its centre", "halter", halterCentre],
    ["THE CAPSTAN throws a cog off its cradle's foot", "capstan", capstanCentre],
    ["THE GALL drops a seed off its root's underside", "gall", gallRootAt],
    ["THE BURGEE tears a scrap off its flag's fly", "burgee", burgeeSpindleAt],
    ["THE CYST spits a spore out of its bottom lobe", "cyst", cystCentre],
    ["THE GRINDSTONE throws a chip off its wheel", "grindstone", grindstoneCentre],
    ["THE SLING flings a ball out of its cup", "sling", slingCentre],
    ["THE FLUE coughs a cinder out of its flue", "flue", flueCentre],
  ] as const)("%s that bites the skin at reach 1", (_name, by, centreOf) => {
    const from = strikeFrom(L, CFG, by);
    const centre = centreOf(L, CFG);
    expect(from.x).toBe(centre.x);
    expect(from.y).toBeGreaterThan(centre.y);
    const to = { x: from.x, y: L.hullY };
    const frame = { l: L, blow: undefined, from, to, tile: L.tile, time: 0, after: 0 };
    const look = strikeLook(by);
    expect(look).not.toBe(lash);
    expect(firstTranslate(look, { ...frame, reach: 0 })).toEqual(from);
    expect(firstTranslate(look, { ...frame, reach: 1 })).toEqual(to);
  });

  it("forgets every blow on a restart", () => {
    const fx = new BossStrikeFx();
    fx.spawn("oculus", 4, BEAT_SECONDS, () => {});
    fx.clear();
    expect(fx.active).toBe(0);
  });
});

/** Where a look first moves the canvas to: the piece it throws, drawn round its own middle. */
function firstTranslate(
  look: StrikeLook,
  frame: StrikeFrame,
): { x: number; y: number } | undefined {
  const { ctx } = stubCanvas();
  const at: { x: number; y: number }[] = [];
  const spy = new Proxy(ctx, {
    get(t, k) {
      if (k === "translate")
        return (x: number, y: number) => {
          at.push({ x, y });
          t.translate(x, y);
        };
      const v = Reflect.get(t, k);
      return typeof v === "function" ? v.bind(t) : v;
    },
  }) as unknown as CanvasRenderingContext2D;
  look(spy, frame);
  return at[0];
}
