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
 * **AUTO plays BULB QUEEN to the end.** Her torches break off on a clock of
 * their own and reach the hull in a beat, and her hand moved the cannon and
 * the marks but never the shield, so the first one landed on beat 12
 * (`docs/spec/wave-curriculum-today.md`, 14 October 2026). The shield's half
 * of the field hand plays beside hers now, and it triggers on the beat a rock
 * reaches the shield's row however fast it falls. On seed 3 a shot knocked
 * her pod loose and it fell past a shut maw, so a falling pod is caught first.
 */

/** BULB QUEEN's pod (in `content/waves/`), written out: this package has no content. */
const PODS: PodEntry[] = [{ beat: 2, col: 5, row: 4, kind: "purge" }];

/** Past this the fight is lost however it stands: she falls in about eighty beats. */
const LIMIT_BEATS = 200;

function played(seed: number): { cleared: boolean; breaches: number } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, [], PODS, { kind: "queen", col: 5, petals: 9 });
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

describe("BULB QUEEN, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5, 6, 7])("falls on seed %i with no torch on the hull", (seed) => {
    expect(played(seed)).toEqual({ cleared: true, breaches: 0 });
  });
});
