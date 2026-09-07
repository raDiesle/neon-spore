import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { rockCrosses, rockCrossRow, rockHeading, rockMayCross } from "../src/rock-cross.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * **A rock authored onto a crossing**, which is the first route in this game
 * that is a field on an arrival rather than a kind in the bestiary.
 *
 * Three things are checked and they are the three the creature is made of: it
 * falls to the row the wave named and no further, it walks that row and turns
 * at the walls, and it sinks only at a turn — so it reaches the ship and the
 * wave can end. The fingerprint is checked for `coil.test.ts`'s reason: a
 * heading two devices disagreed about is two devices holding one rock over two
 * lanes, and only one of them wards it.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const crossing = (col: number, row: number, cross: -1 | 1): SpawnEntry => ({
  beat: 0,
  col,
  kind: "meteor",
  color: null,
  cross,
  row,
});

function run(queue: SpawnEntry[], beats: number): World {
  const world = createWorld({ ...CFG }, 7, queue);
  for (let t = 0; t < beats * TPB; t++) step(world, []);
  return world;
}

/** The same run, keeping everything it said on the way. */
function played(queue: SpawnEntry[], beats: number): { world: World; events: SimEvent[] } {
  const world = createWorld({ ...CFG }, 7, queue);
  const events: SimEvent[] = [];
  for (let t = 0; t < beats * TPB; t++) {
    step(world, []);
    events.push(...world.events);
  }
  return { world, events };
}

describe("a rock the wave sends across", () => {
  it("is offered to the tiers and the torch, and never to THE VEER", () => {
    expect(rockMayCross("meteor")).toBe(true);
    expect(rockMayCross("meteorFastest")).toBe(true);
    expect(rockMayCross("torch")).toBe(true);
    // A veer steps sideways by its own rule; a body on two rules at once is
    // exactly what `own-step.ts` exists to prevent.
    expect(rockMayCross("veer")).toBe(false);
    expect(rockMayCross("slick")).toBe(false);
  });

  it("carries the heading and the row the wave authored", () => {
    const world = run([crossing(1, 4, 1)], 1);
    const rock = world.creatures[0];
    expect(rock).toBeDefined();
    expect(rockCrosses(rock!)).toBe(true);
    expect(rockHeading(rock!)).toBe(1);
    expect(rockCrossRow(rock!)).toBe(4);
  });

  it("enters at the wall it walks away from, not at the top", () => {
    const right = run([crossing(4, 4, 1)], 1).creatures[0]!;
    expect(right.col).toBe(0);
    expect(right.row).toBe(4);
    const left = run([crossing(4, 4, -1)], 1).creatures[0]!;
    expect(left.col).toBe(CFG.cols - 1);
    expect(left.row).toBe(4);
  });

  it("is drawn gliding in out of that wall rather than down the field", () => {
    const rock = run([crossing(4, 4, 1)], 1).creatures[0]!;
    expect(rock.fromRow).toBe(4);
    expect(rock.fromCol).toBeLessThan(0);
  });

  it("walks its row a stride a beat", () => {
    const before = run([crossing(4, 4, 1)], 1).creatures[0]!;
    const after = run([crossing(4, 4, 1)], 2).creatures[0]!;
    expect(after.col - before.col).toBe(CFG.rockCrossCols);
    expect(after.row).toBe(before.row);
  });

  it("turns on the wall and sinks only there", () => {
    // Right wall of an eleven-column field is ten; from column one at two a
    // beat that is five strides, the last of which lands on it and turns.
    let seen = false;
    let previous = 4;
    for (let beats = 1; beats <= 10; beats++) {
      const rock = run([crossing(1, 4, 1)], beats).creatures[0];
      if (!rock) break;
      expect(rock.col).toBeGreaterThanOrEqual(0);
      expect(rock.col).toBeLessThanOrEqual(CFG.cols - 1);
      if (rock.row !== previous) {
        expect(rock.row - previous).toBe(CFG.rockCrossDropRows);
        // It sank because it turned: it is standing on a wall.
        expect(rock.col === 0 || rock.col === CFG.cols - 1).toBe(true);
        seen = true;
      }
      previous = rock.row;
    }
    expect(seen).toBe(true);
  });

  it("reaches the ship, so the wave can end", () => {
    const { world, events } = played([crossing(1, 2, 1)], 60);
    expect(world.creatures.length).toBe(0);
    // It arrived rather than evaporating: a rock that left the field would
    // cost the hull nothing, and a wave nobody can lose to is padding.
    expect(events.some((e) => e.type === "breach")).toBe(true);
  });

  it("never goes past the hull row", () => {
    for (let beats = 1; beats <= 40; beats++) {
      const rock = run([crossing(3, 6, -1)], beats).creatures[0];
      if (!rock) continue;
      expect(rock.row).toBeLessThanOrEqual(hullRow(CFG));
    }
  });

  it("is in the fingerprint, heading and row alike", () => {
    const world = run([crossing(1, 4, 1)], 2);
    const before = hashWorld(world);
    world.creatures[0]!.rockDir = -1;
    expect(hashWorld(world)).not.toBe(before);
    world.creatures[0]!.rockDir = 1;
    expect(hashWorld(world)).toBe(before);
    world.creatures[0]!.rockRow = 5;
    expect(hashWorld(world)).not.toBe(before);
  });

  it("leaves a rock that was not sent across exactly as it was", () => {
    const plain: SpawnEntry = { beat: 0, col: 1, kind: "meteor", color: null };
    const world = run([plain], 3);
    const rock = world.creatures[0]!;
    expect(rockCrosses(rock)).toBe(false);
    expect(rock.col).toBe(1);
    expect(rock.row).toBe(2);
  });
});
