import { afterEach, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { reconcile } from "../reconcile.js";

/**
 * **A lane's worktree on disk is not uncommitted work on the trunk.**
 *
 * Every worktree lives under `.claude/worktrees/`, inside the checkout that
 * has `main` out, and git lists a directory holding a `.git` file as
 * untracked. On the owner's machine `.git/info/exclude` hid it, so nothing
 * refused there; a cloud clone has no such line, and after `bun run land
 * --keep` its `bun run push` refused on the lane's own directory until the
 * worktree was removed by hand (26 September 2026, `docs/queue.md`). The
 * ignore is now in `.gitignore`, and this holds `reconcile`'s clean-tree check
 * to it with the repository's real file.
 */

let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
}, CLEANUP_MS);

test(
  "the trunk reconciles with a lane's worktree registered under .claude/worktrees/",
  async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "ns-push-worktrees-")));
    dir = root;
    const origin = join(root, "origin.git");
    await run(["init", "--bare", "-b", "main", "--quiet", origin], root);

    const ours = join(root, "ours");
    await run(["clone", "--quiet", origin, ours], root);
    await run(["config", "user.email", "us@example.com"], ours);
    await run(["config", "user.name", "Us"], ours);
    const ignore = await Bun.file(new URL("../../../.gitignore", import.meta.url)).text();
    await Bun.write(join(ours, ".gitignore"), ignore);
    await Bun.write(join(ours, "code.ts"), "export const n = 1;\n");
    await run(["add", "."], ours);
    await run(["commit", "-q", "-m", "the ignore, and something to build on"], ours);
    await run(["push", "--quiet", "origin", "main"], ours);

    // Somebody else pushed, so the push has something to reconcile.
    const them = join(root, "them");
    await run(["clone", "--quiet", origin, them], root);
    await run(["config", "user.email", "them@example.com"], them);
    await run(["config", "user.name", "Them"], them);
    await Bun.write(join(them, "theirs.ts"), "export const t = 1;\n");
    await run(["add", "."], them);
    await run(["commit", "-q", "-m", "theirs"], them);
    await run(["push", "--quiet", "origin", "main"], them);

    // Ours landed a commit of its own, and kept its lane's worktree.
    await Bun.write(join(ours, "mine.ts"), "export const m = 1;\n");
    await run(["add", "mine.ts"], ours);
    await run(["commit", "-q", "-m", "ours"], ours);
    await run(["worktree", "add", "--quiet", "-b", "lane", ".claude/worktrees/lane"], ours);
    await run(["fetch", "--quiet", "origin", "main"], ours);

    const out = await reconcile(ours, "main");
    expect(out.ok, out.lines.join("\n")).toBe(true);
    expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("0");
  },
  repoTimeout(20),
);
