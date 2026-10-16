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
import { autopilotHand } from "../src/autopilot-hands.js";

/**
 * **AUTO plays THE LEAD to the end**, and not only the boss. Its lean throws
 * torches at the hull from the first beats and its hand never moved the
 * shield, so the first one landed on beat 6
 * (`docs/spec/wave-curriculum-today.md`, 14 October 2026). The shield's half
 * plays beside the lead's own hand now.
 */

/** THE LEAD's arrivals (in `content/waves/`), written out: this package has no content. */
const ARRIVALS: SpawnEntry[] = [
  { beat: 10, col: 3, kind: "meteor", color: null },
  { beat: 18, col: 0, kind: "slick", color: "red" },
  { beat: 26, col: 7, kind: "meteor", color: null },
  { beat: 36, col: 10, kind: "slick", color: "cyan" },
  { beat: 46, col: 2, kind: "meteor", color: null },
  { beat: 58, col: 0, kind: "slick", color: "cyan" },
  { beat: 70, col: 8, kind: "meteor", color: null },
  { beat: 84, col: 10, kind: "slick", color: "red" },
];

/** Past this the fight is lost however it stands: it falls in about forty beats. */
const LIMIT_BEATS = 300;

function played(seed: number): { cleared: boolean; breaches: number } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, ARRIVALS, [], { kind: "lead" });
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  let breaches = 0;
  while (world.tick < stop && world.restBeat === 0 && !failHolds(world)) {
    const hand = autopilotHand(world);
    step(
      world,
      (hand?.(world) ?? []).map((c) => ({ ...c, tick: world.tick })),
    );
    breaches += world.events.filter((e) => e.type === "breach").length;
  }
  return { cleared: world.restBeat !== 0, breaches };
}

describe("THE LEAD, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5])("falls on seed %i with nothing on the hull", (seed) => {
    expect(played(seed)).toEqual({ cleared: true, breaches: 0 });
  });
});
