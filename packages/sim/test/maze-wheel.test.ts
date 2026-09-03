import { expect, test } from "bun:test";
import { hashWorld } from "../src/hash.js";
import { step } from "../src/index.js";
import { mazeEntranceCol, mazeEntranceX, mazeWrap } from "../src/maze.js";
import { mazeCurrent } from "../src/maze-round.js";
import { mazeFault } from "../src/maze-wheel.js";
import {
  CFG,
  drag,
  install,
  mazeOf,
  PAIR,
  send,
  THREE,
  TPB,
  untilReading,
} from "./maze-fixture.js";

/**
 * THE MAZE's wheel: what a legal drum is, and the two gestures that turn one.
 *
 * A broken drum is refused rather than played. Then the pilot's thumb on
 * `valve`, and the pilot's hand on the string — everything about the hand is
 * about the wheel keeping up with a *displacement*, how far it has come from
 * where it grabbed, because that is the one thing a string needs and a column
 * cannot give it (`Command` in `types.ts`).
 */

test("a broken wheel is refused rather than played", () => {
  const good = PAIR;
  expect(mazeFault({ ...good, rings: 1 })).not.toBeNull();
  expect(mazeFault({ ...good, entrances: [good.entrances[0]!] })).not.toBeNull();
  expect(mazeFault({ ...good, startMilli: -1 })).not.toBeNull();
  // Two ways to the middle is a round with nothing to choose.
  const twice = { ...good, entrances: [good.entrances[0]!, { ...good.entrances[0]!, sector: 3 }] };
  expect(mazeFault(twice)).not.toBeNull();
  // And a route that steps sideways and inward at once is through a wall.
  const through = {
    ...good,
    entrances: [
      {
        sector: 0,
        route: [
          { ring: good.rings - 1, sector: 0 },
          { ring: good.rings - 2, sector: 1 },
        ],
      },
      good.entrances[1]!,
    ],
  };
  expect(mazeFault(through)).toBe("way 0 steps through a wall at 1");
});

test("the string is the pilot's, and player 2 cannot turn the wheel", () => {
  const world = install();
  untilReading(world);
  const before = mazeOf(world).angleMilli;
  send(world, 2, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(before);
  expect(mazeOf(world).turn).toBe(0);
});

test("a way in clicks onto a column and the wheel stops itself there", () => {
  const world = install();
  untilReading(world);
  send(world, 1, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < 6000 && mazeOf(world).lockedWay < 0; i++) step(world, []);
  const m = mazeOf(world);
  expect(m.lockedWay).toBeGreaterThanOrEqual(0);
  expect(m.lockedCol).toBeGreaterThanOrEqual(0);
  expect(m.turn).toBe(0);
  // Exactly on the column, not merely near it.
  const x = mazeEntranceX(CFG, mazeOf(world).rounds[0]!, m.angleMilli, m.lockedWay);
  expect(Math.abs(x - (m.lockedCol * 1000 + 500))).toBeLessThanOrEqual(2);
  // And it stays there with the thumb still down: only a fresh pull moves on.
  const held = m.angleMilli;
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(held);
  send(world, 1, { kind: "valve", on: true, dir: 1 });
  for (let i = 0; i < TPB; i++) step(world, []);
  expect(mazeOf(world).angleMilli).not.toBe(held);
});

test("two worlds turning the same wheel the same way agree about where it is", () => {
  const a = install();
  const b = install();
  for (const world of [a, b]) {
    untilReading(world);
    send(world, 1, { kind: "valve", on: true, dir: -1 });
    for (let i = 0; i < 900; i++) step(world, []);
  }
  expect(hashWorld(a)).toBe(hashWorld(b));
  expect(mazeOf(a).angleMilli).toBe(mazeOf(b).angleMilli);

  // And two different wheels are two different fingerprints, which is what
  // makes the hash worth taking at all.
  const c = install([PAIR]);
  const d = install([THREE]);
  expect(hashWorld(c)).not.toBe(hashWorld(d));
});

/**
 * A tenth of a tile: far enough to move the wheel plainly and short of the
 * nearest detent, so these cases are about the arithmetic and not about the
 * click. The cases that *are* about the click pull much further.
 */
const SHORT = 100;

test("the wheel follows the hand, by the distance it has come from the grab", () => {
  const world = install();
  untilReading(world);
  const from = mazeOf(world).angleMilli;
  drag(world, SHORT);
  expect(mazeOf(world).lockedWay).toBe(-1);
  expect(mazeOf(world).angleMilli).toBe(mazeWrap(from + (SHORT * CFG.mazeDragMilliPerTile) / 1000));
  // And back to the grab is back where it started: the hand names a place on
  // the string, so a pull undone is a wheel undone.
  drag(world, SHORT, 0);
  expect(mazeOf(world).angleMilli).toBe(from);
});

test("a hand that pulls the other way turns it the other way", () => {
  const right = install();
  const left = install();
  untilReading(right);
  untilReading(left);
  const from = mazeOf(right).angleMilli;
  drag(right, SHORT);
  drag(left, -SHORT);
  // Only the sides, not the exact angles: this wheel opens with a way in close
  // enough to its left that a short pull clicks straight into it, which is the
  // detent doing its job rather than the arithmetic doing something else.
  expect(mazeOf(right).angleMilli).toBeGreaterThan(from);
  expect(mazeOf(left).angleMilli).toBeLessThan(from);
});

/**
 * The whole reason the command carries a distance from the grab rather than a
 * step since the last message. A move that never arrived has to cost nothing:
 * the next one says where the hand is, not how far it moved, so the wheel ends
 * up in the same place either way.
 */
test("a drag that lost half its messages lands where one that lost none did", () => {
  const every = install();
  const some = install();
  untilReading(every);
  untilReading(some);
  drag(every, 20, 40, 60, 80, 100);
  drag(some, 40, 100);
  expect(mazeOf(some).angleMilli).toBe(mazeOf(every).angleMilli);
});

test("an entrance settles onto a column rather than drifting past it", () => {
  const world = install();
  untilReading(world);
  // A slow pull, the way a hand actually moves, until something clicks.
  for (let f = 0; f < 40_000 && mazeOf(world).lockedWay < 0; f += 40) {
    send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: f });
  }
  const m = mazeOf(world);
  expect(m.lockedWay).toBeGreaterThanOrEqual(0);
  expect(m.lockedCol).toBeGreaterThanOrEqual(0);
  // Standing *on* the column, not merely near it, which is what lets the pair
  // say a number out loud.
  const wheel = mazeCurrent(m);
  if (wheel === null) throw new Error("no wheel");
  expect(mazeEntranceCol(CFG, wheel, m.angleMilli, m.lockedWay)).toBe(m.lockedCol);

  // And it holds there while the hand carries on, instead of being pulled
  // straight off again by the very next message. The snapped angle is the new
  // zero, so the pull has to be worth a step before anything moves at all.
  const settled = m.angleMilli;
  const col = m.lockedCol;
  const caught = m.dragFromMilli;
  for (const nudge of [1, 20, CFG.mazeDragBreakMilli - 1]) {
    send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: caught + nudge });
    expect(mazeOf(world).angleMilli).toBe(settled);
    expect(mazeOf(world).lockedCol).toBe(col);
  }
  // Carrying on past the break lets go of it, which is the other half.
  send(world, 1, {
    kind: "drag",
    target: "mazeString",
    on: true,
    fromMilli: caught + CFG.mazeDragBreakMilli,
  });
  expect(mazeOf(world).angleMilli).not.toBe(settled);
});

