import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent } from "@neon-spore/sim";
import { JAB_SHAKE } from "../src/boss-hurt.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { RimeFx } from "../src/rime-fx.js";
import { rimeCentre } from "../src/rime-shape.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

/**
 * What THE RIME leaves behind a frame (`rime-fx.ts`): flakes off a half at
 * every reversal, a half's rim flashing as it comes clear, the film flashing
 * back as it frosts, a core hit's flash wider hit by hit, the refreeze's
 * cracks flashing as a scatter lands, the shatter's, the
 * hull's shudder, and the blow each landing deals. `rime-frame.test.ts` has
 * the poses read off the world; this file has what the events add to them.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const col = midCol(CFG);
const BEAT = 0.5;

interface Thrown {
  x: number;
  n: number;
  hex: string;
}

function said(fx: RimeFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, _y, n, hex) => out.push({ x, n, hex }));
  return out;
}

function settle(fx: RimeFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE RIME's transients", () => {
  it("throws flakes off the half that was rubbed, on its own side, and jabs the pane for it", () => {
    const fx = new RimeFx();
    const at = rimeCentre(L, CFG);
    const [left] = said(fx, [{ type: "rimeShave", side: 0, rimeMilli: 500, col }]);
    const [right] = said(fx, [{ type: "rimeShave", side: 1, rimeMilli: 500, col }]);
    expect(left?.x ?? at.x).toBeLessThan(at.x);
    expect(right?.x ?? at.x).toBeGreaterThan(at.x);
    expect(left?.hex).toBe(PALETTE.rimeFrost);
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
  });

  it("flashes a half's rim as it comes clear, deals the blow, and lets both fade", () => {
    const fx = new RimeFx();
    said(fx, [{ type: "rimeClear", side: 1, wipes: 1, col }]);
    expect(fx.cleared(1)).toBe(1);
    expect(fx.cleared(0)).toBe(0);
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(1);
    settle(fx);
    expect(fx.cleared(1)).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("flashes the film back over a half that frosts, and over both as the lens clouds, dealing nothing", () => {
    const fx = new RimeFx();
    said(fx, [{ type: "rimeFrost", side: 0, col }]);
    expect(fx.film(0)).toBe(1);
    expect(fx.film(1)).toBe(0);
    said(fx, [{ type: "rimeCloud", col }]);
    expect(fx.film(1)).toBe(1);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.film(0) + fx.film(1)).toBe(0);
  });

  it("flashes a core hit in the colour it was told, wider and with more of a burst for every hit", () => {
    const fx = new RimeFx();
    fx.tell(PALETTE.cyan);
    const [one] = said(fx, [{ type: "rimeHit", hits: 1, col }]);
    expect(one?.hex).toBe(PALETTE.cyan);
    expect(fx.flash).toEqual({ now: 1, hits: 1, hex: PALETTE.cyan });
    const [three] = said(fx, [{ type: "rimeHit", hits: 3, col }]);
    expect(three?.n ?? 0).toBeGreaterThan(one?.n ?? 0);
    expect(fx.hurt.value).toBe(1);
    settle(fx);
    expect(fx.flash.now).toBe(0);
    expect(fx.flash.hits).toBe(0);
  });

  it("shudders the plating and flashes the lens as it shatters", () => {
    const fx = new RimeFx();
    said(fx, [{ type: "rimeShatter", col }]);
    expect(fx.shattered).toBe(1);
    expect(fx.shock.now).toBeGreaterThan(0);
    settle(fx);
    expect(fx.shattered).toBe(0);
    expect(fx.shock.now).toBe(0);
  });

  it("flurries frost as the refreeze opens, and flashes its cracks white as a scatter lands, dealing nothing", () => {
    const fx = new RimeFx();
    const [opened] = said(fx, [{ type: "rimeRefreeze", col }]);
    expect(opened?.hex).toBe(PALETTE.rimeFrost);
    expect(fx.scatter).toBe(0);
    const [scattered] = said(fx, [{ type: "rimeScatter", side: 1, col }]);
    expect(scattered?.hex).toBe(PALETTE.hullRim);
    expect(fx.scatter).toBe(1);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.scatter).toBe(0);
  });

  it("says nothing for another boss's events", () => {
    const fx = new RimeFx();
    expect(said(fx, [{ type: "slingHit", hits: 1, col }])).toEqual([]);
    expect(fx.hurt.value).toBe(0);
  });

  it("is quiet again after reset, whatever it was showing", () => {
    const fx = new RimeFx();
    fx.tell(PALETTE.cyanRim);
    said(fx, [
      { type: "rimeClear", side: 0, wipes: 1, col },
      { type: "rimeFrost", side: 1, col },
      { type: "rimeHit", hits: 2, col },
      { type: "rimeScatter", side: 0, col },
      { type: "rimeShatter", col },
    ]);
    fx.reset();
    expect([fx.cleared(0), fx.film(1), fx.flash.now, fx.shattered, fx.scatter]).toEqual([
      0, 0, 0, 0, 0,
    ]);
    expect(fx.flash.hex).toBe(PALETTE.hullRim);
    expect(fx.shock.now).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });
});
