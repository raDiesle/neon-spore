#!/usr/bin/env bun
import { broodBoss, failHolds } from "@neon-spore/sim";
import { playedAt, waveWorld } from "./world.js";

/**
 * `bun run waves:difficulty <wave id>` — how hard a wave is for a pair that
 * presses at a human's pace: AUTO on both seats, each held to one press every
 * N seconds (`playedAt`), over many seeds, cleared or lost.
 *
 * THE BROOD was retuned twice on 16 and 17 October 2026 against this table,
 * and both times it was written again in `tools/probe/scratch/`. Now a spec
 * line like *clears at one press each per 1.75 seconds* names a command that
 * reproduces it:
 *
 *     bun run waves:difficulty theBrood --seeds 20 --per 1,1.25,1.5,1.75,2
 */

/** Past this many beats a seed is taken as never ending — `measure-waves.ts`'s limit. */
const LIMIT_BEATS = 900;

export interface Pace {
  secondsPerPress: number;
  seeds: number;
  cleared: number;
  lost: number;
  /** Mean beats to the end, cleared or lost. */
  beats: number;
  /** THE BROOD's bodies laid and buds dropped, mean — null for any other wave. */
  laid: number | null;
  dropped: number | null;
}

/** One wave played on `seeds` seeds at one pace. */
export function pace(id: string, secondsPerPress: number, seeds: number): Pace {
  let cleared = 0;
  let lost = 0;
  let beats = 0;
  let laid = 0;
  let dropped = 0;
  let brood = false;
  for (let seed = 1; seed <= seeds; seed++) {
    const world = waveWorld(id, seed);
    let beat = 0;
    // The brood's counts as last read: the boss leaves the field when it dies.
    let seen = { laid: 0, dropped: 0 };
    while (beat < LIMIT_BEATS) {
      beat++;
      playedAt(world, secondsPerPress);
      const s = broodBoss(world);
      if (s) {
        brood = true;
        seen = { laid: s.laid, dropped: s.dropped };
      }
      if (world.restBeat !== 0) {
        cleared++;
        break;
      }
      if (failHolds(world)) {
        lost++;
        break;
      }
    }
    beats += beat;
    laid += seen.laid;
    dropped += seen.dropped;
  }
  return {
    secondsPerPress,
    seeds,
    cleared,
    lost,
    beats: beats / seeds,
    laid: brood ? laid / seeds : null,
    dropped: brood ? dropped / seeds : null,
  };
}

/** The table, one line per pace. */
export function table(id: string, rows: Pace[]): string {
  const lines = rows.map((r) => {
    const timedOut = r.seeds - r.cleared - r.lost;
    const brood =
      r.laid === null ? "" : `  laid ${r.laid.toFixed(1)}  dropped ${(r.dropped ?? 0).toFixed(1)}`;
    const out = timedOut > 0 ? `  unfinished ${timedOut}` : "";
    return `  one press per ${r.secondsPerPress}s: cleared ${r.cleared}/${r.seeds}  lost ${r.lost}${out}  mean beats ${r.beats.toFixed(0)}${brood}`;
  });
  return [`${id}, AUTO at a human's pace`, ...lines].join("\n");
}

/** `--name value` off the command line, or `fallback`. */
function flag(args: string[], name: string, fallback: string): string {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : (args[at + 1] ?? fallback);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const id = args[0];
  if (!id || id.startsWith("--")) {
    console.error("usage: bun run waves:difficulty <wave id> [--seeds 20] [--per 1,1.5,2]");
    process.exit(2);
  }
  const seeds = Number(flag(args, "seeds", "20"));
  const paces = flag(args, "per", "1,1.25,1.5,1.75,2").split(",").map(Number);
  console.log(
    table(
      id,
      paces.map((p) => pace(id, p, seeds)),
    ),
  );
}
