import { describe, expect, it } from "bun:test";
import {
  CRANK_TURN,
  crankBites,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  mawOpen,
  type PodEntry,
  reachOut,
  reachTipMilli,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
  windPerTickMilli,
} from "../src/index.js";

/**
 * THE CLAW as a control set: the cannon replaced by an arm, on the ordinary
 * field.
 *
 * The two halves worth holding are the ones a picture cannot show — that the
 * arm is *committed* once it leaves, and that what it closes on decides
 * whether the hull pays or the mouth gets something. The crossing power-up is
 * the third, and it is a pod rule rather than a panel one, which is why it is
 * tested here beside the arm rather than in a file of its own.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const WAVE = 3;

function open(queue: SpawnEntry[] = [], pods: PodEntry[] = []): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, queue, pods);
  return world;
}

function ticks(world: World, n: number, commands: TimedCommand[] = []): void {
  for (let i = 0; i < n; i++) step(world, i === 0 ? commands : []);
}

const press = (player: 1 | 2, command: TimedCommand["command"]): TimedCommand => ({
  tick: 0,
  player,
  command,
});

/**
 * The crank turned for `n` ticks, one bearing a tick, at the rate a hand that
 * is not a hand turns at (`windPerTickMilli`).
 *
 * Every one of these files' rigs needs it now: the arm hangs where it stopped
 * until somebody winds it, so a test that pressed REACH and stepped would be
 * testing an arm that never comes back. It steps the world as it goes, which
 * is what a finger does — the bearings are only worth anything one after
 * another.
 */
function wind(world: World, n: number): void {
  let at = 0;
  for (let i = 0; i < n; i++) {
    step(world, [press(1, { kind: "drag", target: "crank", on: true, fromMilli: at })]);
    at = (at + windPerTickMilli(CFG)) % CRANK_TURN;
  }
}

describe("the arm", () => {
  it("goes up the column the strip is standing in", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "cannonCol", col: 7 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    expect(reachOut(world)).toBe(true);
    expect(world.reachCol).toBe(7);
    // And it holds that column: sliding the strip under a travelling arm
    // cannot bend it.
    ticks(world, 20, [press(1, { kind: "cannonCol", col: 2 })]);
    expect(world.reachCol).toBe(7);
  });

  it("is committed — a second press does nothing while it is out", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "reach" })]);
    ticks(world, 30);
    const was = world.reachMilli;
    ticks(world, 1, [press(1, { kind: "reach" })]);
    expect(world.reachMilli).toBeGreaterThan(was);
  });

  it("hangs where it stopped until the crank brings it in", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Twice the field's height at the arm's own speed, and a beat over: it
    // has long since turned round at the top, and nothing has wound it.
    ticks(world, TPB * 8);
    expect(reachOut(world)).toBe(true);
    expect(crankBites(world)).toBe(true);
    const hanging = world.reachMilli;
    expect(hanging).toBeGreaterThan(0);
    // And it is still there a wave later with nobody's hand on the crank.
    ticks(world, TPB * 8);
    expect(world.reachMilli).toBe(hanging);
    // Wound, it comes down and it is home.
    wind(world, TPB * 4);
    expect(reachOut(world)).toBe(false);
    expect(world.reachMilli).toBe(0);
  });

  it("reaches the top of the field before it turns", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "reach" })]);
    let highest = hullRow(CFG) * 1000;
    for (let i = 0; i < TPB * 8; i++) {
      step(world, []);
      highest = Math.min(highest, reachOut(world) ? reachTipMilli(world) : highest);
    }
    expect(highest).toBeLessThanOrEqual(0);
  });
});

/** The same, turned the other way round the circle: the crank paying rope out
 * and the arm going up under a thumb (`sim/crank.ts`). */
function unwind(world: World, n: number): void {
  let at = 0;
  for (let i = 0; i < n; i++) {
    step(world, [press(1, { kind: "drag", target: "crank", on: true, fromMilli: at })]);
    at = (at - windPerTickMilli(CFG) + CRANK_TURN) % CRANK_TURN;
  }
}

