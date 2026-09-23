import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * **What a test that drives a real repository is allowed to take**, measured
 * rather than guessed — and one `git` runner that says what failed.
 *
 * Seven test files build a bare origin, clone it twice and land commits in
 * both, which is twenty or thirty `git` subprocesses apiece. Each one of those
 * costs about two hundred milliseconds on an idle machine and **six seconds on
 * a loaded one**: `bun run check` deals fourteen `bun test` processes across
 * the cores, and on 17 September 2026 two sessions did that at once. Every
 * repo-backed file went red on `it` timeouts, and the same files passed in 8.5
 * seconds when run alone a minute later (`docs/queue.md`).
 *
 * **A landing that is red for a reason the diff cannot cause is worse than a
 * slow one.** It teaches a session to run `bun run land` again until it comes
 * up green, which is the habit that lets a real failure through. So the answer
 * is not a bigger flat number — a flat number is only ever right for one
 * machine under one load — it is a timeout that *scales with the machine it is
 * running on*.
 *
 * **The baseline is one real repository operation**, timed three times when
 * this module is first imported: `git init --bare` in a temporary directory,
 * which is the cheapest thing any of these files does and is made of exactly
 * what the expensive ones are made of — a process start, a fork, and a few
 * writes. Under load that measurement rises in step with everything else, so
 * `repoTimeout` rises with it and nothing has to know why the machine is busy.
 *
 * It costs three subprocesses per test *file*, about a tenth of a second when
 * nothing else is running, and it buys a number that is honest on a laptop, on
 * the four-core web image and under a second session's whole check.
 *
 * **The same measurement answers a second question**, and `loadedTimeout` is
 * it: a test that walks the whole tree off disk does no repository work at all
 * and went red in the same minute, because what it is waiting on is the
 * machine rather than git. One baseline, two ways of asking it.
 */

/** How many times the baseline is timed. The median of three throws out a stall. */
const PROBES = 3;

/**
 * How many baselines the *most expensive* repository operation costs, measured
 * on 17 September 2026 on the cloud image with nothing else running.
 *
 * | operation | ms |
 * |---|---|
 * | `init --bare` — the baseline | 2.5 |
 * | `clone` of a one-commit bare repo | 5.7 |
 * | `push` | 19.0 |
 * | `commit` | 86.8 |
 *
 * So a commit is about thirty-five inits, and a commit is what these files do
 * most of. The ratio is a fact about git rather than about the machine — both
 * ends of it rise together under load, which is exactly why the baseline can
 * be the cheap one — so it is written down here with the numbers it came from
 * rather than re-measured per process.
 */
const WORST_RATIO = 35;

/**
 * And how many of *those* a test is allowed, on top of counting its own calls.
 *
 * Three, because a test that is about to be strangled by load is one whose
 * every call is slow at once and whose slowest call is slower than the median
 * that was measured — and because the cost of being wrong in this direction is
 * a test that takes a little longer to report a hang, while the cost of being
 * wrong in the other is a red landing nobody can explain.
 */
const SLACK = 3;

/** Never shorter than bun's own default: this may only ever give a test *more* time. */
const FLOOR_MS = 5_000;

/**
 * And never longer than this, however bad the load looks.
 *
 * A test that would take three minutes is not a slow test, it is a hung one,
 * and the whole point of the ceiling is that the shard reports it as a failure
 * in a readable time rather than holding the landing open.
 */
const CEILING_MS = 180_000;

async function probe(): Promise<number> {
  const dir = await mkdtemp(join(tmpdir(), "ns-probe-"));
  try {
    const began = performance.now();
    const proc = Bun.spawn(["git", "init", "--bare", "--quiet", join(dir, "r.git")], {
      stdout: "ignore",
      stderr: "ignore",
    });
    await proc.exited;
    return performance.now() - began;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * The cost of one repository operation on this machine, right now, in
 * milliseconds. Measured once per test process at import.
 *
 * `performance.now` rather than the tick counter, and a wall clock rather than
 * a seeded one: this is a test helper measuring a machine, which is the one
 * place in the repository where wall-clock time is the subject rather than a
 * hazard (`packages/sim/test/purity.test.ts` guards the places where it is).
 */
export const GIT_OP_MS: number = await (async () => {
  const runs: number[] = [];
  for (let i = 0; i < PROBES; i++) runs.push(await probe());
  return runs.sort((a, b) => a - b)[Math.floor(PROBES / 2)] ?? 0;
})();

/**
 * How long a test that runs `ops` repository operations may take, in
 * milliseconds — pass it as `bun test`'s third argument.
 *
 * Count the `git` calls the test makes *including the ones its helpers make*,
 * and round up. Being generous costs nothing: the number is a ceiling on
 * patience, not a budget anybody spends.
 */
export function repoTimeout(ops: number): number {
  const guess = ops * GIT_OP_MS * WORST_RATIO * SLACK;
  return Math.min(CEILING_MS, Math.max(FLOOR_MS, Math.ceil(guess)));
}

/**
 * What the baseline costs on a machine with nothing else on it, in
 * milliseconds — the left-hand column of the table above.
 */
const IDLE_MS = 2.5;

/**
 * **How much slower this machine is than an idle one**, never below one.
 *
 * A machine cannot be measured as *faster* than the reference and have that
 * shorten a timeout: the floor below is what a test is owed, and this may only
 * ever add to it.
 */
export const LOAD: number = Math.max(1, GIT_OP_MS / IDLE_MS);

/**
 * How long a test that takes `idleMs` on an unloaded machine may take here.
 *
 * For the slow tests that are **not** repository work — the ones that read
 * eighteen hundred files off disk to ask whether `docs/INDEX.md` still names
 * them. Those take a third of a second alone and forty-eight seconds under a
 * second session's whole check (`docs/queue.md`), which is the same load
 * `repoTimeout` exists for arriving by a different road.
 *
 * Pass what the test costs when it is the only thing running, rounded up. The
 * slack is the same three, and for the same reason. A test declares it
 * through `itCosts` or `fileCosts` (`figure.ts`), which also say when the
 * figure has stopped being true.
 */
export function loadedTimeout(idleMs: number): number {
  return Math.min(CEILING_MS, Math.max(FLOOR_MS, Math.ceil(idleMs * LOAD * SLACK)));
}

/**
 * One `git` command in one directory, with a failure a reader can act on.
 *
 * Every repo-backed file had a four-line `run` of its own that threw
 * `git ${args}: ${stderr}` — and on 17 September 2026 one of them threw
 * exactly `git reset --hard --quiet HEAD~1:`, with an empty stderr, from a
 * temporary directory nobody could name afterwards. That is a red landing with
 * nothing in it to read.
 *
 * So: the command, **the directory it ran in**, the exit code, and whatever
 * the process actually said, with a stand-in when it said nothing at all.
 *
 * `env` is for the one file that pins an author on every call rather than
 * configuring the repository: added to the environment, never replacing it, so
 * a runner that inherits `PATH` goes on finding git.
 */
export async function gitIn(
  args: readonly string[],
  cwd: string,
  env?: Record<string, string>,
): Promise<string> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    ...(env ? { env: { ...process.env, ...env } } : {}),
  });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) {
    const said = err.trim() || out.trim() || "(said nothing)";
    throw new Error(`git ${args.join(" ")} in ${cwd} exited ${code}: ${said}`);
  }
  return out.trim();
}
