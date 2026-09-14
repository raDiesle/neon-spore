import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn } from "../git.js";
import { parseItems } from "../queue.js";
import { existsIn, foundDate, staleLine, staleness, substantive, type Trunk } from "../stale.js";

/**
 * The staleness mark, against a repository of its own.
 *
 * Three entries name the same tree. One was written after the last commit on
 * its file and is fresh. One was written the day before a commit touched its
 * file, and the mark names that commit. One names a file the tree no longer
 * has, and the mark names the file. The dates are the fixture's own, set on
 * the commits with `GIT_COMMITTER_DATE`, so the comparison is against what
 * git would print and not against a clock.
 */

const QUEUE = `# Queue

## Fresh: written after the last change to its file

- **Found:** 2026-09-12, claude/some-lane
- **Files:** \`src/step.ts\`

Nothing has moved under this one.

## Newer: a commit touched its file the day after

- **Found:** 2026-09-10, claude/some-lane
- **Files:** \`src/step.ts\`, \`src/hash.ts\`

The tree moved under this one.

## Gone: names a file that was renamed away

- **Found:** 2026-09-12, claude/some-lane
- **Files:** \`src/old-name.ts\`

The file it names is not there any more.

## Glob: names four files by a pattern

- **Found:** 2026-09-12, claude/some-lane
- **Files:** \`test/*-budget.test.ts\`

A pattern is a real name too.

## Ledgers: names its own file and the trunk's bookkeeping beside it

- **Found:** 2026-09-12, claude/some-lane
- **Files:** \`src/hash.ts\`, \`docs/queue.md\`, \`docs/time-log.md\`

Its own file has not moved; the ledgers have, as they do every landing.

## Ledgers only: names nothing but bookkeeping

- **Found:** 2026-09-12, claude/some-lane
- **Files:** \`docs/time-log.md\`

There is nothing else to judge this one on.

## Both: a real file moved, and the ledgers moved later still

- **Found:** 2026-09-10, claude/some-lane
- **Files:** \`src/step.ts\`, \`docs/time-log.md\`

The commit worth naming is the one that touched the code.
`;

let root = "";

function git(...args: string[]): string {
  const r = gitIn(root, ...args);
  if (!r.ok) throw new Error(`git ${args.join(" ")}: ${r.err}`);
  return r.out;
}

function commitOn(date: string, subject: string): void {
  const env = {
    GIT_AUTHOR_DATE: `${date}T12:00:00+0000`,
    GIT_COMMITTER_DATE: `${date}T12:00:00+0000`,
  };
  const r = Bun.spawnSync(["git", "commit", "-q", "-m", subject], {
    cwd: root,
    env: { ...process.env, ...env },
  });
  if (r.exitCode !== 0) throw new Error(r.stderr.toString());
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-stale-"));
  git("init", "-b", "main", "--quiet");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "Test");
  await mkdir(join(root, "src"));
  await mkdir(join(root, "test"));
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "time-log.md"), "one\n");
  await writeFile(join(root, "docs", "queue.md"), "one\n");
  await writeFile(join(root, "src", "step.ts"), "one\n");
  await writeFile(join(root, "src", "hash.ts"), "one\n");
  await writeFile(join(root, "test", "frame-budget.test.ts"), "one\n");
  git("add", ".");
  commitOn("2026-09-09", "first");
  await writeFile(join(root, "src", "step.ts"), "two\n");
  git("add", "src/step.ts");
  commitOn("2026-09-11", "Split the step");
  // The landing every lane makes: a time-log row and a queue claim, and nothing
  // else. It is last and it is newest, so an entry naming a ledger would be
  // marked against *this* if bookkeeping counted.
  await writeFile(join(root, "docs", "time-log.md"), "two\n");
  await writeFile(join(root, "docs", "queue.md"), "two\n");
  git("add", "docs");
  commitOn("2026-09-13", "Release notes for one landing");
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

function trunk(): Trunk {
  return {
    tree: git("ls-tree", "-r", "--name-only", "main").split("\n").filter(Boolean),
    log: (paths) => gitIn(root, "log", "-1", "--format=%h%x09%cs%x09%s", "main", "--", ...paths),
  };
}

