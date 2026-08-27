import { kindForColor } from "@neon-spore/content";
import type { Scene, SceneSpawn } from "@neon-spore/shape-sheet";
import { fallTilesPerBeat, type PodEntry, type SpawnEntry, type World } from "@neon-spore/sim";
import { fresh, POSE_TPB, run } from "./pose-kit.js";

/**
 * The *built* half of a scene: a real world with the game's own creatures run
 * to where the scene wants them standing.
 *
 * Apart from `scene-panel.ts` because it touches no DOM, which is what lets
 * `test/scenes.test.ts` build every scene and check that each creature landed
 * on the row it was asked for. The arithmetic below is the kind that is right
 * until the spawn rule moves under it, and a comment is not a test.
 */

/**
 * Where a spawn has to be authored to arrive on the row the scene asked for.
 *
 * A creature enters at row 0 the beat *after* its own, then falls its kind's
 * tiles per beat. So a body wanted `row` down the field, in a run held for
 * `hold` beats, is authored at `hold - 1 - row / fall`. Rounded, because a
 * torch falls twelve tiles a beat and cannot stand on every row; nothing in
 * the scenes places one, and `test/scenes.test.ts` asserts every body actually
 * landed where its scene said rather than trusting this comment.
 */
const stepsFor = (s: SceneSpawn): number => Math.round(s.row / fallTilesPerBeat(kindOf(s)));

function kindOf(s: SceneSpawn): SpawnEntry["kind"] {
  if (s.what === "meteor" || s.what === "torch") return s.what;
  return kindForColor(s.what === "red" ? "red" : "cyan");
}

/** The world a scene is drawn against: the built half, run to where it belongs. */
export function sceneWorld(scene: Scene): World {
  const spawns = scene.spawns ?? [];
  const falling = spawns.filter((s) => s.what !== "pod");
  // One beat at the very least. Nothing enters on the beat it is authored for
  // — creatures and pods alike wait for `waveBeat - 1` to pass them — so a
  // scene of one pod and nothing falling would be a scene of an empty field.
  const hold = falling.reduce((n, s) => Math.max(n, stepsFor(s) + 1), spawns.length > 0 ? 1 : 0);
  const queue: SpawnEntry[] = falling
    .map((s) => ({
      beat: hold - 1 - stepsFor(s),
      col: s.col,
      kind: kindOf(s),
      color: s.what === "red" || s.what === "cyan" ? s.what : null,
    }))
    // The queue is walked in order and stops at the first entry whose beat has
    // not come, so one out of order would silently hold back every entry after
    // it — see `beat.ts`. Authored waves are sorted; these are composed.
    .sort((a, b) => a.beat - b.beat);
  // A pod names its own row, so it needs no arithmetic and no run of its own.
  const pods: PodEntry[] = spawns
    .filter((s) => s.what === "pod")
    .map((s) => ({ beat: 0, col: s.col, row: s.row }));

  const world = fresh(queue, pods);
  run(world, hold * POSE_TPB);
  return world;
}
