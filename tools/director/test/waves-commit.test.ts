import { beforeEach, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commitMessage, commitWaves } from "../src/waves-commit.js";

/**
 * The commit a save makes. Its subject and first paragraph become a release
 * note, so they are held to saying something — and the whole thing is
 * off-limits when the environment says so, because a test suite that commits
 * is a test suite nobody can run twice.
 *
 * `wave-save.test.ts` sets the opt-out for its own tests, and `bun test` runs
 * every file in one process — so these clear it rather than trusting whichever
 * file happened to run first.
 */
beforeEach(() => {
  delete process.env.DIRECTOR_NO_COMMIT;
});

test("the message leads with a subject and names what was saved", () => {
  const message = commitMessage(41, [
    "packages/content/src/waves/act-1.ts",
    "packages/content/src/waves/act-2.ts",
  ]);
  const [subject, blank, paragraph] = message.split("\n");

  expect(subject).toBe("The wave list as the director saved it");
  expect(blank).toBe("");
  expect(paragraph).toContain("41 waves");
  expect(paragraph).toContain("2 files");
  expect(message).toContain("- packages/content/src/waves/act-1.ts");
});

test("one file is not called '1 files'", () => {
  expect(commitMessage(1, ["packages/content/src/waves/act-1.ts"])).toContain("one file");
});

test("nothing at all is committed when the environment says not to", async () => {
  const was = process.env.DIRECTOR_NO_COMMIT;
  process.env.DIRECTOR_NO_COMMIT = "1";
  try {
    // A path that does not exist would make `git diff` complain; the opt-out
    // is checked first, so it never runs.
    expect(await commitWaves(["nowhere/at/all.ts"], 1, process.cwd())).toBeNull();
  } finally {
    if (was === undefined) delete process.env.DIRECTOR_NO_COMMIT;
    else process.env.DIRECTOR_NO_COMMIT = was;
  }
});

test("the message names the files that moved, not the files it might have written", async () => {
  const dir = await repo();
  try {
    await writeFile(join(dir, "act.ts"), "two\n");
    // `other.ts` is offered and unchanged: a save may write six act files and
    // move one, and the release note must not claim the other five.
    expect(await commitWaves(["act.ts", "other.ts"], 7, dir)).toBeNull();
    const body = await git(["log", "-1", "--format=%b"], dir);
    expect(body).toContain("one file");
    expect(body).toContain("- act.ts");
    expect(body).not.toContain("other.ts");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a save that wrote no files is not a commit", async () => {
  expect(await commitWaves([], 0, process.cwd())).toBeNull();
});

async function git(args: string[], cwd: string): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return out.trim();
}

/**
 * A repository of its own, because the thing under test writes history and a
 * test that wrote this one's would be unrunnable twice.
 */
async function repo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "ns-commit-"));
  await git(["init", "-q", "-b", "main"], dir);
  await git(["config", "user.email", "test@example.com"], dir);
  await git(["config", "user.name", "Test"], dir);
  await writeFile(join(dir, "act.ts"), "one\n");
  await writeFile(join(dir, "other.ts"), "untouched\n");
  await git(["add", "--", "act.ts", "other.ts"], dir);
  await git(["commit", "-qm", "first"], dir);
  return dir;
}

test("a changed file is committed, and nothing else in the tree is", async () => {
  const dir = await repo();
  try {
    await writeFile(join(dir, "act.ts"), "two\n");
    // A half-finished edit sitting beside it, of the kind another lane leaves.
    await writeFile(join(dir, "other.ts"), "somebody else's afternoon\n");

    expect(await commitWaves(["act.ts"], 7, dir)).toBeNull();

    expect(await git(["log", "-1", "--format=%s"], dir)).toBe(
      "The wave list as the director saved it",
    );
    expect(await git(["show", "--name-only", "--format=", "HEAD"], dir)).toBe("act.ts");
    // Still dirty, still theirs.
    expect(await git(["status", "--porcelain"], dir)).toBe("M other.ts");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("a save that changed no byte leaves no commit behind", async () => {
  const dir = await repo();
  try {
    const before = await git(["rev-parse", "HEAD"], dir);
    expect(await commitWaves(["act.ts"], 7, dir)).toBeNull();
    expect(await git(["rev-parse", "HEAD"], dir)).toBe(before);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
