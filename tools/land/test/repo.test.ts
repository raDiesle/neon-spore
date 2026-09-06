import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { idleDays } from "../idle.js";
import { orphanWorktrees } from "../orphans.js";
import { isDirty, removeWorktree } from "../worktree.js";

/**
 * The half of `tools/land` that only exists against a real repository.
 *
 * Everything else here is tested against fake disks and hand-written strings,
 * which proves the policies and proves nothing about the four functions that
 * spend their whole lives inside `git`: what `git worktree list --porcelain`
 * actually prints, what case it prints it in, whether an administrative
 * directory has a usable mtime, and whether git refuses a removal for the
 * reason we think it does. Those answers come from git or they do not come at
 * all — so this makes one repository, puts a worktree in it, and asks.
 *
 * `mkdtemp` plus real files, the pattern `tools/test/tree-moves.test.ts`
 * already uses. Nothing here assumes a separator or a case: the paths are
 * whatever the machine hands back, which is the point on Windows.
 */

let root = "";
let lane = "";

async function run(args: string[], cwd: string): Promise<void> {
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

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-land-"));
  await run(["init", "-b", "main", "--quiet"], root);
  await run(["config", "user.email", "test@example.com"], root);
  await run(["config", "user.name", "Test"], root);
  // The real repository ignores `.claude/`, and it matters here: without it
  // every worktree under it would show up as untracked work in the tree above.
  await writeFile(join(root, ".gitignore"), ".claude/\n");
  await writeFile(join(root, "readme.md"), "one\n");
  await run(["add", "."], root);
  await run(["commit", "-q", "-m", "first"], root);

  await mkdir(join(root, ".claude", "worktrees"), { recursive: true });
  lane = join(root, ".claude", "worktrees", "lane");
  await run(["worktree", "add", "--quiet", lane, "-b", "lane"], root);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
});

describe("against a repository git actually made", () => {
  test("a registered worktree is not an orphan", async () => {
    expect(await orphanWorktrees(root)).toEqual([]);
  });

  test("a directory git never heard of is reported, and is not dirty", async () => {
    const stray = join(root, ".claude", "worktrees", "stray");
    await mkdir(stray);
    try {
      const found = await orphanWorktrees(root);
      expect(found.length).toBe(1);
      expect(resolve(found[0]?.path ?? "").toLowerCase()).toBe(resolve(stray).toLowerCase());
      expect(found[0]?.dirty).toBe(false);
    } finally {
      await rm(stray, { recursive: true, force: true });
    }
  });

  test("a worktree made a moment ago has been idle for no days", async () => {
    const idle = await idleDays(lane);
    expect(idle).toBeGreaterThanOrEqual(0);
    expect(idle).toBeLessThan(1);
  });

  test("a path that is not a checkout at all reads as idle for no days", async () => {
    expect(await idleDays(join(root, "nowhere"))).toBe(0);
  });

  /**
   * The defect this measure replaced. `.git/worktrees/<name>/` is rewritten by
   * essentially any git command aimed at the tree, including the sweep's own
   * probe and any `git status` a passing session runs, so a clock taken off it
   * was reset by being read — forty worktrees all reported 0.0 idle days and
   * `KEEP_DAYS` was unreachable. `logs/HEAD` moves when the ref moves and at no
   * other time, which is what these two ask git to demonstrate.
   */
  test("a command that only reads does not reset the clock", async () => {
    const admin = await capture(["-C", lane, "rev-parse", "--path-format=absolute", "--git-dir"]);
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000);
    await utimes(join(admin, "logs", "HEAD"), threeDaysAgo, threeDaysAgo);

    await capture(["-C", lane, "status", "--porcelain"]);
    await capture(["-C", lane, "rev-parse", "HEAD"]);

    expect(await idleDays(lane)).toBeGreaterThan(2.9);
  });

  test("and a commit does reset it", async () => {
    await writeFile(join(lane, "moved.txt"), "work\n");
    await run(["-C", lane, "add", "moved.txt"], root);
    await run(["-C", lane, "commit", "-q", "-m", "work"], root);
    expect(await idleDays(lane)).toBeLessThan(1);
  });

  test("uncommitted work stops a removal, and the tree is still there after", async () => {
    const wip = join(lane, "wip.txt");
    await writeFile(wip, "half a thought\n");
    expect(await isDirty(root, lane)).toBe(true);
    await expect(removeWorktree(root, lane)).rejects.toThrow(/uncommitted work/);
    expect(await Bun.file(wip).exists()).toBe(true);
    await rm(wip);
  });

  test("a clean one goes, and git stops listing it", async () => {
    expect(await isDirty(root, lane)).toBe(false);
    await removeWorktree(root, lane);
    expect(await Bun.file(join(lane, ".git")).exists()).toBe(false);
    const proc = Bun.spawn(["git", "worktree", "list", "--porcelain"], {
      cwd: root,
      stdout: "pipe",
    });
    const listing = await new Response(proc.stdout).text();
    await proc.exited;
    expect(listing.toLowerCase()).not.toContain("lane");
    // The directory goes before the registry entry does, so the two can never
    // be out of step in the direction that leaves an orphan behind: nothing is
    // deregistered until there is nothing left on disk to deregister.
    expect(await orphanWorktrees(root)).toEqual([]);
  });
});