describe("an entry's staleness against the trunk", () => {
  const items = parseItems(QUEUE, "queue");
  const [fresh, newer, gone, glob, ledgers, ledgersOnly, both] = items;

  it("reads the day off the Found: line", () => {
    expect(foundDate({ found: "2026-09-10, claude/some-lane" })).toBe("2026-09-10");
    expect(foundDate({ found: "" })).toBe("");
  });

  it("leaves an entry written after the last change alone", () => {
    const s = staleness(fresh!, trunk());
    expect(s.kind).toBe("fresh");
    expect(staleLine(s)).toBeUndefined();
  });

  it("marks an entry a later commit touched, naming the commit", () => {
    const s = staleness(newer!, trunk());
    expect(s.kind).toBe("newer");
    if (s.kind !== "newer") return;
    expect(s.newer.subject).toBe("Split the step");
    expect(s.newer.date).toBe("2026-09-11");
    // The commit that touched the code, which is no longer main's head: the
    // fixture lands a ledger-only commit after it.
    expect(s.newer.sha).toBe(git("log", "-1", "--format=%h", "main", "--", "src/step.ts").trim());
    expect(staleLine(s)).toContain("stale — a file it names changed after it: ");
    expect(staleLine(s)).toContain("Split the step (2026-09-11)");
  });

  it("marks an entry naming a file the trunk no longer has, naming the file", () => {
    const s = staleness(gone!, trunk());
    expect(s).toEqual({ kind: "gone", file: "src/old-name.ts" });
    expect(staleLine(s, "main")).toBe(
      "stale — src/old-name.ts is not on main; re-read before working it",
    );
  });

  /**
   * **The bookkeeping does not make an entry stale.** `docs/time-log.md` is
   * written by every landing because `CLAUDE.md` requires a row, `docs/queue.md`
   * by every claim and every `queue done`. Both entries left in the real queue
   * on 14 September 2026 were marked against a commit that had touched neither
   * their code nor their spec — only those two files — and an entry that is
   * stale from the next landing onward, forever, is one nobody can read
   * anything off.
   */
  it("does not mark an entry because the trunk's ledgers moved under it", () => {
    const s = staleness(ledgers!, trunk());
    expect(s.kind, "src/hash.ts has not moved since the entry").toBe("fresh");
    expect(staleLine(s)).toBeUndefined();
  });

  it("still names the commit that touched the code, not the ledger commit after it", () => {
    const s = staleness(both!, trunk());
    expect(s.kind).toBe("newer");
    if (s.kind !== "newer") return;
    expect(s.newer.subject).toBe("Split the step");
    expect(s.newer.date).toBe("2026-09-11");
  });

  /** An entry whose whole subject *is* a ledger has nothing else to be judged
   * on, so it is judged on that — over-warning there is the cheap way to be
   * wrong, and never warning at all is the expensive one. */
  it("falls back to the ledgers for an entry that names nothing else", () => {
    const s = staleness(ledgersOnly!, trunk());
    expect(s.kind).toBe("newer");
    if (s.kind !== "newer") return;
    expect(s.newer.subject).toBe("Release notes for one landing");
  });

  it("takes the bookkeeping out, and leaves it when it is all there is", () => {
    expect(substantive(["src/step.ts", "docs/queue.md", "docs/time-log.md"])).toEqual([
      "src/step.ts",
    ]);
    expect(substantive(["./docs/INDEX.md", "src/step.ts"])).toEqual(["src/step.ts"]);
    expect(substantive(["docs/queue.md"])).toEqual(["docs/queue.md"]);
    expect(substantive(["docs/spec/bestiary.md"])).toEqual(["docs/spec/bestiary.md"]);
  });

  it("reads a pattern, a directory and a file as names", () => {
    expect(staleness(glob!, trunk()).kind).toBe("fresh");
    const tree = ["src/step.ts", "test/frame-budget.test.ts", "test/wave-budget.test.ts"];
    expect(existsIn(tree, "src")).toBe(true);
    expect(existsIn(tree, "src/")).toBe(true);
    expect(existsIn(tree, "./src/step.ts")).toBe(true);
    expect(existsIn(tree, "test/*-budget.test.ts")).toBe(true);
    expect(existsIn(tree, "*-budget.test.ts")).toBe(false);
    expect(existsIn(tree, "**/wave-budget.test.ts")).toBe(true);
    expect(existsIn(tree, "test/w?ve-budget.test.ts")).toBe(true);
    expect(existsIn(tree, "src/step")).toBe(false);
  });

  it("does not judge an entry that has no date or no files", () => {
    const [bare] = parseItems("# Queue\n\n## No fields\n\nJust prose.\n", "queue");
    expect(staleness(bare!, trunk()).kind).toBe("fresh");
  });
});
