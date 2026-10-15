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
import { autopilotHand } from "../src/autopilot-hands.js";
import { vaneHand } from "../src/boss-hands-shots.js";

/**
 * **AUTO plays THE VANE through all four forms to its fall**
 * (`boss-hands-shots.ts`). Every form after the first turns guard arms across
 * the mouths (`sim/vane-guard.ts`), and a shot into one is a `reject` that
 * spends the opening; the hand waits for the gap instead, so the fight is won
 * without a shot refused, on the game's half-beat grid and on none.
 */

function played(shotChargeBeats: number): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, shotChargeBeats };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  const heard: SimEvent[] = [];
  const stop = 400 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      vaneHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE VANE, played by AUTO", () => {
  it.each([
    ["the game's half-beat grid", 0.5],
    ["no grid", 0],
  ])("takes every pin of every form on %s, and no shot is rejected", (_name, charge) => {
    const heard = played(charge);
    const count = (type: SimEvent["type"]) => heard.filter((e) => e.type === type).length;
    const cfg = DEFAULT_CONFIG;
    expect(count("vaneKnock")).toBe(cfg.vanePins + (cfg.vaneForms - 1) * cfg.vaneFormPins);
    expect(count("reject")).toBe(0);
  });
});

/** THE VANE's two arrivals (`content/waves/act-3b-p2.ts`), written out: this package has no content. */
const ARRIVALS: SpawnEntry[] = [
  { beat: 0, col: 2, kind: "meteor", color: null },
  { beat: 3, col: 8, kind: "slick", color: "red" },
];

/**
 * **AUTO plays THE VANE's wave to the end**, and not only the boss. The vane
 * folds the wave's two arrivals into columns of its own and they fall like
 * any others, and its hand answered only the bearing, so the rock landed on
 * beat 16 (`docs/spec/wave-curriculum-today.md`, 14 October 2026). The field
 * hand plays first now, and the bearing takes the thumbs when the field is
 * quiet: nothing the vane does hurts the pair, so it can wait.
 */
function wavePlayed(seed: number): { cleared: boolean; breaches: number } {
  const world = createWorld(DEFAULT_CONFIG, seed);
  startWave(world, 0, ARRIVALS, [], { kind: "vane" });
  const stop = 400 * ticksPerBeat(world.cfg);
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

describe("THE VANE's wave, played by AUTO", () => {
  it.each([1, 2, 3, 4, 5])("clears on seed %i with nothing on the hull", (seed) => {
    expect(wavePlayed(seed)).toEqual({ cleared: true, breaches: 0 });
  });
});
