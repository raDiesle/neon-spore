import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Bullet,
  createWorld,
  midCol,
  NO_BEARING,
  NO_SPARK,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  type ValveState,
  valveBoss,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawValve } from "../src/valve-draw.js";
import { ValveFx } from "../src/valve-fx.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE VALVE (`valve-stop.ts`): the
 * leaking spark in either colour up its column, the drum anywhere else it
 * hangs, sealed or fallen open, and clear air past it.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own drum a few beats in, in `phase` a beat along with `out` pins pulled, then as `arrange` sets it. */
function hung(
  phase: ValvePhase,
  out: number,
  arrange: (s: ValveState, world: World) => void = () => {},
): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.pins = VALVE_PINS - out;
  s.movement = Math.min(3, out + 1) as 1 | 2 | 3;
  s.wheelMilli = 100;
  s.travelMilli = 0;
  s.handMilli = NO_BEARING;
  s.sparkCol = NO_SPARK;
  arrange(s, world);
  return world;
}

/** The spark half way down its fuse. */
const leaking = (s: ValveState, world: World) => {
  s.sparkCol = MID;
  s.sparkBeat = world.beat - Math.floor(CFG.valveSparkBeats / 2);
};

function aimed(l: Layout, world: World): BoltStops {
  const s = valveBoss(world);
  if (s === null) throw new Error("no drum");
  const stops = new BoltStops();
  drawValve(paper(), l, world, s, world.beat, 0.5, 0, new ValveFx(), stops);
  return stops;
}

describe("THE VALVE stops a bolt", () => {
  it.each(ROLES)("on the leaking spark in either colour, over the field, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung("turn", 1, leaking));
    const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
    const red = stops.meets(MID, tileCX(l, MID), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it.each(ROLES)("on the drum up the middle and beside it while nothing leaks, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung("turn", 1));
    for (const col of [MID, MID + 1, MID - 1]) {
      const at = stops.meets(col, tileCX(l, col), "cyan");
      expect(at?.hit).toBe("body");
      expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
    }
  });

  it.each(ROLES)("on each half of the drum once it falls open, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung("open", 3));
    for (const col of [MID + 1, MID - 1])
      expect(stops.meets(col, tileCX(l, col), "cyan")?.hit).toBe("body");
  });

  it("lets one past the drum go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(aimed(l, hung("turn", 1)).meets(0, tileCX(l, 0), "cyan")).toBeNull();
  });

  it("drawn no further than the spark", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, hung("turn", 1, leaking));
    const x = tileCX(l, MID);
    const y = stops.meets(MID, x, "cyan")?.y ?? 0;
    expect(stops.stopped(bolt(), x, y + l.tile, "#fff")).toBe(false);
    expect(stops.stopped(bolt(), x, y, "#fff")).toBe(true);
  });
});

function bolt(): Bullet {
  return {
    id: 1,
    col: MID,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
