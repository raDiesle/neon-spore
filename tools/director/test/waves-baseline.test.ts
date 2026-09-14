import { beforeEach, expect, test } from "bun:test";
import { BASELINE_REL, MARK_ARGS, markBaseline, type Runner } from "../src/waves-baseline.js";

/**
 * The perf baseline a save brings up to date before it commits.
 *
 * What is proven here is the wiring — the command asked for, that it is a
 * script that exists, where it runs, what a refusal says, and the switch that
 * keeps a test suite's saves off the file — not the marker itself, which
 * `tools/perf/test/baseline.test.ts` proves under *a row nobody has measured*.
 * The runner is injected for the same reason
 * `waves-commit.test.ts` commits in a repository of its own: a test that ran
 * `baseline:blank` against this tree could rewrite a tracked file.
 *
 * `wave-save.test.ts` sets the opt-out for its own tests and `bun test` runs
 * every file in one process, so these clear it rather than trusting whichever
 * file happened to run first.
 */
beforeEach(() => {
  delete process.env.DIRECTOR_NO_COMMIT;
});

function recording(result: { code: number; out?: string; err?: string }): {
  run: Runner;
  calls: { args: readonly string[]; cwd: string }[];
} {
  const calls: { args: readonly string[]; cwd: string }[] = [];
  const run: Runner = async (args, cwd) => {
    calls.push({ args, cwd });
    return { code: result.code, out: result.out ?? "", err: result.err ?? "" };
  };
  return { run, calls };
}

test("the save asks for the blanking pass, from the repository root", async () => {
  const { run, calls } = recording({ code: 0, out: "nothing to mark" });
  expect(await markBaseline("/repo", run)).toBeNull();
  expect(calls).toEqual([{ args: MARK_ARGS, cwd: "/repo" }]);
  expect(MARK_ARGS).toEqual(["tools/perf/blank.ts"]);
});

/**
 * **The command it names is a file that is there.** The save is best-effort by
 * design — a save that failed over the baseline would say the authoring was
 * lost when it was not — so a `MARK_ARGS` pointing at a script that has moved
 * fails quietly on every save until somebody reads a log. It has moved once
 * already: `perf --unmeasured` became `baseline:blank` on 14 September 2026.
 */
test("names a script that exists, so a save cannot fail quietly on a moved file", async () => {
  const script = new URL(`../../../${MARK_ARGS[0]}`, import.meta.url);
  expect(await Bun.file(script).exists(), `${MARK_ARGS[0]} is not there`).toBe(true);
});

test("a marker that refuses is reported in its own words, and the save goes on", async () => {
  const { run } = recording({ code: 1, out: "✗ there is no baseline to add rows to" });
  expect(await markBaseline("/repo", run)).toBe("✗ there is no baseline to add rows to");
  const { run: silent } = recording({ code: 2 });
  expect(await markBaseline("/repo", silent)).toBe("baseline:blank failed");
});

test("nothing runs when the environment says the save touches only the act files", async () => {
  process.env.DIRECTOR_NO_COMMIT = "1";
  try {
    const { run, calls } = recording({ code: 1 });
    expect(await markBaseline("/repo", run)).toBeNull();
    expect(calls).toEqual([]);
  } finally {
    delete process.env.DIRECTOR_NO_COMMIT;
  }
});

test("the file offered to the commit is the baseline the marker writes", () => {
  expect(BASELINE_REL).toBe("tools/perf/baseline.json");
});