describe("what it closes on", () => {
  it("drops a body the crank raised it into, exactly as a press would", () => {
    const world = open([{ beat: 0, col: 4, kind: "meteor", color: null }]);
    ticks(world, TPB * 2);
    const rock = world.creatures[0];
    expect(rock, "the wave sent a rock").toBeDefined();
    ticks(world, 1, [press(1, { kind: "cannonCol", col: rock?.col ?? 0 })]);
    // No press at all: the arm is walked off the hull by hand.
    unwind(world, TPB * 6);
    expect(reachOut(world)).toBe(true);
    expect(rock?.dropped).toBe(true);
  });

  it("crushes a body and charges the hull less than the body would have", () => {
    const world = open([{ beat: 0, col: 4, kind: "meteor", color: null }]);
    ticks(world, TPB * 2);
    const rock = world.creatures[0];
    expect(rock, "the wave sent a rock").toBeDefined();
    ticks(world, 1, [press(1, { kind: "cannonCol", col: rock?.col ?? 0 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    ticks(world, TPB * 4);
    wind(world, TPB * 4);
    expect(world.creatures).toHaveLength(0);
    // And it left a scar where the hand closed, so the price is on the ship
    // rather than only in a number — and the price is the wave, as any hit
    // is (`wave-fail.ts`).
    expect(world.scars.length).toBeGreaterThan(0);
    expect(world.retries).toBe(1);
  });

  it("brings a pod home for the other seat's mouth", () => {
    const world = open([], [{ beat: 0, col: 4, row: 5, kind: "ward" }]);
    ticks(world, TPB);
    expect(world.pods).toHaveLength(1);
    ticks(world, 1, [press(1, { kind: "cannonCol", col: 4 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Up to the pod, closed on it, and back down. The moment the arm is home
    // is the one to look at: from there the pod is falling like any other and
    // a beat later it has already arrived at a mouth that was never opened.
    let held = false;
    let looseAtHome = false;
    let at = 0;
    for (let i = 0; i < TPB * 8; i++) {
      const wasOut = reachOut(world);
      // The hand on the crank from the tick the arm turns round, which is the
      // only thing that brings it back down (`crank.ts`).
      const turn: TimedCommand[] =
        world.reachDir < 0
          ? [press(1, { kind: "drag", target: "crank", on: true, fromMilli: at })]
          : [];
      at = (at + windPerTickMilli(CFG)) % CRANK_TURN;
      step(world, turn);
      if (world.reachHeld !== 0) held = true;
      if (wasOut && !reachOut(world)) looseAtHome = world.pods[0]?.loose === true;
    }
    expect(held).toBe(true);
    expect(looseAtHome).toBe(true);
  });

  it("lets the other seat take what it brought down", () => {
    const world = open([], [{ beat: 0, col: 4, row: 5, kind: "ward" }]);
    ticks(world, TPB);
    ticks(world, 1, [press(1, { kind: "cannonCol", col: 4 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Player 2's mouth, held open through the arrival. The command is the
    // ship's own `intake`; only the panel it sits on differs.
    let at = 0;
    for (let i = 0; i < TPB * 12; i++) {
      const commands: TimedCommand[] = i % 20 === 0 ? [press(2, { kind: "intake" })] : [];
      if (world.reachDir < 0) {
        commands.push(press(1, { kind: "drag", target: "crank", on: true, fromMilli: at }));
        at = (at + windPerTickMilli(CFG)) % CRANK_TURN;
      }
      step(world, commands);
    }
    expect(mawOpen(world)).toBe(true);
    expect(world.balance.podsTaken).toBeGreaterThan(0);
  });
});

describe("a power-up that crosses the field", () => {
  it("travels its row and leaves at the far side", () => {
    const world = open([], [{ beat: 0, col: 0, row: 4, kind: "ward", cross: 1 }]);
    ticks(world, TPB);
    const pod = world.pods[0];
    expect(pod, "the wave hung one").toBeDefined();
    const from = pod?.colMilli ?? 0;
    ticks(world, TPB * 2);
    expect(world.pods[0]?.colMilli ?? 0).toBeGreaterThan(from);
    // Its row never changes while it is moored: it crosses, it does not fall.
    expect(world.pods[0]?.rowMilli).toBe(4000);
    // And it is gone once it has crossed, rather than piling up at the wall —
    // a window that has shut.
    ticks(world, TPB * 12);
    expect(world.pods).toHaveLength(0);
  });

  it("hangs exactly as it always did when the wave does not say", () => {
    const world = open([], [{ beat: 0, col: 3, row: 4, kind: "ward" }]);
    ticks(world, TPB * 4);
    expect(world.pods[0]?.colMilli).toBe(3000);
    expect(world.pods[0]?.crossMilli).toBe(0);
  });
});

describe("two devices", () => {
  it("notices an arm one tick further up", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "reach" })]);
    ticks(world, 10);
    const before = hashWorld(world);
    world.reachMilli += 1;
    expect(hashWorld(world)).not.toBe(before);
  });
});
