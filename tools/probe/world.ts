import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * A world, stood up and stepped, for a question that only a running one
 * answers.
 *
 * "Where is this creature on beat 13 of THE COIL" is a ten-line script and it
 * had nowhere to live. A file in a session's scratch directory cannot resolve
 * `@neon-spore/sim` at all, because it is outside the workspace; a file under
 * `tools/frames/` cannot either, because that package does not declare the
 * dependency and should not. What worked was a file dropped inside
 * `packages/render/`, which happens to depend on both `sim` and `content` — and
 * every session that needed a number off a running world paid the same three
 * tries to find that out, and left the file behind afterwards.
 *
 * So: a package that depends on all three, one command that runs a script in
 * it, and a scratch directory nobody has to remember to clean.
 *
 * **It is a rig, not a test.** What a session drops in `scratch/` asserts
 * nothing and is run by nothing — `bun run check` never sees it. A question
 * worth asking twice is a test in the package that owns the answer; this is for
 * the first time it is asked.
 */

/**
 * The wave with this id, stood at beat 0 with its queue, its pods, its boss
 * and its fault on it — what `startWave` takes in the game (`apps/game/src/
 * waves.ts`), so a probe is looking at the game rather than at an arrangement
 * of its parts. The guide is left down: a probe steps the field, and a held
 * wave steps nothing. It used to pass the queue and the boss alone, and a
 * probe of THE COIL watched a plate stand under a dome for a whole wave with
 * the shield never armed — the fault that arms it was not on the world.
 *
 * **By id, never by index.** A wave inserted earlier in the campaign moves
 * every index after it, and a number here would be a silent claim about the
 * order of the whole game (`packages/render/test/frame-harness.ts` says the
 * same thing about the same trap).
 */
export function waveWorld(id: string, seed = 1, cfg: SimConfig = DEFAULT_CONFIG): World {
  const index = WAVES.findIndex((w) => w.id === id);
  if (index === -1) {
    throw new Error(
      `no wave with the id ${JSON.stringify(id)} — ${WAVES.map((w) => w.id).join(", ")}`,
    );
  }
  const world = createWorld(cfg, seed, []);
  startWave(
    world,
    index,
    buildQueue(index, cfg.cols),
    buildPods(index, cfg.cols),
    buildBoss(index, cfg.cols),
    false,
    0,
    WAVES[index]?.malfunction ?? null,
  );
  return world;
}

/** One beat of ticks, with no commands. The unit a wave is authored in. */
export function beat(world: World): void {
  const ticks = ticksPerBeat(world.cfg);
  for (let i = 0; i < ticks; i++) step(world, []);
}

/** Beats, one after another, calling back after each with the beat number. */
export function beats(world: World, count: number, onBeat: (n: number) => void = () => {}): void {
  for (let n = 1; n <= count; n++) {
    beat(world);
    onBeat(n);
  }
}

/**
 * The field as one line per body: what is on it, where, and in what colour.
 *
 * Deliberately terse and deliberately not a picture. A picture of the field is
 * `bun run frames`, which takes a real one; this is for the times the question
 * is a number and the answer has to be read rather than looked at.
 */
export function field(world: World): string {
  if (world.creatures.length === 0) return "    (empty)";
  return world.creatures
    .map((c) => {
      const colour = c.color ?? "—";
      const span = c.span === undefined ? "" : ` span ${c.span}`;
      return `    #${c.id} ${c.kind.padEnd(10)} col ${c.col} row ${c.row} ${colour}${span}`;
    })
    .join("\n");
}
