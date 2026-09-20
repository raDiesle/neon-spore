import { afterEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { reconcile } from "../reconcile.js";

/**
 * The trunk reconciled against `origin`, in a repository git actually made.
 *
 * `notes-merge.ts` is proved against hand-written strings, which says
 * everything about the merge and nothing about the wiring — whether the
 * resolver is reached at all, whether the rebase is run in the tree that has
 * the trunk checked out, and whether a refusal leaves that trunk where it was.
 * That is what a hand-reconciliation actually costs and it is what this file
 * holds.
 *
 * So: a bare `origin`, two clones of it that each land a commit, and the real
 * `git rebase`. `replay-repo.test.ts` is the pattern, `realpath` on the way in
 * for the reason `repo.test.ts` gives.
 */

const PREAMBLE = "# Release notes\n\nWhat each landing changed, newest first.\n";

function note(sha: string, subject: string): string {
  return `\n## 2026-09-16 · ${sha} — ${subject}\n\nWhat it did.\n`;
}

/** The directory the hook removes. Only the hook reads it — see `diverged`. */
let dir = "";

/**
 * A bare origin and two clones, both of which have landed a commit the other
 * has not — which is the whole of the situation, and the only one `bun run
 * push` ever refused for.
 *
 * `ours` gets the trunk with a release note on top and, optionally, a file of
 * its own; `theirs` is already pushed. Returns where `ours` is.
 *
 * The path is a local, and `dir` is written once for the hook: this read the
 * module's `dir` back after every `await` until 17 September 2026, and a case
 * that timed out under load — `afterEach` had removed the directory and set
 * `dir` to `""` while its clones were still being made — went on with
 * `join("", "ours")`, which is the checkout, and `bun run land` then refused
 * for `ours/` and `them/` lying in the worktree root (`docs/queue.md`).
 */
async function diverged(mine: string, theirs: string, file?: [string, string]): Promise<string> {
  const root = await realpath(await mkdtemp(join(tmpdir(), "ns-reconcile-")));
  dir = root;
  const origin = join(root, "origin.git");
  await run(["init", "--bare", "-b", "main", "--quiet", origin], root);

  const seed = join(root, "seed");
  await run(["clone", "--quiet", origin, seed], root);
  await run(["config", "user.email", "test@example.com"], seed);
  await run(["config", "user.name", "Test"], seed);
  await Bun.write(join(seed, "docs", "release-notes.md"), PREAMBLE);
  await Bun.write(join(seed, "code.ts"), "export const n = 1;\n");
  await run(["add", "."], seed);
  await run(["commit", "-q", "-m", "the record, and something to build on"], seed);
  await run(["push", "--quiet", "origin", "main"], seed);

  const them = join(root, "them");
  await run(["clone", "--quiet", origin, them], root);
  await run(["config", "user.email", "them@example.com"], them);
  await run(["config", "user.name", "Them"], them);
  await Bun.write(join(them, "docs", "release-notes.md"), PREAMBLE + note("bbbbbbb", theirs));
  await run(["add", "."], them);
  await run(["commit", "-q", "-m", theirs], them);
  await run(["push", "--quiet", "origin", "main"], them);

  const ours = join(root, "ours");
  await run(["clone", "--quiet", origin, ours], root);
  await run(["config", "user.email", "us@example.com"], ours);
  await run(["config", "user.name", "Us"], ours);
  // Rewound to the seed, so this clone is a session that landed before the
  // other one pushed: its own commit is on top of the commit they shared.
  await run(["reset", "--hard", "--quiet", "HEAD~1"], ours);
  await Bun.write(join(ours, "docs", "release-notes.md"), PREAMBLE + note("ccccccc", mine));
  if (file) await Bun.write(join(ours, file[0]), file[1]);
  await run(["add", "."], ours);
  await run(["commit", "-q", "-m", mine], ours);
  await run(["fetch", "--quiet", "origin", "main"], ours);
  return ours;
}

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
});

