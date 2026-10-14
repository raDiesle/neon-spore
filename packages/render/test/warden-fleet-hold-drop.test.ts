import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FleetState,
  NO_TETHER,
  startWave,
  step,
  ticksPerBeat,
  WARDEN_PHASES,
  type WardenState,
  type World,
} from "@neon-spore/sim";
import { cueFrame } from "../src/boss-cue-frame.js";
import { holdDropR } from "../src/cue-helper.js";
import { chartFor } from "../src/fleet-chart.js";
import { fleetSeatRing } from "../src/fleet-grip.js";
import { drawFleetGrip } from "../src/fleet-grip-draw.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawWardenGrip, wardenGripCircle } from "../src/warden-grip.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WARDEN's eye under NARROW and THE FLEET's two holds are the HOLD
 * LAB's drop** (`warden-grip.ts`, `fleet-grip-draw.ts`), drawn by the boss
 * with the hold's thumb on it, so the cue draws no second one
 * (`BossCue.ownDrop`). Neither round keeps a count of the hold, so neither
 * drop holds water.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

function narrowed(): { world: World; b: WardenState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("no warden");
  b.plates = WARDEN_PHASES[0]!.above;
  let guard = 0;
  while (b.tetherId === NO_TETHER && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

function wardenDrops(role: ViewRole, world: World, b: WardenState) {
  const body = world.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined) throw new Error("the warden has no body");
  const ctx = stubCanvas().ctx as unknown as CanvasRenderingContext2D;
  const l = layout(role);
  const run = () => drawWardenGrip(ctx, l, CFG, world, body, b, role, 0.5, 1.2, new GripVerdicts());
  return { holds: spyHolds(run).holds, eye: wardenGripCircle(l, body, b) };
}

describe("THE WARDEN's eye under NARROW", () => {
  it("is the navigator's drop, on the eye, the cue's size, sunk while she holds", () => {
    const { world, b } = narrowed();
    const { holds, eye } = wardenDrops("p2", world, b);
    expect(holds.length).toBe(1);
    expect(holds[0]?.at).toMatchObject({ x: eye.x, y: eye.y });
    expect(holds[0]?.r).toBeCloseTo(holdDropR(cueFrame(layout("p2"))), 6);
    expect(holds[0]?.o.held).toBe(false);
    expect(holds[0]?.o.theirs).toBeUndefined();
    expect(holds[0]?.o.fill).toBeUndefined();
    b.eyeHeld = true;
    expect(wardenDrops("p2", world, b).holds[0]?.o.held).toBe(true);
  });

  it("is the pilot's dimmed drop until her thumb is down, then nothing", () => {
    const { world, b } = narrowed();
    const { holds } = wardenDrops("p1", world, b);
    expect(holds.length).toBe(1);
    expect(holds[0]?.o.theirs).toBe(true);
    b.eyeHeld = true;
    expect(wardenDrops("p1", world, b).holds.length).toBe(0);
  });
});

function holed(phase: FleetState["phase"], over: Partial<FleetState> = {}) {
  const world = createWorld(CFG, 5);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const b = world.boss as FleetState;
  const ship = b.ships[0];
  if (ship === undefined) throw new Error("no ship");
  Object.assign(b, {
    phase,
    phaseBeat: world.beat,
    holed: 0,
    holeCol: ship.col,
    holeRow: ship.row,
  });
  Object.assign(b, over);
  return { world, b };
}

function fleetDrops(role: ViewRole, phase: FleetState["phase"], over: Partial<FleetState> = {}) {
  const { world, b } = holed(phase, over);
  const ctx = stubCanvas().ctx as unknown as CanvasRenderingContext2D;
  const run = () => drawFleetGrip(ctx, layout(role), world, b, 0.25, 1.2);
  return { holds: spyHolds(run).holds, b };
}

describe("THE FLEET's holds", () => {
  it("are her breach under the flood and his keep under the wreck, on the seat's ring", () => {
    for (const [role, phase, seat] of [
      ["p2", "flood", 2],
      ["p1", "wreck", 1],
    ] as const) {
      const { holds, b } = fleetDrops(role, phase);
      expect(holds.length, role).toBe(1);
      const ring = fleetSeatRing(chartFor(layout(role), CFG), b, seat);
      expect(holds[0]?.at).toMatchObject({ x: ring.x, y: ring.y });
      expect(holds[0]?.o.held).toBe(false);
      expect(holds[0]?.o.fill).toBeUndefined();
    }
  });

  it("sink under the seat's own thumb", () => {
    expect(fleetDrops("p2", "flood", { breachHeld: true }).holds[0]?.o.held).toBe(true);
    expect(fleetDrops("p1", "wreck", { rakeOn: true }).holds[0]?.o.held).toBe(true);
  });

  it("are not the rake or the wreck's pull", () => {
    expect(fleetDrops("p1", "flood").holds.length).toBe(0);
    expect(fleetDrops("p2", "wreck").holds.length).toBe(0);
  });
});
