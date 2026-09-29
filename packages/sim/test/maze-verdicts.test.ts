import { expect, test } from "bun:test";
import { mazeBottomCol } from "../src/maze.js";
import { mazeStringAsks } from "../src/maze-controls.js";
import { mazeHeartAsks } from "../src/maze-hand.js";
import { mazeCoreEntrance } from "../src/maze-wheel.js";
import type { Command } from "../src/types.js";
import type { SimEvent, World } from "../src/world.js";
import {
  CFG,
  fireInto,
  install,
  mazeOf,
  past,
  send,
  TPB,
  untilReading,
  WHEELS,
} from "./maze-fixture.js";

/**
 * THE MAZE's string and heart answering a touch the way every mark does:
 * which part the round asks a hand for (`mazeStringAsks`, `mazeHeartAsks`),
 * and a press on a part from the seat it is not asked of refused and said,
 * once (`mazeRefuse`) — `maze-controls.ts`, `maze-hand.ts`.
 * `maze-gestures.test.ts` holds the gestures themselves.
 */

function held(): World {
  const world = install();
  untilReading(world);
  fireInto(world, mazeCoreEntrance(WHEELS[0]!));
  past(world, "travel", TPB * 200);
  expect(mazeOf(world).phase).toBe("grip");
  return world;
}

const heart = (on: boolean, fromYMilli = 0): Command => ({
  kind: "drag",
  target: "mazeHeart",
  on,
  fromMilli: 0,
  fromYMilli,
});
const string = (on: boolean): Command => ({ kind: "drag", target: "mazeString", on, fromMilli: 0 });
const said = (seen: SimEvent[]) => seen.filter((e) => e.type === "mazeRefuse");

test("the string is asked while the wheel turns; the heart only while it holds", () => {
  const world = install();
  expect(mazeStringAsks(mazeOf(world))).toBe(false);
  untilReading(world);
  expect(mazeStringAsks(mazeOf(world))).toBe(true);
  expect(mazeHeartAsks(mazeOf(world))).toBe(false);
  const grip = held();
  expect(mazeStringAsks(mazeOf(grip))).toBe(false);
  expect(mazeHeartAsks(mazeOf(grip))).toBe(true);
});

test("the pilot's thumb on the heart is taken like the navigator's, and refused nothing", () => {
  const world = held();
  const seen = send(world, 1, heart(true));
  expect(said(seen)).toEqual([]);
  expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: true });
  expect(mazeOf(world).gripSeats).toBe(1);
});

test("the navigator's hand on the string is refused, once, and turns and braces nothing", () => {
  const world = install();
  untilReading(world);
  const angle = mazeOf(world).angleMilli;
  const seen = send(world, 2, string(true));
  expect(said(seen)).toEqual([
    { type: "mazeRefuse", col: mazeBottomCol(CFG), part: "string", player: 2 },
  ]);
  expect(mazeOf(world).dragging).toBe(false);
  expect(mazeOf(world).angleMilli).toBe(angle);
  expect(said(send(world, 2, string(false)))).toEqual([]);
  // Under `grip` the string is asked of nobody, so a press on it says nothing.
  const grip = held();
  expect(said(send(grip, 2, string(true)))).toEqual([]);
  expect(mazeOf(grip).dragging).toBe(false);
});

test("a press on a part nobody is asked for says nothing", () => {
  const world = install();
  expect(said(send(world, 2, string(true)))).toEqual([]);
  untilReading(world);
  expect(said(send(world, 1, heart(true)))).toEqual([]);
  // A thumb on the valve is not a hand on the string, and is only dropped.
  expect(said(send(world, 2, { kind: "valve", on: true, dir: 1 }))).toEqual([]);
});
