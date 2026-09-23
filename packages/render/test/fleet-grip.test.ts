import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type FleetState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { chartFor, chartX, chartY } from "../src/fleet-chart.js";
import { fleetHoleCircle, fleetRingCentre, fleetWreckPull } from "../src/fleet-grip.js";
import { drawFleetGrip } from "../src/fleet-grip-draw.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import {
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  type StubContext,
  stubCanvas,
} from "./canvas-stub.js";
import { CFG, ROLES, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLEET's wound as three controls (`fleet-grip.ts`, `fleet-grip-draw.ts`):
 * that the plume is the navigator's and only while the flood is open, that the
 * rake is the pilot's and reaches the whole holed hull, that the wreck is hers
 * again once the hull is raked — and that the carry each reports is the one
 * `sim/fleet-hand.ts` is written to read. The rules are the simulation's; this
 * file proves the picture hands them a thumb, and that the hunt hands them
 * none.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The fleet's own wave, installed and stepped once. */
function round(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  if (world.boss === null || world.boss.kind !== "fleet") {
    throw new Error("the fleet's wave installed no fleet");
  }
  return world;
}

/** The first ship holed at its head, and the round in the state this case is about. */
function holed(phase: FleetState["phase"], overrides: Partial<FleetState> = {}): FleetState {
  const world = round();
  const b = world.boss as FleetState;
  const ship = b.ships[0];
  if (ship === undefined) throw new Error("the fleet stood up with no ships");
  return Object.assign(b, {
    phase,
    phaseBeat: world.beat,
    holed: 0,
    holeCol: ship.col,
    holeRow: ship.row,
    ...overrides,
  });
}

function fieldWith(seat: 1 | 2, boss: FleetState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** The middle of the wound, where every one of the three thumbs goes. */
const holeAt = (l: Layout, b: FleetState) => fleetHoleCircle(chartFor(l, DEFAULT_CONFIG), b);

describe("a thumb on the plume", () => {
  it("is the navigator's, while the flood is open, and nobody else's", () => {
    const l = layout("p2");
    const b = holed("flood");
    const at = holeAt(l, b);
    const touch = touchDown(l, at.x, at.y, fieldWith(2, b));
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "fleetBreach",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "fleetBreach", player: 2 });
    // The hunt has no wound, so the same square is water on both screens.
    expect(touchDown(l, at.x, at.y, fieldWith(2, holed("hunt")))).toBeNull();
    expect(touchDown(l, at.x, at.y, fieldWith(2, null))).toBeNull();
  });

  it("lets go on the lift, and carries no distance anybody reads", () => {
    const l = layout("p2");
    const b = holed("flood");
    const field = fieldWith(2, b);
    const at = holeAt(l, b);
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    expect(touchMove(l, hold, at.x + 3, at.y + 3)?.command).toMatchObject({
      target: "fleetBreach",
      on: true,
    });
    expect(touchUp(l, hold, field, { x: at.x, y: at.y })?.command).toMatchObject({
      target: "fleetBreach",
      on: false,
    });
  });
});

describe("a thumb on the hull", () => {
  it("is the pilot's, and reaches the whole of it rather than the wound alone", () => {
    const l = layout("p1");
    const b = holed("flood");
    const c = chartFor(l, DEFAULT_CONFIG);
    const ship = b.ships[0];
    if (ship === undefined) throw new Error("no ship");
    const far = ship.dir === "h" ? ship.col + ship.len - 1 : ship.col;
    const farRow = ship.dir === "v" ? ship.row + ship.len - 1 : ship.row;
    const touch = touchDown(l, chartX(c, far), chartY(c, farRow), fieldWith(1, b));
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "fleetRake", player: 1 });
    // And the press is already honest about which square that is: the hold's
    // origin is the wound, so the offset is whole squares from it.
    const across = touch?.command?.kind === "drag" ? touch.command.fromMilli : 0;
    const down = touch?.command?.kind === "drag" ? (touch.command.fromYMilli ?? 0) : 0;
    expect(Math.round(across / 1000)).toBe(far - ship.col);
    expect(Math.round(down / 1000)).toBe(farRow - ship.row);
  });

  it("is his under the wreck too, because his thumb has to stay for her pull", () => {
    const l = layout("p1");
    const b = holed("wreck");
    const at = holeAt(l, b);
    expect(touchDown(l, at.x, at.y, fieldWith(1, b))?.hold).toMatchObject({
      target: "fleetRake",
    });
    // Hers on the same square is the wreck, not the rake: one wound, two seats.
    expect(touchDown(layout("p2"), at.x, at.y, fieldWith(2, b))?.hold).toMatchObject({
      target: "fleetWreck",
    });
  });

  it("reports the square it has been carried to, measured from the wound", () => {
    const l = layout("p1");
    const b = holed("flood");
    const c = chartFor(l, DEFAULT_CONFIG);
    const at = holeAt(l, b);
    const hold = touchDown(l, at.x, at.y, fieldWith(1, b))?.hold as Hold;
    const moved = touchMove(l, hold, at.x + c.tile * 2, at.y + c.tile)?.command;
    expect(moved).toMatchObject({ target: "fleetRake", on: true, fromMilli: 2000 });
    expect(moved?.kind === "drag" && moved.fromYMilli).toBe(1000);
  });

  it("falls through off the hull, so a miss finds whatever is behind it", () => {
    const l = layout("p1");
    const b = holed("flood");
    const c = chartFor(l, DEFAULT_CONFIG);
    const ship = b.ships[0];
    if (ship === undefined) throw new Error("no ship");
    const off = ship.dir === "h" ? ship.row + 2 : ship.row;
    const offCol = ship.dir === "h" ? ship.col : ship.col + 2;
    const touch = touchDown(l, chartX(c, offCol), chartY(c, off), fieldWith(1, b));
    expect(touch?.command?.kind === "drag" && touch.command.target).not.toBe("fleetRake");
  });
});

