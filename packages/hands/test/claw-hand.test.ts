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
 * The pods alone, not the wave: its rocks have no answer on this panel yet
 * (`docs/queue.md`, "THE CLAW's rocks have no answer").
 */

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

function played(arm: boolean): { failed: boolean; taken: number } {
  const world = createWorld(DEFAULT_CONFIG, 1);
  startWave(world, 0, [], THE_CLAW_PODS, null);
  const stop = LIMIT_BEATS * ticksPerBeat(world.cfg);
  while (world.tick < stop && !failHolds(world)) {
    const hand = autopilotHand(world, arm);
    step(
      world,
      (hand?.(world) ?? []).map((c) => ({ ...c, tick: world.tick })),
    );
  }
  return { failed: failHolds(world), taken: world.balance.podsTaken };
}

describe("THE CLAW's pods, played by AUTO", () => {
  it("takes all four on the arm, and none crosses the field", () => {
    expect(played(true)).toEqual({ failed: false, taken: 4 });
  });

  it("the arm is the panel's: without it the field hand plays, and the first pod is lost", () => {
    expect(played(false)).toEqual({ failed: true, taken: 0 });
  });
});
