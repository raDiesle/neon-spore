import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import type { LandState } from "../land.js";
import { writeNotes } from "../note-commit.js";
import { type Landed, PREAMBLE } from "../notes.js";

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
/** The lane's own commit, so an `--unverified` entry can name a real range. */
let work = "";

/** One `git` in the temporary trunk, unless another tree is named. */
async function run(args: string[], cwd = root): Promise<void> {
  await gitIn(args, cwd);
}

/** The same, for a command whose output is the answer. */
async function capture(args: string[]): Promise<string> {
  return await gitIn(args, root);
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
  await writeFile(
    join(root, "docs", "queue.md"),
    `# Queue
`,
  );
  await run(["add", "readme.md", "docs/release-notes.md", "docs/queue.md"]);
  await run(["commit", "-q", "-m", "first"]);
  // The lane, and the fast-forward `moveTrunk` does in a clone: the trunk is a
  // ref forced onto this HEAD, not a branch some other checkout moved.
  await run(["checkout", "-q", "-b", "lane"]);
  await writeFile(join(root, "readme.md"), "two\n");
  await run(["commit", "-q", "--only", "readme.md", "-m", "the work"]);
  work = await capture(["rev-parse", "HEAD"]);
  await run(["branch", "--force", "main", "HEAD"]);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
});

describe("a release note in a clone with no worktrees", () => {
  test(
    "writes the file, commits it, and brings the trunk up to it",
    async () => {
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
    },
    repoTimeout(25),
  );
});

/**
 * The `--unverified` entry, which is the same commit and a different file.
 *
 * Worth a repository rather than a string: what `unverified.test.ts` cannot
 * reach is the `Files:` line, which is read off the landing itself with
 * `git diff --name-only` so that an entry can never name a file the commits
 * did not touch — and the `--only` naming two paths, which is what keeps the
 * note and the entry one bookkeeping step instead of two.
 */
describe("what a landing could not check", () => {
  test(
    "goes into docs/queue.md, in the commit that carries the note",
    async () => {
      const before = await capture(["rev-parse", "HEAD"]);
      const landed: Landed[] = [{ ...LANDED[0]!, full: work, sha: work.slice(0, 7) }];

      await writeNotes(cloneState(), landed, "main", root, [
        "--unverified",
        "THE GRATE's timing at tempo",
      ]);

      const queue = await Bun.file(join(root, "docs/queue.md")).text();
      expect(queue).toContain("- THE GRATE's timing at tempo");
      // Off the diff, not off the session: `readme.md` is what the lane changed.
      expect(queue).toContain("`readme.md`");

      const touched = await capture(["show", "--name-only", "--format=", "HEAD"]);
      expect(touched).toContain("docs/release-notes.md");
      expect(touched).toContain("docs/queue.md");
      expect(await capture(["rev-parse", "HEAD^"])).toBe(before);
    },
    repoTimeout(25),
  );
});

/**
 * The `Files:` line after a landing that **removed** something.
 *
 * `docs/queue.md` is held to naming only files the tree has
 * (`tools/test/doc-drift.test.ts`), and a diff names both sides of a change —
 * so an entry written off one listed the paths the landing had just deleted
 * and the next `bun run check` failed on the trunk. It happened landing a
 * VERSUS decision on 13 September 2026, where deleting the candidate
 * directories is most of what the commit does.
 */
describe("an entry after a landing that deleted files", () => {
  test(
    "names what the commit left standing, never what it took away",
    async () => {
      await writeFile(join(root, "gone.md"), "here for now\n");
      await run(["add", "gone.md"]);
      await run(["commit", "-q", "-m", "a file that will go"]);
      await run(["rm", "-q", "gone.md"]);
      await writeFile(join(root, "kept.md"), "still here\n");
      await run(["add", "kept.md"]);
      await run(["commit", "-q", "-m", "take it away again"]);
      const removal = await capture(["rev-parse", "HEAD"]);
      await run(["branch", "--force", "main", "HEAD"]);

      await writeNotes(
        cloneState(),
        [{ ...LANDED[0]!, full: removal, sha: removal.slice(0, 7) }],
        "main",
        root,
        ["--unverified", "whether the thing that replaced it reads"],
      );

      const queue = await Bun.file(join(root, "docs/queue.md")).text();
      expect(queue).toContain("`kept.md`");
      expect(queue).not.toContain("`gone.md`");
    },
    repoTimeout(25),
  );
});

/**
 * The measured minutes, stamped into the entry the session wrote.
 *
 * `stamp.test.ts` holds the arithmetic and the wording against strings. What
 * needs a repository is the guard: the stamp goes in only when the landing's
 * own commits touched `docs/time-log.md`, which is what makes "the last entry"
 * mean "this lane's" rather than whoever wrote last.
 */
describe("what the lane actually took", () => {
  test(
    "is stamped under the entry, in the commit that carries the note",
    async () => {
      await writeFile(
        join(root, "docs", "time-log.md"),
        "# Where the minutes went\n\n## 2026-09-16 — a-lane — something\n\nBottleneck: reading.\n",
      );
      await run(["add", "docs/time-log.md"]);
      await run(["commit", "-q", "-m", "the lane, with its rows"]);
      const logged = await capture(["rev-parse", "HEAD"]);
      await run(["branch", "--force", "main", "HEAD"]);

      await writeNotes(
        cloneState(),
        [{ ...LANDED[0]!, full: logged, sha: logged.slice(0, 7) }],
        "main",
        root,
      );

      const ledger = await Bun.file(join(root, "docs/time-log.md")).text();
      expect(ledger).toContain("*Measured:");
      // The rows the session wrote are untouched above it.
      expect(ledger).toContain("Bottleneck: reading.");
      expect(await capture(["show", "--name-only", "--format=", "HEAD"])).toContain(
        "docs/time-log.md",
      );
    },
    repoTimeout(25),
  );

  test(
    "is not stamped at all by a landing that logged nothing",
    async () => {
      const before = await Bun.file(join(root, "docs/time-log.md")).text();
      await writeFile(join(root, "readme.md"), "three\n");
      await run(["commit", "-q", "--only", "readme.md", "-m", "a lane with no rows"]);
      const quiet = await capture(["rev-parse", "HEAD"]);
      await run(["branch", "--force", "main", "HEAD"]);

      await writeNotes(
        cloneState(),
        [{ ...LANDED[0]!, full: quiet, sha: quiet.slice(0, 7) }],
        "main",
        root,
      );

      // Byte for byte: a measurement under somebody else's rows is worse than
      // none, and this file is a record.
      expect(await Bun.file(join(root, "docs/time-log.md")).text()).toBe(before);
    },
    repoTimeout(25),
  );
});
