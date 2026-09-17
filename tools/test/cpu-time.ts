import { cpus, loadavg } from "node:os";

/**
 * **What a test that only computes is allowed to take** — the third way of
 * asking the question `tools/test/repo-time.ts` asks, and it exists because
 * that module's baseline answers the wrong one for this kind of test.
 *
 * `repoTimeout` and `loadedTimeout` both scale off `git init --bare`: a
 * process start, a fork and a few writes. That is the right unit for a test
 * that drives a real repository and a defensible one for a test that reads
 * eighteen hundred files off disk. It is the wrong unit for a test that spawns
 * nothing and touches nothing — a frame drawn through
 * `packages/render/test/canvas-stub.ts` is arithmetic and allocation and
 * nothing else — because **a fork is not the same cost on two platforms even
 * when the arithmetic is**. Measured quiet on 17 September 2026: `git init
 * --bare` 25 ms on an Apple-silicon laptop against 2.5 ms on the cloud image,
 * so a cap scaled off it reads a quiet mac as ten times loaded and pins at the
 * three-minute ceiling, where it has stopped saying anything at all.
 *
 * **And the obvious repair does not work.** The first cut of this timed a
 * fixed arithmetic loop in-process, which is platform-fair — and is blind:
 * with thirty-two spinners up and the load average at 39 it read 1.07, because
 * macOS goes on handing the foreground process a performance core. A probe
 * that cannot see the load it exists to see is worse than the flat number it
 * replaced, because it is *tighter* than the flat number and looks measured.
 *
 * So there is no probe. The kernel already counts the thing: runnable work per
 * core, which is what a render test under eight shards is actually waiting on,
 * and which `tools/check/shard.ts` already reads half of.
 */

/**
 * **How oversubscribed this machine is**, never below one — the one-minute
 * load average over the cores there are.
 *
 * One means every runnable process has a core. Four means each of them is
 * getting roughly a quarter of one, which is the shape of the failure this is
 * for: `briefing.test.ts` went red at a load average of 50 while a second
 * session's fourteen shards ran beside this one's eight.
 *
 * A one-minute average lags a burst by design, and that is the right direction
 * here: what it cannot see is a spike that will be over before the test is,
 * and what it reports faithfully is another check that has been running for a
 * while — which is the case that costs a landing. Read once per test process,
 * at import, by which time a shard runner has started everything it is going
 * to.
 */
export const CORE_LOAD: number = Math.max(1, (loadavg()[0] ?? 0) / Math.max(1, cpus().length));

/** Never shorter than bun's own default: this may only ever give a test *more* time. */
const FLOOR_MS = 5_000;

/**
 * And never longer than this, however bad the load looks. A test that would
 * take three minutes is not a slow test, it is a hung one, and the point of
 * the ceiling is that the shard reports it in a readable time rather than
 * holding the landing open.
 */
const CEILING_MS = 180_000;

/**
 * How much of its own measured cost a test is allowed on top of counting it —
 * and this is **eight**, where `repo-time.ts` uses three.
 *
 * Three would be right if the load average per core were the slowdown, and it
 * is not: it counts runnable processes and says nothing about the memory
 * bandwidth and the garbage collectors they are also sharing. The one
 * measurement there is says how far apart the two numbers are. On 17 September
 * 2026 a case costing 2.4 s alone failed to finish in thirty seconds — a
 * slowdown past twelve — while the load average was 50 over fourteen cores,
 * which is a signal of 3.6. So the signal understates the slowdown by at least
 * three and a half, and eight is that with room.
 *
 * The cost of being wrong this way is a hang reported a little later. The cost
 * of being wrong the other way is a red landing nobody can explain, which is
 * the thing this file exists to stop.
 */
const SLACK = 8;

/**
 * How long a test that computes for `idleMs` on an unloaded machine may take
 * here, in milliseconds — pass it as `bun test`'s third argument, or to
 * `setDefaultTimeout` for a whole file.
 *
 * Pass what the test costs when it is the only thing running, rounded up — and
 * for a file, what its heaviest case costs. Being generous costs nothing: the
 * number is a ceiling on patience, not a budget anybody spends.
 */
export function cpuTimeout(idleMs: number): number {
  return Math.min(CEILING_MS, Math.max(FLOOR_MS, Math.ceil(idleMs * CORE_LOAD * SLACK)));
}
