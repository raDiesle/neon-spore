import { afterEach, beforeEach, it, setDefaultTimeout } from "bun:test";
import { join, relative } from "node:path";
import { DRIFT_MARK } from "../check/closing.js";
import { CORE_LOAD } from "./cpu-time.js";
import { loadedTimeout } from "./repo-time.js";

/**
 * **A slow test's figure, and the check that it is still true.**
 *
 * `loadedTimeout(idleMs)` scales a timeout by the machine's load, and the one
 * number it cannot measure is `idleMs` — what the test costs with nothing else
 * running, which a person times once and writes down. Every test that takes
 * one walks the whole tree, and the tree grows every day. On 21 September 2026
 * `doc-drift-names.test.ts` declared 120 ms and cost 800, so every timeout made
 * from it was six times too short, and `bun run land` went red on it for
 * nothing the diff had done. The habit that teaches — land again until green —
 * is the one `repo-time.ts` exists to end (`docs/queue.md`).
 *
 * So the figure is declared through here, and here times the test against it.
 * Divided by the load, what the test took is roughly what it would have taken
 * idle; more than `DRIFT` times the figure and the run says so, in a line that
 * starts `figure drift:`, and `tools/check/shard.ts` repeats every such line
 * under its counts. **Said, never failed**: a check that went red on a figure
 * would be a new flake in place of the old one.
 *
 * **The load is `CORE_LOAD`, not the `LOAD` the timeout scales by.** `LOAD`
 * is a `git init` against the cloud image's, and a quiet Apple-silicon laptop
 * reads eight to ten on it (`cpu-time.ts` has the figures) — divided by that,
 * the 800 against 120 above reads as 90 ms idle and nobody is told. The load
 * average per core is fair across the two. It lags a burst, which is why
 * `DRIFT` is three and not two: a full check slowed every honest figure here
 * about two and a half times on 23 September 2026 while the average still
 * read the quiet minute before it, and three is also the slack the timeout
 * itself allows — past it, the figure is short by more than anything covers.
 */

/** How far over its figure a test may run, idle, before a run says so. */
export const DRIFT = 3;

/** Whether `tookMs` under `load` is more than `DRIFT` of an `idleMs` figure. */
export function drifted(idleMs: number, tookMs: number, load: number = CORE_LOAD): boolean {
  return tookMs / load > DRIFT * idleMs;
}

/** The line a drifted figure is reported in; `shard.ts` finds it by its start. */
export function driftLine(where: string, idleMs: number, tookMs: number, load = CORE_LOAD): string {
  const idle = Math.round(tookMs / load);
  return (
    `${DRIFT_MARK} ${where} — took ${Math.round(tookMs)} ms at load ${load.toFixed(1)}, ` +
    `about ${idle} ms idle, against a figure of ${idleMs}; time it alone and raise it`
  );
}

const ROOT = join(import.meta.dirname, "..", "..");

/** The test file running now, from the repository's root. */
const here = (): string => relative(ROOT, Bun.main).replaceAll("\\", "/");

function report(where: string, idleMs: number, tookMs: number): void {
  if (drifted(idleMs, tookMs)) console.warn(driftLine(where, idleMs, tookMs));
}

type Body = () => unknown;

/**
 * `it(name, body, loadedTimeout(idleMs))`, and the body timed against
 * `idleMs`. The figure comes first so it reads beside the name, where
 * `loadedTimeout` used to trail the body by thirty lines.
 */
export function itCosts(idleMs: number, name: string, body: Body): void {
  it(
    name,
    async () => {
      const began = performance.now();
      await body();
      report(`${here()}: ${name}`, idleMs, performance.now() - began);
    },
    loadedTimeout(idleMs),
  );
}

/**
 * `setDefaultTimeout(loadedTimeout(idleMs))` for the file that calls it, and
 * every test in that file timed against `idleMs`. Returns the timeout, for the
 * file that derives its own waits from it. Call it at the top level: the hooks
 * are the calling file's, and only that file's.
 */
export function fileCosts(idleMs: number): number {
  const timeout = loadedTimeout(idleMs);
  setDefaultTimeout(timeout);
  let began = 0;
  beforeEach(() => {
    began = performance.now();
  });
  afterEach(() => report(here(), idleMs, performance.now() - began));
  return timeout;
}
