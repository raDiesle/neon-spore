import { expect, test } from "bun:test";
import { step } from "../src/index.js";
import { mazeEntranceX } from "../src/maze.js";
import { mazeCurrent } from "../src/maze-state.js";
import { CFG, drag, install, mazeOf, send, settle, untilReading } from "./maze-fixture.js";

/**
 * THE MAZE's lever after the hand has decided (`maze-catch.ts`): the knob
 * stays where it is let go, a release coasts on a little unless it is in a
 * click, and a catch eases the wheel onto the column instead of jumping. The
 * owner, 5 October 2026.
 */

const lift = { kind: "drag", target: "mazeString", on: false, fromMilli: 0 } as const;
const at = (fromMilli: number) =>
  ({ kind: "drag", target: "mazeString", on: true, fromMilli }) as const;

test("the knob stays where it was let go, and the next grab starts there", () => {
  const world = install();
  untilReading(world);
  drag(world, 50, 100);
  send(world, 1, lift);
  settle(world);
  const kept = mazeOf(world).leverMilli;
  expect(kept).toBeGreaterThanOrEqual(100);
  send(world, 1, at(0));
  expect(mazeOf(world).leverGrabMilli).toBe(kept);
  expect(mazeOf(world).leverMilli).toBe(kept);
});

test("a release out of a click coasts on the way the hand was going, and stops", () => {
  const world = install();
  untilReading(world);
  // A short fling to the left, clear of every column.
  drag(world, -30, -60, -90);
  if (mazeOf(world).lockedWay >= 0) throw new Error("the fling caught a column");
  const before = mazeOf(world).angleMilli;
  send(world, 1, lift);
  expect(mazeOf(world).glideMilli).toBeLessThan(0);
  expect(Math.abs(mazeOf(world).glideMilli)).toBeLessThanOrEqual(CFG.mazeGlideMaxMilli);
  settle(world);
  const m = mazeOf(world);
  // Further the way it was going, unless the coast caught a column first.
  if (m.lockedWay < 0) expect(m.angleMilli).toBeLessThan(before);
  const rested = m.angleMilli;
  for (let i = 0; i < 60; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(rested);
});

test("a hand that stopped before it let go does not coast", () => {
  const world = install();
  untilReading(world);
  drag(world, -30, -60);
  for (let i = 0; i < 12; i++) send(world, 1, at(-60));
  send(world, 1, lift);
  expect(mazeOf(world).glideMilli).toBe(0);
});

test("a catch eases onto the column over a few ticks, and a release there stays", () => {
  const world = install();
  untilReading(world);
  let f = 0;
  while (mazeOf(world).lockedWay < 0 && f > -40_000) {
    f -= 40;
    send(world, 1, at(f));
  }
  const m = mazeOf(world);
  expect(m.lockedWay).toBeGreaterThanOrEqual(0);
  // The lock is taken at once; the wheel is on the column within half a second.
  let ticks = 0;
  while (mazeOf(world).settleMilli !== 0 && ticks < 60) {
    step(world, []);
    ticks++;
  }
  expect(ticks).toBeLessThan(30);
  const wheel = mazeCurrent(m);
  if (wheel === null) throw new Error("no wheel");
  const x = mazeEntranceX(CFG, wheel, m.angleMilli, m.lockedWay);
  expect(Math.abs(x - (m.lockedCol * 1000 + 500))).toBeLessThanOrEqual(2);
  // A last slip of the lifting thumb, short of the break, and the lift: held.
  const caught = m.angleMilli;
  send(world, 1, at(f - CFG.mazeDragBreakMilli + 1));
  send(world, 1, lift);
  expect(mazeOf(world).glideMilli).toBe(0);
  for (let i = 0; i < 60; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(caught);
  expect(mazeOf(world).lockedWay).toBe(m.lockedWay);
});
