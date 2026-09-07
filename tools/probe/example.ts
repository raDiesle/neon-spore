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
 * Anything in `@neon-spore/sim`, `@neon-spore/content` or `@neon-spore/render`
 * is importable from there: this package depends on all three so that a
 * question about a running world never costs the three tries it used to.
 */

const world = waveWorld("theCoil");
console.log(`THE COIL, beat by beat — ${world.creatures.length} on the field at beat 0`);
console.log(field(world));
beats(world, 16, (n) => {
  console.log(`\nbeat ${n}`);
  console.log(field(world));
});
