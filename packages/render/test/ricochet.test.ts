import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { beatSeconds, type SimEvent } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { RicochetFx } from "../src/ricochet.js";
import { ShotOutFx } from "../src/shot-out.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A wasted shot on HARD glances off the top and lands on the hull, and it
 * lands before the field stops holding the fail** — a hit the lost screen
 * covered would be a rule with no picture (`ricochet.ts`).
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "p1");
const HARD = { ...CFG, bpm: 120, wastedShotFails: true };
const WASTED: SimEvent = {
  type: "shotOut",
  col: 1,
  driftMilli: 0,
  atMilli: -80,
  color: "red",
  taken: false,
  wasted: true,
};

function drawCalls(fx: RicochetFx | ShotOutFx): number {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  if (fx instanceof RicochetFx) fx.draw(c, L, () => L.hullY);
  else fx.draw(c, L);
  return ctx.calls;
}

interface Hit {
  x: number;
  y: number;
  at: number;
}

function fly(fx: RicochetFx, seconds: number): Hit[] {
  const bursts: Hit[] = [];
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) fx.update(dt, (x, y) => bursts.push({ x, y, at: t + dt }));
  return bursts;
}

describe("a wasted shot's ricochet", () => {
  it("is drawn from the frame it leaves the field, and not by the fly-out as well", () => {
    const fx = new RicochetFx();
    fx.ingest([WASTED], L, HARD, false);
    expect(drawCalls(fx)).toBeGreaterThan(0);
    const out = new ShotOutFx();
    out.ingest([WASTED], HARD, false);
    expect(drawCalls(out)).toBe(0);
  });

  it("turns at the top, lands on the hull toward the middle, and has flashed and gone inside the hold", () => {
    const fx = new RicochetFx();
    fx.ingest([WASTED], L, HARD, false);
    const hold = HARD.waveFailBeats * beatSeconds(HARD);
    const bursts = fly(fx, hold * 0.66);
    // Landed, and the flash on the hull is up.
    expect(drawCalls(fx)).toBeGreaterThan(0);
    bursts.push(...fly(fx, hold * 0.34));
    const turn = bursts[0];
    const land = bursts[bursts.length - 1];
    if (!turn || !land) throw new Error("no bursts");
    expect(turn.y).toBeLessThan(L.tile);
    expect(land.y).toBe(L.hullY);
    // Column 1 is left of the middle: it comes down to the right of it.
    expect(land.x).toBeGreaterThan(turn.x + L.tile);
    expect(land.at).toBeLessThan(hold);
    expect(drawCalls(fx)).toBe(0);
  });

  it("is not flown for a shot that was not wasted, nor on THE WELL", () => {
    const kept = new RicochetFx();
    kept.ingest([{ ...WASTED, wasted: false }], L, HARD, false);
    expect(drawCalls(kept)).toBe(0);
    const well = new RicochetFx();
    well.ingest([WASTED], L, HARD, true);
    expect(drawCalls(well)).toBe(0);
  });
});