describe("a thumb on the wreck", () => {
  it("is the navigator's, once the hull is raked, and reports how far down it has come", () => {
    const l = layout("p2");
    const b = holed("wreck");
    const c = chartFor(l, DEFAULT_CONFIG);
    const field = fieldWith(2, b);
    const at = holeAt(l, b);
    const touch = touchDown(l, at.x, at.y, field);
    expect(touch?.command).toMatchObject({ target: "fleetWreck", on: true, fromYMilli: 0 });
    const hold = touch?.hold as Hold;
    const pulled = touchMove(l, hold, at.x, at.y + c.tile * 1.5)?.command;
    expect(pulled?.kind === "drag" && pulled.fromYMilli).toBe(1500);
    expect(touchUp(l, hold, field, { x: at.x, y: at.y })?.command).toMatchObject({
      target: "fleetWreck",
      on: false,
    });
    // Under the flood the same square is the plume; the wreck is not there yet.
    expect(touchDown(l, at.x, at.y, fieldWith(2, holed("flood")))?.hold).toMatchObject({
      target: "fleetBreach",
    });
  });
});

/** What the wound draws on a role's screen, for one state. */
function frame(role: ViewRole, b: FleetState, world: World): StubContext {
  const { ctx } = stubCanvas();
  ctx.texts = [];
  drawFleetGrip(ctx as unknown as CanvasRenderingContext2D, layout(role), world, b, 0.25, 1.2);
  return ctx;
}

/** How much of a picture there was, for a case that only asks whether there was one. */
const strokes = (role: ViewRole, b: FleetState, world: World) => frame(role, b, world).calls;

/** The words on a screen, which is how the seat's own grip names itself. */
const words = (role: ViewRole, b: FleetState, world: World) =>
  (frame(role, b, world).texts ?? []).map((t) => t.text);

describe("the wound", () => {
  it("is drawn on nobody's screen while the fleet is hunting", () => {
    const world = round();
    const b = holed("hunt");
    for (const role of ROLES) expect(strokes(role, b, world)).toBe(0);
  });

  it("stands on both screens once a hull is holed, because the plume is shared", () => {
    const world = round();
    const b = holed("flood");
    for (const role of ROLES) expect(strokes(role, b, world)).toBeGreaterThan(0);
  });

  it("says one word a screen, and each seat only its own", () => {
    const world = round();
    expect(words("p1", holed("flood"), world)).toEqual(["RAKE"]);
    expect(words("p2", holed("flood"), world)).toEqual(["HOLD"]);
    expect(words("p1", holed("wreck"), world)).toEqual(["HOLD"]);
    expect(words("p2", holed("wreck"), world)).toEqual(["PULL"]);
  });

  it("drops the word as soon as that seat's thumb is on it, and nobody else's", () => {
    const world = round();
    expect(words("p2", holed("flood", { breachHeld: true }), world)).toEqual([]);
    // His word is still standing: her thumb is not his.
    expect(words("p1", holed("flood", { breachHeld: true }), world)).toEqual(["RAKE"]);
    expect(words("p1", holed("flood", { rakeOn: true }), world)).toEqual([]);
    expect(words("p2", holed("wreck", { wreckPullMilli: 300 }), world)).toEqual([]);
  });

  it("carries the pilot's ring to the square he is raking, and leaves hers on the wound", () => {
    const l = layout("p1");
    const c = chartFor(l, DEFAULT_CONFIG);
    const b = holed("flood", { rakeOn: true, rakeCol: 3, rakeRow: 5 });
    expect(fleetRingCentre(c, b, 1)).toEqual({ x: chartX(c, 3), y: chartY(c, 5) });
    expect(fleetRingCentre(c, b, 2)).toEqual({ x: chartX(c, b.holeCol), y: chartY(c, b.holeRow) });
    // Before his thumb lands there is no square to stand on, so it rests on the wound.
    const idle = holed("flood", { rakeOn: false, rakeCol: 3, rakeRow: 5 });
    expect(fleetRingCentre(c, idle, 1)).toEqual({
      x: chartX(c, idle.holeCol),
      y: chartY(c, idle.holeRow),
    });
  });

  it("sinks her ring with the wreck, by the distance she has pulled it", () => {
    const c = chartFor(layout("p2"), DEFAULT_CONFIG);
    expect(fleetWreckPull(c, holed("wreck", { wreckPullMilli: 2000 }))).toBeCloseTo(c.tile * 2, 6);
    // Nothing is under the water yet while the flood is open.
    expect(fleetWreckPull(c, holed("flood", { wreckPullMilli: 2000 }))).toBe(0);
  });
});
