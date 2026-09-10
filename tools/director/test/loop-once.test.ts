import { expect, test } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";

/**
 * The director's fixed-timestep loop exists once, in `stage-loop.ts`.
 *
 * It has not always. `raster-field.ts` carried a copy under a comment saying it
 * was "the same fixed-timestep loop `stage.ts` runs", and `versus-pair.ts` a
 * third with the rate and the freeze folded in. Nothing about that is visible
 * at a glance: all three worked, and the failure is a catch-up cap raised in
 * one of them and left alone in the other two, which shows up as one screen
 * bursting after an away tab and the others not.
 *
 * A regex over the source rather than a behavioural test, because the thing
 * being held is that the code is in one place — which no amount of running it
 * can show. `carry +=` is the accumulator every copy had to have.
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = "src/stage-loop.ts";

test("only stage-loop.ts accumulates a fixed-timestep carry", async () => {
  const carriers: string[] = [];
  for (const file of new Glob("**/*.ts").scanSync(SRC)) {
    const rel = file.replaceAll("\\", "/");
    if (rel === HOME || rel.startsWith("test/")) continue;
    const source = await Bun.file(join(SRC, file)).text();
    if (/\bcarry\s*\+=/.test(source)) carriers.push(rel);
  }
  expect(carriers).toEqual([]);
});

test("the one that does is the one everything else calls", async () => {
  // The negative above passes just as well if the loop is deleted outright, so
  // this says the home is still home and still has callers.
  const home = await Bun.file(join(SRC, ...HOME.split("/"))).text();
  expect(home).toMatch(/\bcarry\s*\+=/);

  const callers: string[] = [];
  for (const file of new Glob("src/*.ts").scanSync(SRC)) {
    const rel = file.replaceAll("\\", "/");
    if (rel === HOME) continue;
    // Either door: `runStageLoopWhileSeen` is the same loop behind a
    // visibility gate, and a caller through it is still a caller.
    if (/\brunStageLoop(?:WhileSeen)?\(/.test(await Bun.file(join(SRC, file)).text()))
      callers.push(rel);
  }
  expect(callers.sort()).toEqual(["src/stage.ts", "src/versus-pair.ts"]);
});
