import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FleetState,
  fleetIndex,
  fleetShipAt,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { chartOf, chartX, chartY } from "../src/fleet-chart.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE FLEET, and the one word the field may say about it**
 * (`render/src/boss-cue-read-g.ts`).
 *
 * The fight is a square said out loud, so the square is the answer and nearly
 * everything else is a way of saying it. The load-bearing case here is the
 * negative one: the navigator is told nothing, on any beat, wherever the
 * sights are standing — a lane that made the round "clearer" by putting a word
 * on her arrows would fail it (`decisions.md` #34, *never the answer*).
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; f: FleetState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const f = world.boss;
  if (f === null || f.kind !== "fleet") throw new Error("the fleet's wave installed no fleet");
  return { world, f };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** The first square of the first ship, and a square of open water. */
function squares(f: FleetState): { hull: [number, number]; water: [number, number] } {
  const ship = f.ships[0];
  if (ship === undefined) throw new Error("the fleet sailed with no ships");
  for (let col = 0; col < 10; col++) {
    for (let row = 0; row < 10; row++) {
      if (fleetShipAt(f.ships, col, row) === -1) {
        return { hull: [ship.col, ship.row], water: [col, row] };
      }
    }
  }
  throw new Error("the chart is all hull");
}

function aimAt(f: FleetState, at: [number, number]): void {
  f.aimCol = at[0];
  f.aimRow = at[1];
}

describe("THE FLEET", () => {
  it("says nothing while the sights stand in open water", () => {
    const { world, f } = opened();
    aimAt(f, squares(f).water);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks the pilot to FIRE once the sights have arrived on a hull", () => {
    const { world, f } = opened();
    aimAt(f, squares(f).hull);
    const c = cue(world, "p1");
    expect(c?.word).toBe("FIRE");
    expect(c?.kind).toBe("PRESS");
    expect(c?.seat).toBe(1);
    // On the square itself, and drawing no frame: the sights are four corner
    // brackets already (`fleet-marks.ts`).
    const chart = chartOf(LAYOUT.p1, world);
    expect(c?.x).toBeCloseTo(chartX(chart, f.aimCol), 6);
    expect(c?.y).toBeCloseTo(chartY(chart, f.aimRow), 6);
    expect(c?.framed).toBe(false);
  });

  it("goes quiet over a square that has already been fired at", () => {
    const { world, f } = opened();
    const hull = squares(f).hull;
    aimAt(f, hull);
    expect(cue(world, "p1")).not.toBeNull();
    f.struck.push(fleetIndex(CFG, hull[0], hull[1]));
    expect(cue(world, "p1")).toBeNull();
  });

  it("goes quiet while the salvo is resting, and comes back when the shell lands", () => {
    const { world, f } = opened();
    aimAt(f, squares(f).hull);
    f.firedBeat = world.beat;
    expect(cue(world, "p1")).toBeNull();
    world.beat += CFG.fleetSalvoRestBeats;
    expect(cue(world, "p1")?.word).toBe("FIRE");
  });

  it("says nothing at all to the navigator, wherever the sights stand", () => {
    const { world, f } = opened();
    const seen = new Set<string>();
    for (let col = 0; col < 11; col++) {
      for (let row = 0; row < 10; row++) {
        aimAt(f, [col, row]);
        for (const beat of [0, 1, 2]) {
          world.beat = beat + CFG.fleetSalvoRestBeats;
          const c = cue(world, "p2");
          if (c !== null) seen.add(`${c.kind}·${c.word}`);
        }
      }
    }
    expect([...seen]).toEqual([]);
  });

  it("under the flood tells her to HOLD and him to RAKE, both on the hole", () => {
    const { world, f } = opened();
    const hull = squares(f).hull;
    f.phase = "flood";
    f.holed = 0;
    [f.holeCol, f.holeRow] = hull;
    const p2 = cue(world, "p2");
    expect([p2?.kind, p2?.word, p2?.seat]).toEqual(["HOLD", "HOLD", 2]);
    const p1 = cue(world, "p1");
    expect([p1?.kind, p1?.word, p1?.seat]).toEqual(["CARRY", "RAKE", 1]);
    const chart = chartOf(LAYOUT.p1, world);
    expect(p1?.x).toBeCloseTo(chartX(chart, hull[0]), 6);
    expect(p1?.y).toBeCloseTo(chartY(chart, hull[1]), 6);
    // And the hunt's word is not under it: the sights on a whole hull say nothing now.
    aimAt(f, hull);
    expect(cue(world, "p1")?.word).toBe("RAKE");
  });

  it("under the wreck swaps them: he holds, she pulls", () => {
    const { world, f } = opened();
    f.phase = "wreck";
    f.holed = 0;
    [f.holeCol, f.holeRow] = squares(f).hull;
    expect(cue(world, "p1")?.word).toBe("HOLD");
    expect(cue(world, "p2")?.word).toBe("PULL");
    expect(cue(world, "p2")?.kind).toBe("CARRY");
  });
});
