import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, type SimEvent, startWave, step } from "@neon-spore/sim";
import { type Chart, chartFor } from "../src/fleet-chart.js";
import { FleetGripFx, type FleetRingKind, fleetRingRadius } from "../src/fleet-grip-fx.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, ROLES, runFrames, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLEET's five moments as the one thing about them that outlives a frame
 * (`fleet-grip-fx.ts`): a ring off the holed square, and for four of them the
 * particles beside it. What the wound *is* is read off the world every frame
 * and proved next door in `fleet-grip.test.ts`; this file is about what the
 * pair are shown at the instant it changes.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Layout = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, "p1");
const chart = (): Chart => chartFor(LAYOUT, DEFAULT_CONFIG);

/** A burst pool that remembers what was thrown through it rather than drawing it. */
function pool() {
  const thrown: { x: number; y: number; n: number; hex: string }[] = [];
  return {
    thrown,
    burst: (x: number, y: number, n: number, hex: string) => thrown.push({ x, y, n, hex }),
  };
}

/** One frame of whatever is still running, as its call count and its colours. */
function drawn(fx: FleetGripFx): { calls: number; log: string } {
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  fx.draw(ctx as unknown as CanvasRenderingContext2D, chart());
  return { calls: ctx.calls, log: log.join("|") };
}

/** One event through a fresh transient, with the particles it threw. */
function after(e: SimEvent) {
  const fx = new FleetGripFx();
  const p = pool();
  fx.ingest([e], LAYOUT, p.burst);
  return { fx, thrown: p.thrown };
}

describe("the five moments of the wound", () => {
  it("throw nothing before one of them has happened", () => {
    expect(drawn(new FleetGripFx()).calls).toBe(0);
  });

  it("each throw a ring off the holed square, in a colour of their own", () => {
    const cases: [SimEvent, string][] = [
      [{ type: "fleetFlood", col: 3, row: 4 }, PALETTE.shield],
      [{ type: "fleetBreach", col: 3, row: 4, on: true }, PALETTE.text],
      [{ type: "fleetBreach", col: 3, row: 4, on: false }, PALETTE.dim],
      [{ type: "fleetRake", col: 3, row: 4 }, PALETTE.red],
      [{ type: "fleetPlug", col: 3, row: 4 }, PALETTE.shield],
      [{ type: "fleetWreck", col: 3, row: 4 }, PALETTE.ember],
    ];
    for (const [e, color] of cases) {
      const { fx } = after(e);
      expect(drawn(fx).log).toContain(color);
    }
  });

  it("throw their particles where the square is, and the thumb throws none", () => {
    const opening = after({ type: "fleetFlood", col: 2, row: 5 });
    expect(opening.thrown).toHaveLength(1);
    expect(opening.thrown[0]?.hex).toBe(PALETTE.shieldRim);
    // The wreck is the biggest thing that happens on this chart, and the
    // rake the smallest: the count is the whole of what the ear is not told.
    const wreck = after({ type: "fleetWreck", col: 2, row: 5 }).thrown[0];
    const rake = after({ type: "fleetRake", col: 2, row: 5 }).thrown[0];
    expect(wreck?.n).toBeGreaterThan(rake?.n ?? 0);
    expect(wreck?.x).toBe(rake?.x ?? -1);
    // A thumb is no impact, so it moves no water.
    expect(after({ type: "fleetBreach", col: 2, row: 5, on: true }).thrown).toHaveLength(0);
  });

  it("go out, and the rake goes first because it comes again every beat", () => {
    const { fx } = after({ type: "fleetRake", col: 3, row: 4 });
    const slow = after({ type: "fleetWreck", col: 3, row: 4 }).fx;
    fx.update(0.4);
    slow.update(0.4);
    expect(drawn(fx).calls).toBe(0);
    expect(drawn(slow).calls).toBeGreaterThan(0);
    slow.update(0.4);
    expect(drawn(slow).calls).toBe(0);
  });

  it("are all forgotten on a restart, so none lands on the next run's chart", () => {
    const { fx } = after({ type: "fleetWreck", col: 3, row: 4 });
    expect(drawn(fx).calls).toBeGreaterThan(0);
    fx.clear();
    expect(drawn(fx).calls).toBe(0);
  });
});

describe("which way a ring runs", () => {
  const tile = 40;
  const span = (kind: FleetRingKind) => ({
    start: fleetRingRadius(tile, kind, 0),
    end: fleetRingRadius(tile, kind, 1),
  });

  it("runs outward for the four that open something", () => {
    for (const kind of ["flood", "breach", "rake", "wreck"] as const) {
      const { start, end } = span(kind);
      expect(end).toBeGreaterThan(start);
    }
  });

  it("falls inward for the two that close something, without crossing the middle", () => {
    for (const kind of ["unbreach", "plug"] as const) {
      const { start, end } = span(kind);
      expect(end).toBeLessThan(start);
      expect(end).toBeGreaterThan(0);
    }
  });

  it("makes the wreck the widest of them and the rake the tightest", () => {
    const widest = span("wreck").end;
    for (const kind of ["flood", "breach", "unbreach", "plug", "rake"] as const) {
      expect(span(kind).end).toBeLessThan(widest);
    }
    const tightest = span("rake").end;
    for (const kind of ["flood", "breach", "wreck"] as const) {
      expect(span(kind).end).toBeGreaterThan(tightest);
    }
  });
});

/**
 * The same five, this time through the game rather than through the class:
 * a played wave, the wound opened from the outside on one tick, and the
 * event pushed beside it the way `sim/fleet-hand.ts` pushes it. What this
 * asks is the wiring — that `Effects` hands the batch to this transient
 * (`effects-boss.ts`) and that the boss pass draws it on the chart
 * (`boss-draw.ts`) — which neither the class on its own nor the world on its
 * own can say.
 *
 * The thumb on the plume is the event it is asked with, and deliberately: it
 * is the one of the five that throws no particles, so the only thing that can
 * put another call on this canvas is the ring itself. Any of the other four
 * would pass on its burst alone with the boss pass's line taken out.
 */

/** The tick the hull is holed on, leaving frames after it for the ring to run in. */
const OPENED = 8;

function played(role: ViewRole, pushing: boolean): number {
  const world = createWorld(CFG, 3);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const { ctx } = runFrames(world, role, 12, {
    every: 1,
    onTick: (tick, w) => {
      step(w, []);
      if (tick !== OPENED) return;
      const b = w.boss;
      if (b?.kind !== "fleet") throw new Error("the fleet wave installed no fleet");
      const ship = b.ships[0];
      if (ship === undefined) throw new Error("the fleet stood up with no ships");
      Object.assign(b, {
        phase: "flood",
        phaseBeat: w.beat,
        holed: 0,
        holeCol: ship.col,
        holeRow: ship.row,
        wreckPullMilli: 0,
      });
      if (pushing) w.events.push({ type: "fleetBreach", col: ship.col, row: ship.row, on: true });
    },
  });
  return ctx.calls;
}

describe("on the field", () => {
  for (const role of ROLES) {
    it(`carries the thumb's ring onto ${role}'s chart, and nothing without it`, () => {
      expect(played(role, true)).toBeGreaterThan(played(role, false));
    });
  }
});
