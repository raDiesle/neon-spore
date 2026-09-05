import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type Scar, type SimEvent } from "@neon-spore/sim";
import { Arrivals } from "../src/arrivals.js";
import { craters } from "../src/craters.js";
import { ingestBreach } from "../src/effects-breach.js";
import { computeLayout } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { drawScars } from "../src/scars.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * A volley nobody warded arrives as the rock it looks like.
 *
 * `hull.ts` charges it through the same `damageSpan` every warded body goes
 * through and the scar it leaves names `kind: "volley"`, but render used to ask
 * `isMeteorKind` at the three places downstream of that — so the one thing on
 * the field that is unmistakably a rock was drawn hitting the ship as a red
 * burst with no crater and no arrival. All three ask `isWardable` now, and this
 * holds them there: a living body is still answered at the hull the instant the
 * event lands, and a volley is not.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

beforeAll(installCanvasGlobals);

function scarOf(kind: Scar["kind"], col = 4): Scar {
  return { col, beat: 3, kind };
}

function breachOf(kind: Scar["kind"]): Extract<SimEvent, { type: "breach" }> {
  return {
    type: "breach",
    col: 4,
    kind,
    span: 1,
    beat: 3,
    fromRow: CFG.rows - 3,
    color: null,
    damage: 1,
  };
}

describe("a volley's breach", () => {
  it("leaves a crater on the hull, where a living body leaves none", () => {
    const skinAt = () => ({ x: 0, y: L.hullY });
    expect(craters(L, [scarOf("volley")], skinAt)).toHaveLength(1);
    expect(craters(L, [scarOf("slick")], skinAt)).toHaveLength(0);
  });

  it("holds its crack back until the rock has visibly arrived", () => {
    const { ctx } = stubCanvas();
    const surfaceAt = (_x: number) => ({ x: 0, y: L.hullY });
    let drawn = 0;
    const counted = (x: number) => {
      drawn += 1;
      return surfaceAt(x);
    };
    const draw = (kind: Scar["kind"], arrived: boolean) => {
      drawn = 0;
      drawScars(
        ctx as unknown as CanvasRenderingContext2D,
        L,
        [scarOf(kind)],
        0,
        counted,
        surfaceAt,
        [],
        () => arrived,
      );
      return drawn;
    };
    expect(draw("volley", false)).toBe(0);
    expect(draw("volley", true)).toBe(1);
    // The body with no fall replay to wait for is never gated.
    expect(draw("slick", false)).toBe(1);
  });

  it("waits for the fall replay instead of bursting at the hull", () => {
    const bursts: number[] = [];
    const parts = {
      burst: (_x: number, _y: number, n: number) => bursts.push(n),
      rockImpactFx: new RockImpactFx(),
      arrivals: new Arrivals(),
    };
    ingestBreach(breachOf("volley"), L, 0, BEAT_SECONDS, parts);
    expect(bursts).toHaveLength(0);
    ingestBreach(breachOf("slick"), L, 0, BEAT_SECONDS, parts);
    expect(bursts).toHaveLength(1);
  });
});
