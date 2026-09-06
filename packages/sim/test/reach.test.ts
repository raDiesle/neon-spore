import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
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

/**
 * The hull does not mend while these run. It does in the game, and at three
 * percent a second it puts back everything a strike costs inside the arm's own
 * travel — so a test that measured the price after the arm was home would
 * measure nothing at all, which is exactly what the first draft of this file
 * did (`podRepair` is a different number; this is `hullRegenPerSecond`).
 */
const CFG: SimConfig = { ...DEFAULT_CONFIG, hullRegenPerSecond: 0 };
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

  it("comes home again with nothing in the way", () => {
    const world = open();
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Twice the field's height at the arm's own speed, and a beat over.
    ticks(world, TPB * 8);
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

describe("what it closes on", () => {
  it("crushes a body and charges the hull less than the body would have", () => {
    const world = open([{ beat: 0, col: 4, kind: "meteor", color: null }]);
    ticks(world, TPB * 2);
    const rock = world.creatures[0];
    expect(rock, "the wave sent a rock").toBeDefined();
    ticks(world, 1, [press(1, { kind: "cannonCol", col: rock?.col ?? 0 })]);
    const hull = hullPercent(world);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    ticks(world, TPB * 8);
    expect(world.creatures).toHaveLength(0);
    const paid = hull - hullPercent(world);
    // And it left a scar where the hand closed, so the price is on the ship
    // rather than only in a number.
    expect(world.scars.length).toBeGreaterThan(0);
    expect(paid).toBeGreaterThan(0);
    // The whole of why reaching into a rock is an answer rather than a
    // mistake, and why this panel may carry rocks at all.
    expect(CFG.damageReach).toBeLessThan(CFG.damageMeteor);
  });

  it("brings a pod home for the other seat's mouth", () => {
    const world = open([], [{ beat: 0, col: 4, row: 5, kind: "mend" }]);
    ticks(world, TPB);
    expect(world.pods).toHaveLength(1);
    ticks(world, 1, [press(1, { kind: "cannonCol", col: 4 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Up to the pod, closed on it, and back down. The moment the arm is home
    // is the one to look at: from there the pod is falling like any other and
    // a beat later it has already arrived at a mouth that was never opened.
    let held = false;
    let looseAtHome = false;
    for (let i = 0; i < TPB * 8; i++) {
      const wasOut = reachOut(world);
      step(world, []);
      if (world.reachHeld !== 0) held = true;
      if (wasOut && !reachOut(world)) looseAtHome = world.pods[0]?.loose === true;
    }
    expect(held).toBe(true);
    expect(looseAtHome).toBe(true);
  });

  it("lets the other seat take what it brought down", () => {
    const world = open([], [{ beat: 0, col: 4, row: 5, kind: "mend" }]);
    ticks(world, TPB);
    ticks(world, 1, [press(1, { kind: "cannonCol", col: 4 })]);
    ticks(world, 1, [press(1, { kind: "reach" })]);
    // Player 2's mouth, held open through the arrival. The command is the
    // ship's own `intake`; only the panel it sits on differs.
    for (let i = 0; i < TPB * 12; i++) {
      step(world, i % 20 === 0 ? [press(2, { kind: "intake" })] : []);
    }
    expect(mawOpen(world)).toBe(true);
    expect(world.balance.podsTaken).toBeGreaterThan(0);
  });
});

describe("a power-up that crosses the field", () => {
  it("travels its row and leaves at the far side", () => {
    const world = open([], [{ beat: 0, col: 0, row: 4, kind: "mend", cross: 1 }]);
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
    const world = open([], [{ beat: 0, col: 3, row: 4, kind: "mend" }]);
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
