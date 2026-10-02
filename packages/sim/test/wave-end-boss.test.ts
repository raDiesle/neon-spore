import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PodEntry,
  type SimConfig,
  type SpawnEntry,
  sinewBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **A boss that has left ends its wave** (`dropScriptAfterBoss`). The owner,
 * 2 October 2026: THE SINEW was beaten on beat 42 and its wave went on
 * sending what was authored for beats 52 to 80.
 *
 * THE SINEW stands in for every boss whose wave authors arrivals beside it,
 * and it is taken off the way its own fight ends — the mass walked clear
 * (`outBeat`) — rather than by nulling `world.boss` from here, so the test is
 * about the path a pair takes and not one only a test can.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true, sinewEnterBeats: 0 };
const TPB = ticksPerBeat(CFG);

const LATE = 60;
const QUEUE: SpawnEntry[] = [
  { beat: 2, col: 3, kind: "meteor", color: null },
  { beat: LATE, col: 1, kind: "meteor", color: null },
  { beat: LATE + 4, col: 5, kind: "meteor", color: null },
];
const PODS: PodEntry[] = [{ beat: LATE, col: 2, row: 2, kind: "purge" }];

function stand(boss: boolean): World {
  const world = createWorld({ ...CFG }, 0);
  // No pods without the boss: a pod nobody takes holds its wave open for ever
  // (`beat.ts`), which is a different rule from this one.
  startWave(world, 0, [...QUEUE], boss ? [...PODS] : [], boss ? { kind: "sinew" } : null);
  return world;
}

function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Beats until the wave is cleared, or `cap` if it never is. */
function beatsToClear(world: World, cap: number): number {
  for (let n = 1; n <= cap; n++) {
    beats(world, 1);
    if (world.restBeat !== 0) return n;
  }
  return cap;
}

describe("a boss that has left ends its wave", () => {
  it("drops the arrivals and the pods the script had still to send", () => {
    const world = stand(true);
    beats(world, 8);
    const s = sinewBoss(world);
    if (s === null) throw new Error("no sinew");
    s.outBeat = world.beat;
    for (let n = 0; n < 2 * CFG.sinewOutBeats + 2 && world.boss !== null; n++) beats(world, 1);
    expect(world.boss).toBeNull();
    expect(world.spawned).toBe(world.queue.length);
    expect(world.podSpawned).toBe(world.podQueue.length);
    // Cleared long before the late arrivals' beat, with none of them sent.
    beatsToClear(world, LATE);
    expect(world.restBeat).toBeGreaterThan(0);
    expect(world.waveBeat).toBeLessThan(LATE);
    expect(world.pods).toHaveLength(0);
  });

  it("does not drop a script while the boss stands", () => {
    const world = stand(true);
    beats(world, LATE + 8);
    expect(world.boss).not.toBeNull();
    expect(world.spawned).toBe(world.queue.length);
    expect(world.restBeat).toBe(0);
  });

  it("leaves a wave with no boss to play its whole script", () => {
    const world = stand(false);
    beatsToClear(world, LATE + 40);
    expect(world.restBeat).toBeGreaterThan(0);
    expect(world.waveBeat).toBeGreaterThan(LATE + 4);
  });
});
