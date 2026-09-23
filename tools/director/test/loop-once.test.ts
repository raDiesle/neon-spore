import { expect, test } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { fileCosts } from "../../test/figure.js";

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

/**
 * The cap this file runs under, and it is not a formality: the first case
 * reads **every `.ts` under `tools/director` that is not a test** — 392 of
 * them on 18 September 2026 — off disk, one await at a time, and regexes each
 * one. That is a third of a second on a cold cache with nothing else running
 * and it was on bun's five-second default, which is the whole of the failure
 * (`docs/queue.md`, 18 September 2026): `bun run land` went red here once with
 * *test timed out*, on the shard that also carries nine other files, and the
 * same file run alone was green in 441 ms. A landing red for a reason the diff
 * cannot cause teaches the next session to run `land` again, which is the
 * habit that lets a real failure through.
 *
 * `loadedTimeout` and not `cpuTimeout`: what these two cases wait on is a
 * machine reading four hundred files, which is the same road
 * `tools/test/doc-drift.test.ts` takes and not the arithmetic the frame tests
 * take (`tools/test/repo-time.ts` has both, and why one baseline answers
 * both). The number is the heavier case's cold cost rounded up — being
 * generous costs nothing, because it is a ceiling on patience rather than a
 * budget anybody spends. Asked for here rather than raised globally: bun
 * applies `setDefaultTimeout` to the file the call is in, and a global default
 * would hand the same slack to every test that has made no claim at all.
 */
fileCosts(450);

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
  // Named in the message as well as in the diff: a red run's closing line
  // carries the message, and the one time this went red the file it found
  // was the whole question (`docs/queue.md`, 17 September 2026).
  expect(carriers, `a fixed-timestep carry outside ${HOME}: ${carriers.join(", ")}`).toEqual([]);
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
