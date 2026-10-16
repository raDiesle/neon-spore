import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { fieldHand } from "../src/autopilot-field-hand.js";

/**
 * **AUTO plays THE COUNT to a clear** (`autopilot-count.ts`). Each body takes
 * a shot only on its zero, and two of them are on the field at once from beat
 * 19; the field hand fired the moment it stood under one, shut it every time,
 * and lost the wave to the second (`docs/spec/wave-curriculum-today.md`, 14
 * October 2026). The count's phase is rolled off the world's stream, so the
 * wave is played on several seeds.
 */

/** THE COUNT's own arrivals (in `content/waves/`), written out: this package has no content. */
const THE_COUNT: SpawnEntry[] = [
  { beat: 0, col: 5, kind: "countdown", color: "red" },
  { beat: 8, col: 2, kind: "countdown", color: "cyan" },
  { beat: 18, col: 3, kind: "countdown", color: "red" },
  { beat: 19, col: 8, kind: "countdown", color: "cyan" },
];

/** Past this the wave is lost however the hull stands: it clears in about thirty beats. */
const LIMIT_BEATS = 120;

function played(seed: number): { cleared: boolean; heard: SimEvent[] } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, THE_COUNT, [], null);
  const heard: SimEvent[] = [];
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  while (world.tick < stop && world.restBeat === 0 && !failHolds(world)) {
    step(
      world,
      fieldHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return { cleared: world.restBeat !== 0, heard };
}

describe("THE COUNT, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5])("clears on seed %i, every body shot on its zero", (seed) => {
    const { cleared, heard } = played(seed);
    expect(cleared).toBe(true);
    expect(heard.filter((e) => e.type === "reject").length).toBe(0);
  });
});
