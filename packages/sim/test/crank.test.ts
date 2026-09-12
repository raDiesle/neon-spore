import { describe, expect, it } from "bun:test";
import {
  CRANK_TURN,
  crankBites,
  crankTurnedMilli,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_CRANK,
  reachOut,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
  windPerTickMilli,
} from "../src/index.js";

/**
 * THE CLAW's crank: the arm is wound home rather than coming home.
 *
 * What is worth holding here is the half a picture cannot show — that a
 * bearing on its own does nothing, that only the step between two of them is
 * rope, and that the step counts one way round and not the other. The
 * arithmetic is the whole mechanic: two devices are handed the same bearings
 * and have to put the arm in the same place.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const STEP = windPerTickMilli(CFG);
const WAVE = 3;

function open(): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], []);
  return world;
}

const turn = (at: number): TimedCommand => ({
  tick: 0,
  player: 1,
  command: { kind: "drag", target: "crank", on: true, fromMilli: at },
});

/** The arm out and hanging at the top of the field, which is where a reach
 * that met nothing leaves it. */
function hanging(): World {
  const world = open();
  step(world, [{ tick: 0, player: 1, command: { kind: "reach" } }]);
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

describe("a hand on the crank", () => {
  it("says where it is, and the first thing it says winds nothing", () => {
    const world = hanging();
    const was = world.reachMilli;
    step(world, [turn(400)]);
    expect(world.reachMilli).toBe(was);
    expect(world.crankAtMilli).toBe(400);
  });

  it("winds the step between two bearings, and nothing else", () => {
    const world = hanging();
    step(world, [turn(0)]);
    const was = world.reachMilli;
    step(world, [turn(120)]);
    // Thousandths of a turn times tiles per turn is thousandths of a tile.
    expect(was - world.reachMilli).toBe(120 * CFG.windTilesPerTurn);
  });

  it("counts a turn that crosses the top of the circle", () => {
    const world = hanging();
    step(world, [turn(950)]);
    const was = world.reachMilli;
    step(world, [turn(50)]);
    expect(was - world.reachMilli).toBe(100 * CFG.windTilesPerTurn);
  });

  it("pays the rope back out when it is turned the other way", () => {
    const world = hanging();
    // Down a little first: an arm at the ceiling has no rope left to pay.
    step(world, [turn(0)]);
    step(world, [turn(300)]);
    const was = world.reachMilli;
    step(world, [turn(200)]);
    expect(world.reachMilli - was).toBe(100 * CFG.windTilesPerTurn);
    // And the hand is still where it now is, so turning forwards from there
    // winds in from *there*.
    expect(world.crankAtMilli).toBe(200);
    const out = world.reachMilli;
    step(world, [turn(250)]);
    expect(out - world.reachMilli).toBe(50 * CFG.windTilesPerTurn);
  });

  it("stops at the top of the field however long the hand keeps paying out", () => {
    const world = hanging();
    const ceiling = world.reachMilli;
    let at = 0;
    step(world, [turn(at)]);
    for (let i = 0; i < TPB * 4; i++) {
      at = (at - STEP + CRANK_TURN) % CRANK_TURN;
      step(world, [turn(at)]);
    }
    expect(world.reachMilli).toBe(ceiling);
  });

  it("raises the arm off the hull with no press at all", () => {
    const world = open();
    expect(reachOut(world)).toBe(false);
    expect(crankBites(world)).toBe(true);
    world.cannonCol = 2;
    step(world, [turn(0)]);
    step(world, [turn(CRANK_TURN - 200)]);
    expect(reachOut(world)).toBe(true);
    // Hanging, not climbing: nothing carries it on when the hand stops.
    expect(world.reachDir).toBe(-1);
    expect(world.reachCol).toBe(2);
    expect(world.reachMilli).toBe(200 * CFG.windTilesPerTurn);
    const was = world.reachMilli;
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(world.reachMilli).toBe(was);
  });

  it("forgets its reference when the hand comes off", () => {
    const world = hanging();
    step(world, [turn(0)]);
    step(world, [
      { tick: 0, player: 1, command: { kind: "drag", target: "crank", on: false, fromMilli: -1 } },
    ]);
    expect(world.crankAtMilli).toBe(NO_CRANK);
    const was = world.reachMilli;
    // A hand back on at the far side of the circle is a new starting point,
    // not half a turn of rope the finger never travelled.
    step(world, [turn(500)]);
    expect(world.reachMilli).toBe(was);
  });

  it("is player 1's, and the other seat cannot wind it", () => {
    const world = hanging();
    step(world, [{ ...turn(0), player: 2 }]);
    const was = world.reachMilli;
    step(world, [{ ...turn(300), player: 2 }]);
    expect(world.reachMilli).toBe(was);
  });

  it("winds nothing while the arm is still going up", () => {
    const world = open();
    step(world, [{ tick: 0, player: 1, command: { kind: "reach" } }]);
    step(world, [turn(0)]);
    const was = world.reachMilli;
    step(world, [turn(300)]);
    // It is still climbing, so it is *further* out rather than nearer home.
    expect(world.reachMilli).toBeGreaterThan(was);
    expect(crankBites(world)).toBe(false);
  });

  it("stops at the hull however long the hand keeps turning", () => {
    const world = hanging();
    let at = 0;
    for (let i = 0; i < TPB * 8; i++) {
      step(world, [turn(at)]);
      at = (at + STEP) % CRANK_TURN;
    }
    expect(reachOut(world)).toBe(false);
    expect(world.reachMilli).toBe(0);
    expect(crankTurnedMilli(world)).toBe(0);
  });
});

describe("the drum the panel draws", () => {
  it("stands turned out by whatever rope is hanging, and comes back to nought", () => {
    const world = hanging();
    expect(crankTurnedMilli(world)).toBeLessThan(0);
    const out = crankTurnedMilli(world);
    step(world, [turn(0)]);
    step(world, [turn(100)]);
    // Wound in, the drum has come *clockwise* — towards nought from below.
    expect(crankTurnedMilli(world)).toBeGreaterThan(out);
  });
});

describe("two devices", () => {
  it("notices a hand one notch further round the crank", () => {
    const world = hanging();
    const before = hashWorld(world);
    world.crankAtMilli = 250;
    expect(hashWorld(world)).not.toBe(before);
  });
});
