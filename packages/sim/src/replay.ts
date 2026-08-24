import { startWave } from "./beat.js";
import { DEFAULT_CONFIG, type SimConfig } from "./config.js";
import { hashWorld } from "./hash.js";
import type { TimedCommand } from "./types.js";
import { createWorld, type PodEntry, type SpawnEntry, step, type World } from "./world.js";

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
  /** The first wave's spawns. Shorthand for a one-wave `queues`. */
  queue?: SpawnEntry[];
  /**
   * One queue per wave, for a replay that runs past the end of a wave.
   *
   * The simulation asks for the next wave rather than fetching it, because
   * waves live in `content/` and nothing may point back into the sim. A replay
   * has to answer that question itself, and it has to answer it from recorded
   * data rather than by calling `buildQueue` — otherwise editing a wave would
   * silently invalidate every fingerprint taken before the edit.
   */
  queues?: SpawnEntry[][];
  /** One pod queue per wave, in the same order as `queues`. */
  podQueues?: PodEntry[][];
  inputs: TimedCommand[];
  /** Filled in by `record`. A mismatch means determinism broke. */
  expectHash?: number;
}

const copy = (q: SpawnEntry[]): SpawnEntry[] => q.map((e) => ({ ...e }));
const copyPods = (q: PodEntry[]): PodEntry[] => q.map((e) => ({ ...e }));

export function runReplay(replay: Replay): World {
  const cfg: SimConfig = { ...DEFAULT_CONFIG, ...replay.config };
  const queues = replay.queues ?? (replay.queue ? [replay.queue] : [[]]);
  const podQueues = replay.podQueues ?? [];
  const world = createWorld(cfg, replay.seed, copy(queues[0] ?? []), copyPods(podQueues[0] ?? []));

  const byTick = new Map<number, TimedCommand[]>();
  for (const input of replay.inputs) {
    const list = byTick.get(input.tick);
    if (list) list.push(input);
    else byTick.set(input.tick, [input]);
  }

  for (let t = 0; t < replay.ticks; t++) {
    step(world, byTick.get(t) ?? []);
    for (const e of world.events) {
      // A wave the replay does not carry leaves the field empty and the world
      // idle, which is a legitimate way to end a recording — not an error.
      if (e.type !== "needWave") continue;
      const next = queues[e.wave];
      if (next) startWave(world, e.wave, copy(next), copyPods(podQueues[e.wave] ?? []));
    }
  }
  return world;
}

/** Run once and stamp the resulting fingerprint into the replay. */
export function record(replay: Replay): Replay {
  return { ...replay, expectHash: hashWorld(runReplay(replay)) };
}
