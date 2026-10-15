import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type PodEntry,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { autopilotHand } from "../src/autopilot-hands.js";

/**
 * **AUTO catches THE CLAW's pods** (`autopilot-claw.ts`): the arm sent up a
 * column as each pod crosses it, wound home on the crank, and the mouth opened
 * on the other seat. The field hand fired at them on a panel with no colours,
 * and the first one crossed the field and the wave with it
 * (`docs/spec/wave-curriculum-today.md`, 14 October 2026).
 *
 * **And the whole wave**, whose rocks are answered by its pods since the panel
 * has no shield: a ward held on the arm until the rock in the shield's column
 * is close, a purge until the lowest rock is (the owner's answer, 15 October
 * 2026, recomposing the rocks rather than giving the panel a shield).
 */

/** THE CLAW's rocks (`content/waves/act-7c.ts`), written out beside its pods. */
const THE_CLAW: SpawnEntry[] = [
  { beat: 4, col: 5, kind: "meteor", color: null },
  { beat: 14, col: 5, kind: "meteor", color: null },
  { beat: 32, col: 8, kind: "meteorMedium", color: null },
  { beat: 44, col: 7, kind: "meteor", color: null },
  { beat: 46, col: 3, kind: "meteor", color: null },
  { beat: 52, col: 10, kind: "meteorMedium", color: null },
];

/** THE CLAW's own pods (`content/waves/act-7c.ts`), written out: this package has no content. */
const THE_CLAW_PODS: PodEntry[] = [
  { beat: 2, col: 0, row: 4, kind: "ward", cross: 1 },
  { beat: 18, col: 10, row: 6, kind: "ward", cross: -1 },
  { beat: 34, col: 0, row: 3, kind: "purge", cross: 1, speed: 3 },
  { beat: 50, col: 10, row: 5, kind: "purge", cross: -1 },
];

/** Every pod is spawned and gone by about beat 60. Played on past a clear,
 * since a pod not yet spawned does not hold a wave open (`beat.ts`). */
const LIMIT_BEATS = 70;

function played(
  arm: boolean,
  rocks: SpawnEntry[] = [],
  seed = 1,
): { failed: boolean; taken: number; cleared: boolean } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, rocks, THE_CLAW_PODS, null);
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  while (world.tick < stop && !failHolds(world) && (rocks.length === 0 || world.restBeat === 0)) {
    const hand = autopilotHand(world, arm);
    step(
      world,
      (hand?.(world) ?? []).map((c) => ({ ...c, tick: world.tick })),
    );
  }
  return {
    failed: failHolds(world),
    taken: world.balance.podsTaken,
    cleared: world.restBeat !== 0,
  };
}

describe("THE CLAW, played by AUTO", () => {
  it("takes all four on the arm, and none crosses the field", () => {
    expect(played(true)).toMatchObject({ failed: false, taken: 4 });
  });

  it("the arm is the panel's: without it the field hand plays, and the first pod is lost", () => {
    expect(played(false)).toMatchObject({ failed: true, taken: 0 });
  });

  it.each([1, 2, 3])("clears the whole wave on seed %i, every rock answered by a pod", (seed) => {
    expect(played(true, THE_CLAW, seed)).toEqual({ failed: false, taken: 4, cleared: true });
  });
});
