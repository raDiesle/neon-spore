import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { LandState } from "../land.js";
import { type Landed, PREAMBLE } from "../notes.js";
import { writeNotes } from "../sweep.js";

/**
 * `writeNotes` against a repository shaped the way a clone is: one checkout,
 * standing on the lane's own branch, with the trunk beside it as a ref that
 * nothing has checked out. That is what every session started from a phone
 * runs in, and it used to be the one shape where a landing wrote no note at
 * all — so the only part of a landing anybody sees twice went missing from
 * exactly the sessions the owner is not watching.
 *
 * `notes.test.ts` next door proves the file's shape against hand-written
 * strings. What cannot be proved that way is where the commit lands: in a
 * clone the note is committed onto the branch this checkout is standing on,
 * and the trunk has to be brought up to it afterwards or the note is a commit
 * `main` does not have.
 */

let root = "";

async function run(args: string[], cwd = root): Promise<void> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
  if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim()}`);
}

async function capture(args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  if (code !== 0) throw new Error(`git ${args.join(" ")} failed`);
  return out.trim();
}

/** The fields `writeNotes` reads. The rest of a `LandState` says nothing here. */
function cloneState(): LandState {
  return { trunkTree: "" } as unknown as LandState;
}

const LANDED: Landed[] = [
  {
    full: "0".repeat(40),
    sha: "abc1234",
    date: "2026-09-06",
    subject: "A landing from a clone writes a release note",
    summary: "The sentence a reader gets.",
  },
];

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-notes-"));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await writeFile(join(root, "readme.md"), "one\n");
  // Tracked from the first commit, the way it is in this repository — a clone
  // has the file before it has anything to write into it, and `--only` names a
  // path git already knows.
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "release-notes.md"), PREAMBLE);
  await run(["add", "readme.md", "docs/release-notes.md"]);
  await run(["commit", "-q", "-m", "first"]);
  // The lane, and the fast-forward `moveTrunk` does in a clone: the trunk is a
  // ref forced onto this HEAD, not a branch some other checkout moved.
  await run(["checkout", "-q", "-b", "lane"]);
  await writeFile(join(root, "readme.md"), "two\n");
  await run(["commit", "-q", "--only", "readme.md", "-m", "the work"]);
  await run(["branch", "--force", "main", "HEAD"]);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
});

describe("a release note in a clone with no worktrees", () => {
  test("writes the file, commits it, and brings the trunk up to it", async () => {
    await writeNotes(cloneState(), LANDED, "main", root);

    const notes = await Bun.file(join(root, "docs/release-notes.md")).text();
    expect(notes).toContain("A landing from a clone writes a release note");
    expect(notes).toContain("The sentence a reader gets.");

    expect(await capture(["log", "-1", "--format=%s", "HEAD"])).toBe(
      "Release notes for one landing",
    );
    // The whole point: `main` is the commit carrying the note, not the one
    // before it. A push of `main:main` would otherwise send everything except
    // the note it just wrote.
    expect(await capture(["rev-parse", "main"])).toBe(await capture(["rev-parse", "HEAD"]));
  });
});
