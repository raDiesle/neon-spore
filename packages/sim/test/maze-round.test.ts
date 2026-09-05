import { expect, test } from "bun:test";
import { step } from "../src/index.js";
import { MAZE_LEAD_BEATS, MAZE_TRAVEL_BEATS, mazeReadBeats } from "../src/maze-clock.js";
import { mazeHeartColor } from "../src/maze-round.js";
import { mazeCoreEntrance } from "../src/maze-wheel.js";
import {
  CFG,
  clickOnto,
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
 * THE MAZE, played out headlessly: the round.
 *
 * The middle takes a share of the boss, a dead end breaks the hull in the
 * column the shot went up and leaves the wheel standing for another go, and
 * saying nothing at all costs the same as a dead end.
 */

test("the wheel opens quiet, and the string does nothing until it does not", () => {
  const world = install();
  expect(mazeOf(world).phase).toBe("lead");
  for (let i = 0; i < TPB * (MAZE_LEAD_BEATS - 1); i++) step(world, []);
  expect(mazeOf(world).phase).toBe("lead");
  for (let i = 0; i < TPB * 2; i++) step(world, []);
  expect(mazeOf(world).phase).toBe("read");
  expect(MAZE_TRAVEL_BEATS).toBeGreaterThan(0);
});

test("a shot from anywhere but the lit column is not an answer at all", () => {
  const world = install();
  untilReading(world);
  const col = clickOnto(world, mazeCoreEntrance(WHEELS[0]!));
  send(world, 1, { kind: "cannonCol", col: col === 0 ? col + 1 : col - 1 });
  send(world, 2, { kind: "fire", color: "red" });
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).way).toBe(-1);
});

test("the way in that reaches the middle takes a share of the boss", () => {
  const world = install();
  untilReading(world);
  const answer = mazeCoreEntrance(WHEELS[0]!);
  const hull = world.hullMilli;
  const seen = fireInto(world, answer);
  expect(mazeOf(world).phase).toBe("travel");

  seen.push(...past(world, "travel", TPB * 200));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: true });
  // The shot is watched all the way in, one report per cell it stands on.
  expect(seen.filter((e) => e.type === "mazeProbe").length).toBe(
    WHEELS[0]!.entrances[answer]!.route.length,
  );
  expect(world.hullMilli).toBe(hull);
  expect(mazeOf(world).hullMilli).toBe(100_000 - Math.round(100_000 / WHEELS.length));
});

test("a dead end costs the hull and leaves the wheel standing for another go", () => {
  const world = install();
  untilReading(world);
  const answer = mazeCoreEntrance(WHEELS[0]!);
  const dud = (answer + 1) % WHEELS[0]!.entrances.length;
  const before = world.hullMilli;
  const col = (() => {
    const c = clickOnto(world, dud);
    send(world, 1, { kind: "cannonCol", col: c });
    send(world, 2, { kind: "fire", color: "red" });
    return c;
  })();
  const seen = past(world, "travel", TPB * 200);
  const breach = seen.filter((e) => e.type === "breach");
  expect(breach).toHaveLength(1);
  expect(breach[0]).toMatchObject({ col });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);

  // The verdict stands, and then the same wheel is there to try again — with
  // the dead end remembered, which is what the next attempt is talked about.
  past(world, "verdict", TPB * (1 + 8));
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).round).toBe(0);
  expect(mazeOf(world).tried).toEqual([dud]);
  expect(mazeOf(world).hullMilli).toBe(100_000);
});

test("saying nothing at all costs the same as a dead end", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const seen = past(world, "read", TPB * (mazeReadBeats(WHEELS[0]!.entrances.length) + 4));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: false, reason: "silence" });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);
});

/**
 * The round's other half, and the reason the heart is drawn in a colour at all:
 * it takes its own and refuses the other, and refusing costs the hull exactly
 * as a dead end does. Without this the walk could not be got wrong once the
 * sheet became a real maze — every gap in a perfect maze's rim reaches the
 * middle, so the only way left to lose was the clock.
 */
test("the heart takes its own colour, and the other one costs the hull", () => {
  const world = install();
  untilReading(world);
  const before = world.hullMilli;
  const wrong = mazeHeartColor(0) === "red" ? "cyan" : "red";
  const col = clickOnto(world, mazeCoreEntrance(WHEELS[0]!));
  send(world, 1, { kind: "cannonCol", col });
  send(world, 2, { kind: "fire", color: wrong });
  // It still goes in and still walks the whole way: what is refused is the
  // arrival, not the entry.
  expect(mazeOf(world).phase).toBe("travel");
  const seen = past(world, "travel", TPB * 400);
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: false, reason: "color" });
  expect(before - world.hullMilli).toBe(CFG.damageMaze * 1000);
  expect(mazeOf(world).hullMilli).toBe(100_000);
});

test("three wheels finished bring it down", () => {
  const world = install();
  for (let round = 0; round < WHEELS.length; round++) {
    untilReading(world);
    expect(mazeOf(world).round).toBe(round);
    fireInto(world, mazeCoreEntrance(WHEELS[round]!));
    past(world, "travel", TPB * 200);
    past(world, "verdict", TPB * 8);
  }
  expect(world.boss).toBeNull();
});
