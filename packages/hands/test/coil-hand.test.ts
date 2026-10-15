import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { fieldHand } from "../src/autopilot-field-hand.js";

/**
 * **AUTO opens THE COIL's domes, and lets a crossing rock go by**
 * (`autopilot-coil.ts`). Nearly every wave `bun run waves:compose` drew for
 * THE COIL's block and THE CROSSING's was lost: the shield never stood under a
 * coil, so a coil sank to the hull on any wave without a shield fault to arm
 * the plate by itself, and it chased a crossing rock that leaves by the far
 * wall and never lands (`docs/queue.md`, 14 October 2026).
 *
 * Two composed draws, one from each block, which the field hand lost before.
 */

/** A draw of THE CROSSING's R1: coils among rocks crossing three rows. */
const CROSSING_R1: SpawnEntry[] = [
  { beat: 0, col: 2, kind: "meteor", color: null, cross: -1, row: 6 },
  { beat: 8, col: 0, kind: "coil", color: null },
  { beat: 16, col: 2, kind: "meteor", color: null, cross: 1, row: 9 },
  { beat: 23, col: 5, kind: "coil", color: null },
  { beat: 29, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
];

/** A draw of THE COIL's R2: two coils among magnets and wisps. */
const COIL_R2: SpawnEntry[] = [
  { beat: 0, col: 2, kind: "coil", color: null },
  { beat: 7, col: 0, kind: "magnet", color: "red" },
  { beat: 14, col: 2, kind: "wisp", color: null },
  { beat: 20, col: 5, kind: "coil", color: null },
  { beat: 25, col: 8, kind: "magnet", color: "cyan" },
  { beat: 30, col: 3, kind: "wisp", color: null },
];

/** Past this the wave is lost however the hull stands: both clear in about forty beats. */
const LIMIT_BEATS = 120;

function clears(queue: SpawnEntry[], seed: number): boolean {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, queue, [], null);
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  while (world.tick < stop && world.restBeat === 0 && !failHolds(world)) {
    step(
      world,
      fieldHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
  }
  return world.restBeat !== 0;
}

describe("THE COIL and THE CROSSING, composed, played by AUTO", () => {
  it.each([1, 2, 3])("clears THE CROSSING's R1 on seed %i", (seed) => {
    expect(clears(CROSSING_R1, seed)).toBe(true);
  });

  it.each([1, 2, 3])("clears THE COIL's R2 on seed %i", (seed) => {
    expect(clears(COIL_R2, seed)).toBe(true);
  });
});
