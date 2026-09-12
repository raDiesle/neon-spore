import { expect, test } from "bun:test";
import { type CreatureKind, isWardable, step } from "../src/index.js";
import { mazeBottomCol } from "../src/maze.js";
import {
  MAZE_LEAD_BEATS,
  MAZE_TRAVEL_BEATS,
  MAZE_VERDICT_BEATS,
  mazeReadBeats,
} from "../src/maze-clock.js";
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
  expect(world.retries).toBe(0);
  expect(mazeOf(world).hullMilli).toBe(100_000 - Math.round(100_000 / WHEELS.length));
});

test("a dead end costs the hull and takes the whole stage with it", () => {
  const world = install();
  untilReading(world);
  const answer = mazeCoreEntrance(WHEELS[0]!);
  const dud = (answer + 1) % WHEELS[0]!.entrances.length;
  // The hull is held: the test is about what the round does next, and a hit
  // would otherwise stop the field for the retry (`wave-fail.ts`).
  world.cfg = { ...CFG, hullInvulnerable: true };
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
  expect(mazeOf(world).lost).toBe("mouth");

  // The verdict stands, the drum comes apart over the ship, and the *same*
  // stage is built again from the top: back at its opening angle with nothing
  // ruled out. The boss's own hull is untouched — a stage lost is a stage
  // repeated, never a stage undone.
  past(world, "verdict", TPB * (1 + 8));
  expect(mazeOf(world).phase).toBe("lead");
  expect(mazeOf(world).round).toBe(0);
  expect(mazeOf(world).tried).toEqual([]);
  expect(mazeOf(world).angleMilli).toBe(WHEELS[0]!.startMilli);
  expect(mazeOf(world).hullMilli).toBe(100_000);
  untilReading(world);
  expect(mazeOf(world).phase).toBe("read");
});

/**
 * The clock is the third way to lose, and the drum is what falls for it.
 *
 * Nothing is charged on the beat the clock stops: the maze comes apart over
 * the ship across the verdict and the hull is broken when the pieces land,
 * which is the beat the picture has them touching it (`render/maze-fall.ts`).
 * So the hull is whole for the whole of the verdict and short by the end of
 * it — and the stage is built again from the top, because a drum that came
 * down on the ship is not standing where it was.
 */
test("a clock run out brings the drum down on the ship", () => {
  const world = install();
  untilReading(world);
  // The hull is held: the test is about what the round does next, and a hit
  // would otherwise stop the field for the retry (`wave-fail.ts`).
  world.cfg = { ...CFG, hullInvulnerable: true };
  const seen = past(world, "read", TPB * (mazeReadBeats(WHEELS[0]!.entrances.length) + 4));
  const verdict = seen.filter((e) => e.type === "mazeVerdict");
  expect(verdict).toHaveLength(1);
  expect(verdict[0]).toMatchObject({ right: false, reason: "silence" });
  // It lands in the column the drum stands over, not wherever the cannon was.
  expect(verdict[0]).toMatchObject({ col: mazeBottomCol(CFG) });
  // Nothing yet: the pieces are still in the air.
  expect(seen.filter((e) => e.type === "breach")).toHaveLength(0);

  const landing = past(world, "verdict", TPB * (MAZE_VERDICT_BEATS + 4));
  const breach = landing.filter((e) => e.type === "breach");
  expect(breach).toHaveLength(1);
  expect(breach[0]).toMatchObject({ col: mazeBottomCol(CFG) });
  // And not as a rock: a meteor replayed on top of the falling drum would be
  // two arrivals for one failure (`sim/maze-verdict.ts`).
  expect(isWardable((breach[0] as { kind: CreatureKind }).kind)).toBe(false);

  // The same stage over again, back at its opening angle with nothing ruled
  // out — and the boss no better off for it.
  expect(mazeOf(world).phase).toBe("lead");
  expect(mazeOf(world).round).toBe(0);
  expect(mazeOf(world).tried).toEqual([]);
  expect(mazeOf(world).angleMilli).toBe(WHEELS[0]!.startMilli);
  expect(mazeOf(world).hullMilli).toBe(100_000);
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
  const wrong = mazeHeartColor(0) === "red" ? "cyan" : "red";
  // The hull is held: the test is about what the round does next, and a hit
  // would otherwise stop the field for the retry (`wave-fail.ts`).
  world.cfg = { ...CFG, hullInvulnerable: true };
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
  expect(mazeOf(world).hullMilli).toBe(100_000);

  // **What reaches the ship is the heart's blood, not a rock.** The middle
  // throws the shot back, so the breach carries the heart's own colour and a
  // kind render/ will not replay as a falling meteor — the picture is the gout
  // across the drum and down the panel (`render/maze-spill.ts`), and a rock
  // dropping through it would be a second arrival nobody caused.
  const breach = seen.filter((e) => e.type === "breach");
  expect(breach).toHaveLength(1);
  expect(breach[0]).toMatchObject({ color: mazeHeartColor(0) });
  expect(isWardable((breach[0] as { kind: CreatureKind }).kind)).toBe(false);

  // And the wheel survives it. A shot the heart refused never touched the
  // walls, so the drum is handed straight back standing where it was left —
  // which is the whole difference between this and a dead end.
  past(world, "verdict", TPB * (1 + 8));
  expect(mazeOf(world).phase).toBe("read");
  expect(mazeOf(world).tried).toEqual([mazeCoreEntrance(WHEELS[0]!)]);
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
