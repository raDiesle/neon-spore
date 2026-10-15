import { describe, expect, it } from "bun:test";
import {
  type BossEntry,
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
 * **AUTO plays THE CURTAIN and THE TASTER to the end**, and not only the
 * boss. Each hand answered its boss and nothing that fell, so AUTO lost both
 * (`docs/spec/wave-curriculum-today.md`, 14 October 2026): THE CURTAIN's torch
 * landed on beat 11 with the shield parked a column off, and THE TASTER's
 * wave sends rocks and slimes past a cannon busy on the blades. THE CURTAIN
 * plays the shield's half beside its own now; THE TASTER plays the field hand
 * first and the blades when the field is quiet.
 */

/** THE TASTER's arrivals (`content/waves/act-7g.ts`), written out: this package has no content. */
const TASTER_ARRIVALS: SpawnEntry[] = [
  { beat: 16, col: 2, kind: "meteor", color: null },
  { beat: 24, col: 8, kind: "meteor", color: null },
  { beat: 30, col: 5, kind: "slick", color: "red" },
  { beat: 36, col: 0, kind: "slick", color: "cyan" },
  { beat: 44, col: 10, kind: "meteor", color: null },
  { beat: 50, col: 3, kind: "slick", color: "red" },
  { beat: 56, col: 7, kind: "slick", color: "cyan" },
  { beat: 64, col: 5, kind: "meteor", color: null },
  { beat: 72, col: 2, kind: "slick", color: "cyan" },
  { beat: 80, col: 8, kind: "slick", color: "red" },
];

/** Past this the fight is lost however it stands: each falls in under fifty beats. */
const LIMIT_BEATS = 300;

function played(
  seed: number,
  entries: SpawnEntry[],
  boss: BossEntry,
): { cleared: boolean; breaches: number } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, entries, [], boss);
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

describe("THE CURTAIN and THE TASTER, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5])("THE CURTAIN falls on seed %i with nothing on the hull", (seed) => {
    expect(played(seed, [], { kind: "curtain" })).toEqual({ cleared: true, breaches: 0 });
  });
  it.each([1, 2, 3, 4, 5])("THE TASTER falls on seed %i with nothing on the hull", (seed) => {
    expect(played(seed, TASTER_ARRIVALS, { kind: "taster" })).toEqual({
      cleared: true,
      breaches: 0,
    });
  });
});
