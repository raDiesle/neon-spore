import { afterEach, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { reconcile } from "../reconcile.js";

/**
 * A lane's worktree on disk does not stop `bun run push` reconciling.
 *
 * `land --keep` leaves the lane's tree at `.claude/worktrees/<lane>`, inside
 * the checkout that has the trunk out, and git lists a directory with a `.git`
 * file in it as untracked — so `reconcile`'s clean-tree check refused the push
 * until the worktree was removed by hand (`docs/queue.md`, 26 September 2026).
 * The repository's own `.gitignore` is what answers it, so that is the file
 * this repository is given: a copy of the real one, not a line written here.
 */

let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
}, CLEANUP_MS);

test(
  "reconciles while a registered worktree sits under .claude/worktrees",
  async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "ns-reconcile-wt-")));
    dir = root;
    const origin = join(root, "origin.git");
    await run(["init", "--bare", "-b", "main", "--quiet", origin], root);

    const ignore = await Bun.file(new URL("../../../.gitignore", import.meta.url)).text();
    const ours = join(root, "ours");
    await run(["clone", "--quiet", origin, ours], root);
    await run(["config", "user.email", "us@example.com"], ours);
    await run(["config", "user.name", "Us"], ours);
    await Bun.write(join(ours, ".gitignore"), ignore);
    await Bun.write(join(ours, "a.ts"), "export const a = 1;\n");
    await run(["add", "."], ours);
    await run(["commit", "-q", "-m", "seed"], ours);
    await run(["push", "--quiet", "origin", "main"], ours);

    const them = join(root, "them");
    await run(["clone", "--quiet", origin, them], root);
    await run(["config", "user.email", "them@example.com"], them);
    await run(["config", "user.name", "Them"], them);
    await Bun.write(join(them, "b.ts"), "export const b = 1;\n");
    await run(["add", "."], them);
    await run(["commit", "-q", "-m", "theirs"], them);
    await run(["push", "--quiet", "origin", "main"], them);

    await Bun.write(join(ours, "c.ts"), "export const c = 1;\n");
    await run(["add", "c.ts"], ours);
    await run(["commit", "-q", "-m", "ours"], ours);
    await run(
      ["worktree", "add", "--quiet", "-b", "lane", join(ours, ".claude", "worktrees", "lane")],
      ours,
    );
    await run(["fetch", "--quiet", "origin", "main"], ours);

    const out = await reconcile(ours, "main");
    expect(out.ok, out.lines.join("\n")).toBe(true);
    expect(await run(["rev-list", "--count", "main..origin/main"], ours)).toBe("0");
    expect(await run(["rev-list", "--count", "origin/main..main"], ours)).toBe("1");
  },
  repoTimeout(25),
);
