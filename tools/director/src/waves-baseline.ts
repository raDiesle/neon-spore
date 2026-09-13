/**
 * A save keeps the perf baseline honest.
 *
 * `tools/perf/baseline.json` holds one row per wave, and each row records what
 * the wave *sent* when it was weighed; `tools/perf/test/baseline.test.ts`
 * fails a row whose wave sends something else now, because its figures are
 * for a wave that no longer exists. A save in the wave editor is exactly that
 * change — on 13 September 2026 the owner turned FIRST STEP's one body into
 * eight, the save committed straight onto `main` (`waves-commit.ts` runs no
 * check, by design: a save must not fail), and the next lane's `bun run land`
 * found the trunk red with a failure that was nobody's lane.
 *
 * The step that puts it right is mechanical and measures nothing:
 * `bun run perf --unmeasured` (`tools/perf/unmeasured.ts`) blanks every row
 * whose wave changed under it and adds one for every wave that has none. It
 * is what a session that cannot run perf is told to do, and it is what the
 * save does now, between the write and the commit, so the baseline lands in
 * the same commit as the act files that moved it.
 *
 * **In a process of its own**, not by importing `fillUnmeasured`: it reads
 * `WAVES` from `@neon-spore/content`, and in the director's own process that
 * is the list loaded at start-up, not the files the save just wrote. A fresh
 * `bun` sees the new act files.
 *
 * Best-effort, like the commit: the act files are already written, and a save
 * that failed over the baseline would say the authoring was lost when it was
 * not. A refusal is logged. `DIRECTOR_NO_COMMIT=1` turns this off with the
 * commit, because it is the same switch — *the save touches nothing but the
 * act files* — and the suite that saves for real under it must leave the
 * baseline alone too.
 */

/** Where the baseline is, relative to the repository root — the path the
 * commit is offered beside the act files. */
export const BASELINE_REL = "tools/perf/baseline.json";

/** What runs the marker: the command line, its cwd, and what came back. */
export type Runner = (
  args: readonly string[],
  cwd: string,
) => Promise<{ code: number; out: string; err: string }>;

const spawnBun: Runner = async (args, cwd) => {
  const proc = Bun.spawn([process.execPath, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [code, out, err] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code, out, err };
};

/** The command, as one place holds it and the test reads it. */
export const MARK_ARGS = ["tools/perf/run.ts", "--unmeasured"] as const;

/**
 * Bring the baseline up to the act files on disk. Returns what went wrong, or
 * null when the file is now current — which includes its having been current
 * already, when the marker writes nothing and `commitWaves` sees no change.
 */
export async function markBaseline(root: string, run: Runner = spawnBun): Promise<string | null> {
  if (process.env.DIRECTOR_NO_COMMIT) return null;
  const done = await run(MARK_ARGS, root);
  if (done.code !== 0) return done.err.trim() || done.out.trim() || "perf --unmeasured failed";
  return null;
}
