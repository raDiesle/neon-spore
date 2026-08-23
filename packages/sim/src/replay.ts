import { DEFAULT_CONFIG, type SimConfig } from "./config.js";
import { hashWorld } from "./hash.js";
import type { TimedCommand } from "./types.js";
import { createWorld, step, type SpawnEntry, type World } from "./world.js";

/**
 * A replay is the whole test format of this project: inputs in, fingerprint out.
 * What you play by hand in the Director becomes a test file — see
 * docs/working-with-claude.md.
 */
export interface Replay {
  name: string;
  seed: number;
  ticks: number;
  config?: Partial<SimConfig>;
  queue?: SpawnEntry[];
  inputs: TimedCommand[];
  /** Filled in by `record`. A mismatch means determinism broke. */
  expectHash?: number;
}

export function runReplay(replay: Replay): World {
  const cfg: SimConfig = { ...DEFAULT_CONFIG, ...replay.config };
  const world = createWorld(cfg, replay.seed);
  if (replay.queue) world.queue = replay.queue.map((q) => ({ ...q }));

  const byTick = new Map<number, TimedCommand[]>();
  for (const input of replay.inputs) {
    const list = byTick.get(input.tick);
    if (list) list.push(input);
    else byTick.set(input.tick, [input]);
  }

  for (let t = 0; t < replay.ticks; t++) {
    step(world, byTick.get(t) ?? []);
  }
  return world;
}

/** Run once and stamp the resulting fingerprint into the replay. */
export function record(replay: Replay): Replay {
  return { ...replay, expectHash: hashWorld(runReplay(replay)) };
}
