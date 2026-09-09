import { beats, field, waveWorld } from "./world.js";

/**
 * The worked example, and the thing to copy.
 *
 * `bun run probe` with no argument runs this file. Everything a throwaway probe
 * needs is in the four lines under this comment: a wave by id, a number of
 * beats, and the field printed after each one. Copy it into
 * `tools/probe/scratch/<whatever>.ts` — which is ignored by git — change the id
 * and the number, and run `bun run probe scratch/<whatever>`.
 *
 * **Any of the five packages** is importable from there — `sim`, `content`,
 * `render`, `net` and `audio` — because this one depends on all five, so that a
 * question about a running world never costs the three tries it used to. A
 * script written anywhere else cannot import one at all: the workspace links
 * live under each package's own `node_modules` and the repository root has
 * none, which is why a file at the top level resolves nothing.
 */

const world = waveWorld("theCoil");
console.log(`THE COIL, beat by beat — ${world.creatures.length} on the field at beat 0`);
console.log(field(world));
beats(world, 16, (n) => {
  console.log(`\nbeat ${n}`);
  console.log(field(world));
});
