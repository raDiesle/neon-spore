import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type SimEvent, startWave, ticksPerBeat, type World } from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type Layout, tileCX, tileCY, type ViewRole } from "../src/layout.js";
import {
  showsWell,
  wellAngle,
  wellAt,
  wellFromFlat,
  wellHub,
  wellPlace,
  wellRadius,
  wellRim,
  wellSectorAngle,
  wellSectors,
  wellShown,
} from "../src/well.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  thirdOf,
  waveWith,
} from "./frame-harness.js";

// The cap this file runs under; asked for here because bun applies it to the
// file the call is in (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE WELL, drawn: the clock face, the bodies coming in down their hours, the
 * ship as a ring at the middle — and, on the other phone, the flat field it is
 * a picture of.
 *
 * Two halves, and neither can say whether the thing *reads*. The first is the
 * projection as arithmetic: the hours a column lands on, the sector left empty
 * where the field's two walls meet, the rings getting further apart as they near
 * the ship, and the disc fitting inside the field it replaces. Those are the
 * numbers a pair says out loud, so they are worth pinning to the digit.
 *
 * The second is the whole wave through a canvas that refuses what a real one
 * refuses, on all three seats — because every draw in `well-draw.ts` is new
 * geometry reaching `arc`, `rotate` and `fillText`, and a NaN radius throws
 * where a wrong one merely looks wrong. What an eye still owes: whether eleven
 * lanes are countable at a glance, whether a body at the rim is nameable, and
 * whether the seam reads as a wall. Those are in `docs/queue.md`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const WELL = waveWith("well");
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const FLAT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");

function wellWorld(): World {
  const world = createWorld(CFG, 4);
  startWave(world, WELL, buildQueue(WELL, CFG.cols), [], buildBoss(WELL, CFG.cols));
  return world;
}

/** Straight up, as this file reads angles: clockwise from twelve. */
const UP = 0;

describe("the well's projection", () => {
  it("spreads the columns over the hours and leaves one sector for the seam", () => {
    expect(wellSectors(L)).toBe(CFG.cols + 1);
    // Eleven columns and twelve sectors: the shipped field's whole coincidence,
    // and the reason a pair may say either word. Column four is four o'clock.
    expect(wellSectors(L)).toBe(12);
    expect(wellAngle(L, 3)).toBeCloseTo((4 * 2 * Math.PI) / 12, 10);
    expect(wellAngle(L, 0)).toBeCloseTo(wellSectorAngle(L), 10);
    expect(wellAngle(L, CFG.cols - 1)).toBeCloseTo(2 * Math.PI - wellSectorAngle(L), 10);
  });

  it("leaves twelve o'clock empty — no column comes within half a sector of it", () => {
    const half = wellSectorAngle(L) / 2;
    for (let col = 0; col < CFG.cols; col++) {
      const a = wellAngle(L, col);
      // The distance from straight up, the short way round.
      const off = Math.min(Math.abs(a - UP), Math.abs(2 * Math.PI - a));
      expect(off, `column ${col} stands in the seam`).toBeGreaterThanOrEqual(half - 1e-9);
    }
  });

  it("brings a body inward, from the rim at row nought to the hull at the hub", () => {
    expect(wellRadius(L, 0)).toBeCloseTo(wellRim(L), 10);
    expect(wellRadius(L, CFG.rows - 1)).toBeCloseTo(wellHub(L), 10);
    for (let row = 1; row < CFG.rows; row++) {
      expect(wellRadius(L, row), `row ${row}`).toBeLessThan(wellRadius(L, row - 1));
    }
  });

  it("gives the rows near the ship more room than the rows at the rim", () => {
    // The whole of `BEND`: fifteen rows will not fit round a phone evenly, so
    // the near ones — where a pair is timing a ward — take most of the radius.
    const near = wellRadius(L, CFG.rows - 5) - wellRadius(L, CFG.rows - 1);
    const far = wellRadius(L, 0) - wellRadius(L, 4);
    expect(near).toBeGreaterThan(far * 2);
  });

  it("keeps the whole clock inside the field it is drawn in place of", () => {
    for (let col = 0; col < CFG.cols; col++) {
      for (const row of [0, CFG.rows - 1]) {
        const at = wellPlace(L, col, row);
        expect(at.x, `column ${col} row ${row}`).toBeGreaterThanOrEqual(L.gridLeft);
        expect(at.x).toBeLessThanOrEqual(L.gridLeft + L.gridWidth);
        expect(at.y).toBeGreaterThanOrEqual(L.gridTop);
        expect(at.y).toBeLessThanOrEqual(L.gridTop + L.gridHeight);
      }
    }
  });

  it("takes a point off the flat field to the same place the lane would", () => {
    // `wellFromFlat` is what puts a kill's sparks in the lane the body died in
    // (`effects.ts`). It is the forward projection composed with the flat
    // field's own inverse, so a tile centre has to come back exactly.
    for (const [col, row] of [
      [0, 0],
      [5, 7],
      [10, CFG.rows - 1],
    ] as const) {
      const there = wellFromFlat(L, tileCX(L, col), tileCY(L, row));
      const lane = wellPlace(L, col, row);
      expect(there.x).toBeCloseTo(lane.x, 6);
      expect(there.y).toBeCloseTo(lane.y, 6);
    }
  });

  it("is one screen of the two: the pilot's clock, the navigator's field", () => {
    expect(showsWell("p1")).toBe(true);
    expect(showsWell("test")).toBe(true);
    expect(showsWell("p2")).toBe(false);
    const world = wellWorld();
    expect(wellShown(L, world)).toBe(true);
    expect(wellShown(FLAT, world)).toBe(false);
  });

  it("puts the hub inside the rim, with room for a body in the narrowest lane", () => {
    expect(wellHub(L)).toBeGreaterThan(0);
    expect(wellHub(L)).toBeLessThan(wellRim(L));
    // A sector at the hub is the tightest lane on the picture. `WELL_BODY` is
    // sized against it, so it has to stay wider than a body is drawn.
    const lane = wellSectorAngle(L) * wellHub(L);
    expect(lane, "the hub's lane is narrower than a body").toBeGreaterThan(L.tile * 0.6);
  });

  it("places a point at the angle and radius it was asked for", () => {
    const at = wellAt(L, UP, wellRim(L));
    expect(at.x).toBeCloseTo(L.gridLeft + L.gridWidth / 2, 6);
    expect(at.y).toBeCloseTo(L.gridTop + L.gridHeight / 2 - wellRim(L), 6);
  });
});

