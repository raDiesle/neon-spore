import { beforeEach, expect, test } from "bun:test";
import { BASELINE_REL, MARK_ARGS, markBaseline, type Runner } from "../src/waves-baseline.js";

/**
 * The perf baseline a save brings up to date before it commits.
 *
 * What is proven here is the wiring — the command asked for, where it runs,
 * what a refusal says, and the switch that keeps a test suite's saves off the
 * file — not the marker itself, which `tools/perf/test/unmeasured.test.ts`
 * proves on its own. The runner is injected for the same reason
 * `waves-commit.test.ts` commits in a repository of its own: a test that ran
 * `perf --unmeasured` against this tree could rewrite a tracked file.
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

test("the save asks perf for its unmeasured pass, from the repository root", async () => {
  const { run, calls } = recording({ code: 0, out: "nothing to mark" });
  expect(await markBaseline("/repo", run)).toBeNull();
  expect(calls).toEqual([{ args: MARK_ARGS, cwd: "/repo" }]);
  expect(MARK_ARGS).toEqual(["tools/perf/run.ts", "--unmeasured"]);
});

test("a marker that refuses is reported in its own words, and the save goes on", async () => {
  const { run } = recording({ code: 1, out: "✗ there is no baseline to add rows to" });
  expect(await markBaseline("/repo", run)).toBe("✗ there is no baseline to add rows to");
  const { run: silent } = recording({ code: 2 });
  expect(await markBaseline("/repo", silent)).toBe("perf --unmeasured failed");
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
