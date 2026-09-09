import { describe, expect, test } from "bun:test";
import { deleteRemote, deletionLine } from "../remote-branch.js";
import { deepen, deepenedLine, type Run } from "../shallow.js";

/**
 * The two things a cloud session walks into in the same minute of the same
 * turn: a clone shallow enough that every count against `origin` is about the
 * graft, and a git proxy that answers 403 to a branch deletion after taking an
 * ordinary push of the same branch.
 *
 * Both are tested against a fake `git` rather than a repository, because
 * neither symptom can be made to happen in one — a shallow clone needs a remote
 * with depth, and the 403 belongs to a proxy nothing here runs behind.
 */

function fake(answers: Record<string, { ok: boolean; out: string }>): {
  run: Run;
  asked: string[];
} {
  const asked: string[] = [];
  const run: Run = async (args) => {
    const key = args.join(" ");
    asked.push(key);
    return answers[key] ?? { ok: true, out: "" };
  };
  return { run, asked };
}

describe("a shallow clone", () => {
  test("an ordinary checkout costs one rev-parse and nothing else", async () => {
    const { run, asked } = fake({
      "rev-parse --is-shallow-repository": { ok: true, out: "false\n" },
    });
    expect(await deepen(run)).toEqual({ was: false, ok: true });
    expect(asked).toEqual(["rev-parse --is-shallow-repository"]);
  });

  test("a shallow one is joined up before anything is counted", async () => {
    const { run, asked } = fake({
      "rev-parse --is-shallow-repository": { ok: true, out: "true\n" },
    });
    expect(await deepen(run)).toEqual({ was: true, ok: true });
    expect(asked).toEqual(["rev-parse --is-shallow-repository", "fetch --unshallow origin"]);
  });

  test("a deepening that fails says the counts below are the graft", async () => {
    const { run } = fake({
      "rev-parse --is-shallow-repository": { ok: true, out: "true\n" },
      "fetch --unshallow origin": { ok: false, out: "fatal: could not read from remote" },
    });
    const out = await deepen(run);
    expect(out).toEqual({ was: true, ok: false });
    expect(deepenedLine(out, "main")).toContain("depth of the graft");
  });

  test("nothing is said about a clone that was never shallow", () => {
    expect(deepenedLine({ was: false, ok: true }, "main")).toBe("");
  });
});

describe("the branch on origin", () => {
  test("a refused deletion is asked for once and said in one line", async () => {
    const { run, asked } = fake({
      "push origin --delete claude/lane": {
        ok: false,
        out: "error: RPC failed; HTTP 403\nEverything up-to-date\n",
      },
    });
    const out = await deleteRemote(run, "claude/lane");
    expect(asked).toEqual(["push origin --delete claude/lane"]);
    expect(out.ok).toBe(false);
    const line = deletionLine(out, "claude/lane");
    expect(line).toContain("stays on origin");
    expect(line).not.toContain("Everything up-to-date");
  });

  test("a deletion that goes through reads like the rest of the sweep", async () => {
    const { run } = fake({});
    expect(deletionLine(await deleteRemote(run, "claude/lane"), "claude/lane")).toBe(
      "  swept    origin/claude/lane",
    );
  });
});