describe("the well, played", () => {
  for (const [i, role] of ROLES.entries()) {
    it(`draws every frame of the wave as ${role} through a real canvas`, () => {
      const { ctx, world } = runFrames(wellWorld(), role as ViewRole, TPB * 40, {
        ...thirdOf(4, i),
      });
      expect(ctx.calls, "nothing was drawn").toBeGreaterThan(0);
      expect(world.boss?.kind).toBe("well");
    });
  }

  it("draws a different picture on the two phones", () => {
    const seen = new Map<string, number>();
    for (const role of ["p1", "p2"] as ViewRole[]) {
      const { ctx } = runFrames(wellWorld(), role, TPB * 8, { every: 4 });
      seen.set(role, ctx.calls);
    }
    expect(seen.get("p1")).not.toBe(seen.get("p2"));
  });
});

/**
 * Where `Effects` put every spark it holds, read back off a canvas that keeps
 * nothing but the squares: a spark is a 3 × 3 `fillRect` around its point
 * (`sparks.ts`), so the rect's corner plus one and a half is the spark.
 */
function sparksOf(fx: Effects): { x: number; y: number }[] {
  const at: { x: number; y: number }[] = [];
  const ctx = {
    globalAlpha: 1,
    fillStyle: "",
    fillRect: (x: number, y: number) => at.push({ x: x + 1.5, y: y + 1.5 }),
  } as unknown as CanvasRenderingContext2D;
  fx.sparks.draw(ctx);
  return at;
}

function ingest(events: SimEvent[], l: Layout, well: boolean): Effects {
  const fx = new Effects();
  fx.ingest(events, l, 0, () => 0, CFG, well);
  return fx;
}

describe("the well's transients", () => {
  const killed: SimEvent = { type: "destroy", col: 4, row: 5, color: "red", kind: "slick" };

  it("throws a kill's burst from the lane the body died in, not from the flat tile", () => {
    // The flat pass is the control: the same event, told nothing, bursts at
    // the tile centre. Told the well is up, the same burst starts where the
    // lane puts that tile — and a spark starts *at* its point, so every one
    // of them is there before the first `update` moves it.
    const flat = sparksOf(ingest([killed], FLAT, false));
    expect(flat.length).toBeGreaterThan(0);
    for (const s of flat) {
      expect(s.x).toBeCloseTo(tileCX(FLAT, 4), 6);
      expect(s.y).toBeCloseTo(tileCY(FLAT, 5), 6);
    }
    const lane = wellPlace(L, 4, 5);
    const well = sparksOf(ingest([killed], L, true));
    expect(well.length).toBe(flat.length);
    for (const s of well) {
      expect(s.x).toBeCloseTo(lane.x, 6);
      expect(s.y).toBeCloseTo(lane.y, 6);
    }
  });

  it("throws a body's breach at the hub, where the hull line is on this screen", () => {
    // A body brushing the plate goes through `ingestBreach`'s own `burst`
    // rather than the burst table, which is the second door the sparks have —
    // and the one a well wave whose body reached the hull found shut. The
    // flat burst is at the hull line, half a tile above the last row's centre,
    // and the well's is where the lane puts that height.
    const breach: SimEvent = {
      type: "breach",
      col: 4,
      weight: "light",
      span: 1,
      kind: "slick",
      fromRow: CFG.rows - 2,
      seed: 0,
      holes: 0,
      color: "red",
      beat: 0,
    };
    const hull = wellPlace(L, 4, CFG.rows - 1.5);
    const well = sparksOf(ingest([breach], L, true));
    expect(well.length).toBeGreaterThan(0);
    for (const s of well) {
      expect(s.x).toBeCloseTo(hull.x, 6);
      expect(s.y).toBeCloseTo(hull.y, 6);
    }
  });

  it("draws a pod being swallowed in toward the hub, not toward a hull line", () => {
    // An implosion is spawned on a jittered ring round its point, and the
    // jitter is the same hash sequence on both screens — so the ring the well
    // gets is the flat ring carried whole to the hub, and its mean sits off
    // the hub by exactly what the flat mean sits off the hull line.
    const taken: SimEvent = { type: "podTaken", col: 2, kind: "ward" };
    const meanOf = (at: { x: number; y: number }[]) =>
      at.reduce((m, s) => ({ x: m.x + s.x / at.length, y: m.y + s.y / at.length }), { x: 0, y: 0 });
    const flat = meanOf(sparksOf(ingest([taken], FLAT, false)));
    const well = meanOf(sparksOf(ingest([taken], L, true)));
    const hub = wellPlace(L, 2, CFG.rows - 1.5);
    expect(well.x - hub.x).toBeCloseTo(flat.x - tileCX(FLAT, 2), 6);
    expect(well.y - hub.y).toBeCloseTo(flat.y - FLAT.hullY, 6);
  });
});
