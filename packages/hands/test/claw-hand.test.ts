import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  type PodEntry,
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
 * **And the whole wave**, which is its pods alone since 16 October 2026: its
 * rocks were answered by a ward or a purge held on the arm, and when the owner
 * rejected both cargoes nothing on this panel could answer a rock at all.
 */

/** THE CLAW's own pods (in `content/waves/`), written out: this package has no content. */
const THE_CLAW_PODS: PodEntry[] = [
  { beat: 2, col: 0, row: 4, kind: "pod", cross: 1 },
  { beat: 18, col: 10, row: 6, kind: "pod", cross: -1 },
  { beat: 34, col: 0, row: 3, kind: "pod", cross: 1, speed: 3 },
  { beat: 50, col: 10, row: 5, kind: "pod", cross: -1 },
];

/** Every pod is spawned and gone by about beat 60. */
const LIMIT_BEATS = 70;

function played(
  arm: boolean,
  seed = 1,
  pods: PodEntry[] = THE_CLAW_PODS,
): { failed: boolean; taken: number; cleared: boolean } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, [], pods, null);
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  while (world.tick < stop && !failHolds(world) && world.restBeat === 0) {
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
    expect(played(true)).toEqual({ failed: false, taken: 4, cleared: true });
  });

  it("the arm is the panel's: without it the field hand plays, and the first pod is lost", () => {
    expect(played(false)).toMatchObject({ failed: true, taken: 0 });
  });

  it.each([1, 2, 3])("clears the whole wave on seed %i", (seed) => {
    expect(played(true, seed)).toEqual({ failed: false, taken: 4, cleared: true });
  });

  // A pod let go at the hull lands in the cannon's column or is lost: the arm
  // went for the second pod as soon as the first was home, and dropped it.
  it("waits under a pod falling home before it reaches for one from the other edge", () => {
    const pods: PodEntry[] = [
      { beat: 0, col: 0, row: 4, kind: "pod", cross: 1 },
      { beat: 6, col: 10, row: 5, kind: "pod", cross: -1 },
    ];
    expect(played(true, 1, pods)).toEqual({ failed: false, taken: 2, cleared: true });
  });
});