test("carrying on past a detent pulls out of it and into the next", () => {
  const world = install();
  untilReading(world);
  let f = 0;
  const stopAt = (want: number): number => {
    for (let i = 0; i < 4000; i++) {
      f += 40;
      send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: f });
      if (mazeOf(world).lockedWay >= 0 && mazeOf(world).angleMilli !== want) {
        return mazeOf(world).angleMilli;
      }
    }
    throw new Error("nothing clicked");
  };
  const first = stopAt(-1);
  const second = stopAt(first);
  expect(second).not.toBe(first);
});

test("the hand takes the wheel off the thumb, and the lift does not undo it", () => {
  const world = install();
  untilReading(world);
  send(world, 1, { kind: "valve", on: true, dir: 1 });
  expect(mazeOf(world).turn).toBe(1);
  send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: 0 });
  expect(mazeOf(world).turn).toBe(0);
  const held = mazeOf(world).angleMilli;
  send(world, 1, { kind: "drag", target: "mazeString", on: false, fromMilli: 0 });
  expect(mazeOf(world).dragging).toBe(false);
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  expect(mazeOf(world).angleMilli).toBe(held);
});

test("only the pilot may pull it", () => {
  const world = install();
  untilReading(world);
  const from = mazeOf(world).angleMilli;
  send(world, 2, { kind: "drag", target: "mazeString", on: true, fromMilli: 0 });
  send(world, 2, { kind: "drag", target: "mazeString", on: true, fromMilli: 4000 });
  expect(mazeOf(world).angleMilli).toBe(from);
});

test("a fresh grab measures from where the wheel now stands, not from the last one", () => {
  const world = install();
  untilReading(world);
  drag(world, 1000);
  const after = mazeOf(world).angleMilli;
  send(world, 1, { kind: "drag", target: "mazeString", on: false, fromMilli: 0 });
  // The hand comes back at the same displacement it let go at. Nothing should
  // move: a grab is its own origin.
  send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: 1000 });
  expect(mazeOf(world).angleMilli).toBe(after);
});

test("two worlds dragged the same way agree about where the wheel is", () => {
  const a = install();
  const b = install();
  for (const world of [a, b]) {
    untilReading(world);
    for (let f = 0; f <= 3000; f += 37) {
      send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: f });
    }
  }
  expect(hashWorld(a)).toBe(hashWorld(b));
  expect(Number.isInteger(mazeOf(a).angleMilli)).toBe(true);
});
