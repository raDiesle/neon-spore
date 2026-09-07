import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { rockCrosses, rockCrossRow, rockHeading, rockMayCross } from "../src/rock-cross.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * **A rock the wave sent across the field**, which is the first route in this
 * game that is a field on an arrival rather than a kind in the bestiary.
 *
 * Four things are checked and they are the four the creature is made of: it
 * enters at the wall it walks away from rather than at the top, it holds its
 * row for the whole of its life, it **leaves the field at the far side and is
 * gone** — never turning, never sinking, never reaching the ship — and the
 * wave clears behind it. The fingerprint is checked for `coil.test.ts`'s
 * reason: a heading two devices disagreed about is two devices with one rock
 * on opposite sides of the field.
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

  it("enters at the wall it walks away from, not at the top", () => {
    const right = run([crossing(4, 4, 1)], 1).creatures[0]!;
    expect(right.col).toBe(0);
    expect(right.row).toBe(4);
    expect(rockCrosses(right)).toBe(true);
    expect(rockHeading(right)).toBe(1);
    expect(rockCrossRow(right)).toBe(4);

    const left = run([crossing(4, 4, -1)], 1).creatures[0]!;
    expect(left.col).toBe(CFG.cols - 1);
    expect(left.row).toBe(4);
  });

  it("is drawn gliding in out of that wall rather than down the field", () => {
    const rock = run([crossing(4, 4, 1)], 1).creatures[0]!;
    expect(rock.fromRow).toBe(4);
    expect(rock.fromCol).toBeLessThan(0);
  });

  it("holds its row for the whole crossing", () => {
    for (let beats = 1; beats <= 6; beats++) {
      const rock = run([crossing(4, 4, 1)], beats).creatures[0];
      if (!rock) break;
      expect(rock.row).toBe(4);
    }
  });

  it("walks a stride a beat", () => {
    const before = run([crossing(4, 4, 1)], 1).creatures[0]!;
    const after = run([crossing(4, 4, 1)], 2).creatures[0]!;
    expect(after.col - before.col).toBe(CFG.rockCrossCols);
  });

  /**
   * The owner's own correction, and the whole of what makes this a window
   * rather than an arrival: it goes out of the far side and is gone, instead
   * of turning, dropping a row and going on being on the screen.
   */
  it("leaves the field at the far side and never comes back", () => {
    for (const dir of [1, -1] as const) {
      const { world, events } = played([crossing(3, 4, dir)], 30);
      expect(world.creatures).toHaveLength(0);
      // It left; it did not arrive. Nothing was broken and nothing was warded.
      expect(events.some((e) => e.type === "breach")).toBe(false);
      expect(world.hullMilli).toBe(100 * 1000);
    }
  });

  it("never touches the hull row on the way, whatever row it was given", () => {
    for (const row of [0, 6, hullRow(CFG), hullRow(CFG) + 4]) {
      for (let beats = 1; beats <= 12; beats++) {
        const rock = run([crossing(3, row, 1)], beats).creatures[0];
        if (!rock) continue;
        expect(rock.row).toBeLessThan(hullRow(CFG));
      }
    }
  });

  it("clears the wave behind it", () => {
    const world = run([crossing(3, 4, 1)], 30);
    expect(world.creatures).toHaveLength(0);
    expect(world.spawned).toBe(1);
  });

  it("is in the fingerprint, heading and row alike", () => {
    const world = run([crossing(4, 4, 1)], 2);
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