describe("two sessions that both pushed", () => {
  test(
    "replays the trunk onto origin's and settles the release notes",
    async () => {
      const ours = await diverged("ours, landed here", "theirs, pushed first");
      const out = await reconcile(ours, "main");
      expect(out.ok, out.lines.join("\n")).toBe(true);
      expect(out.lines.join("\n")).toContain("docs/release-notes.md");

      const text = await Bun.file(join(ours, "docs", "release-notes.md")).text();
      expect(text).toContain("ours, landed here");
      expect(text).toContain("theirs, pushed first");
      // Newest first: this trunk's entry sits above the one origin already had.
      expect(text.indexOf("ccccccc")).toBeLessThan(text.indexOf("bbbbbbb"));
      expect(text.startsWith(PREAMBLE)).toBe(true);
      // `diverged` is twenty-one `git` calls and `reconcile` is a rebase over
      // two commits; the rest of the count is slack (`repo-time.ts`).
    },
    repoTimeout(30),
  );

  test(
    "leaves the trunk one commit ahead of origin and none behind",
    async () => {
      const ours = await diverged("ours", "theirs");
      expect((await reconcile(ours, "main")).ok).toBe(true);
      expect(await run(["rev-list", "--count", "origin/main..main"], ours)).toBe("1");
      expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("0");
    },
    repoTimeout(30),
  );

  test(
    "stops on a conflict nobody can settle, and the trunk does not move",
    async () => {
      // Both sides rewrote the same line of the same source file, which is a
      // real disagreement and is a person's.
      const ours = await diverged("ours", "theirs", ["code.ts", "export const n = 2;\n"]);
      const them = join(ours, "..", "them");
      await Bun.write(join(them, "code.ts"), "export const n = 3;\n");
      await run(["commit", "-qam", "theirs, again"], them);
      await run(["push", "--quiet", "origin", "main"], them);
      await run(["fetch", "--quiet", "origin", "main"], ours);
      const was = await run(["rev-parse", "main"], ours);

      const out = await reconcile(ours, "main");
      expect(out.ok).toBe(false);
      expect(out.lines.join("\n")).toContain("code.ts");
      expect(await run(["rev-parse", "main"], ours)).toBe(was);
      // And no rebase was left half-done for the next command to trip over.
      expect(await run(["status", "--porcelain"], ours)).toBe("");
    },
    repoTimeout(35),
  );

  test(
    "keeps its clones under its own directory after the hook has let go of it",
    async () => {
      const started = diverged("ours", "theirs");
      // What `afterEach` does behind a case that timed out: the module's
      // handle is cleared while the clones are still being made.
      await new Promise((settle) => setTimeout(settle, 50));
      const root = dir;
      dir = "";
      const ours = await started;
      expect(root).not.toBe("");
      expect(ours.startsWith(root)).toBe(true);
      expect(existsSync(join(process.cwd(), "ours")), "a clone in the checkout").toBe(false);
      expect(existsSync(join(process.cwd(), "them")), "a clone in the checkout").toBe(false);
      await rm(root, { recursive: true, force: true });
    },
    repoTimeout(30),
  );

  test(
    "refuses while the trunk's own worktree has uncommitted work",
    async () => {
      const ours = await diverged("ours", "theirs");
      await Bun.write(join(ours, "code.ts"), "export const n = 9;\n");
      const out = await reconcile(ours, "main");
      expect(out.ok).toBe(false);
      expect(out.lines.join("\n")).toContain("code.ts");
      expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("1");
    },
    repoTimeout(30),
  );

  test(
    "replays in this checkout when no worktree has the trunk out",
    async () => {
      // A clone standing on its own lane branch, with `main` a ref beside it:
      // the shape of every session started from a phone, and the one this
      // used to refuse outright (`docs/cloud-session.md`).
      const ours = await diverged("ours, landed here", "theirs, pushed first");
      await run(["checkout", "--quiet", "-b", "lane"], ours);
      const out = await reconcile(ours, "main");
      expect(out.ok, out.lines.join("\n")).toBe(true);
      expect(out.lines.join("\n")).toContain("this checkout");
      expect(await run(["rev-list", "--count", "origin/main..main"], ours)).toBe("1");
      expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("0");
      // Read off `main` rather than off disk: the checkout has been put back
      // on the lane, so the settled record is in the trunk's commit and the
      // working tree still holds the lane's own copy.
      const text = await run(["show", "main:docs/release-notes.md"], ours);
      expect(text).toContain("theirs, pushed first");
      expect(text).toContain("ours, landed here");
    },
    repoTimeout(35),
  );

  test(
    "puts the checkout back on the branch it was standing on",
    async () => {
      const ours = await diverged("ours", "theirs");
      await run(["checkout", "--quiet", "-b", "lane"], ours);
      expect((await reconcile(ours, "main")).ok).toBe(true);
      expect(await run(["rev-parse", "--abbrev-ref", "HEAD"], ours)).toBe("lane");
      expect(await run(["status", "--porcelain"], ours)).toBe("");
    },
    repoTimeout(35),
  );

  test(
    "puts the branch back even when the replay refused",
    async () => {
      const ours = await diverged("ours", "theirs", ["code.ts", "export const n = 2;\n"]);
      const them = join(ours, "..", "them");
      await Bun.write(join(them, "code.ts"), "export const n = 3;\n");
      await run(["commit", "-qam", "theirs, again"], them);
      await run(["push", "--quiet", "origin", "main"], them);
      await run(["fetch", "--quiet", "origin", "main"], ours);
      await run(["checkout", "--quiet", "-b", "lane"], ours);
      const was = await run(["rev-parse", "main"], ours);

      const out = await reconcile(ours, "main");
      expect(out.ok).toBe(false);
      expect(await run(["rev-parse", "main"], ours)).toBe(was);
      expect(await run(["rev-parse", "--abbrev-ref", "HEAD"], ours)).toBe("lane");
      expect(await run(["status", "--porcelain"], ours)).toBe("");
    },
    repoTimeout(40),
  );

  test(
    "refuses while the only checkout there is has uncommitted work",
    async () => {
      const ours = await diverged("ours", "theirs");
      await run(["checkout", "--quiet", "-b", "lane"], ours);
      await Bun.write(join(ours, "code.ts"), "export const n = 9;\n");
      const out = await reconcile(ours, "main");
      expect(out.ok).toBe(false);
      expect(out.lines.join("\n")).toContain("code.ts");
      expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("1");
      // And the work is still there, on the branch it was written on.
      expect(await run(["rev-parse", "--abbrev-ref", "HEAD"], ours)).toBe("lane");
      expect(await Bun.file(join(ours, "code.ts")).text()).toBe("export const n = 9;\n");
    },
    repoTimeout(30),
  );
});
