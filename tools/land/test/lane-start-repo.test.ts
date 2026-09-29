import { afterEach, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { branchMade, claimTimes } from "../lane-start.js";

/**
 * The two things the landing's stamp asks the repository about a lane's past:
 * the trunk's claim commits that name its branch, and the branch's creation.
 */

let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
});

async function commitAt(tree: string, when: number, subject: string): Promise<void> {
  const date = `${when} +0000`;
  await run(["commit", "-q", "-m", subject], tree, {
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date,
  });
}

test(
  "finds the claim that names the branch and the branch's own creation",
  async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), "ns-lane-start-")));
    dir = root;
    await run(["init", "-q", "-b", "main", root], root);
    await run(["config", "user.email", "us@example.com"], root);
    await run(["config", "user.name", "Us"], root);
    await Bun.write(join(root, "docs", "queue.md"), "# Queue\n\n## One item\n");
    await run(["add", "."], root);
    await commitAt(root, 1_790_000_000, "seed");

    await Bun.write(
      join(root, "docs", "queue.md"),
      "# Queue\n\n## One item\n- **Taken:** 2026-09-29, claude/lane-a (claim: claude/queue-one-item)\n",
    );
    await run(["add", "."], root);
    await commitAt(root, 1_790_000_600, 'Mark "One item" taken');
    // A claim for somebody else's branch is not this lane's.
    await Bun.write(
      join(root, "docs", "queue.md"),
      "# Queue\n\n## One item\n- **Taken:** 2026-09-29, claude/lane-a (claim: claude/queue-one-item)\n\n## Two\n- **Taken:** 2026-09-29, claude/lane-b\n",
    );
    await run(["add", "."], root);
    await commitAt(root, 1_790_000_900, 'Mark "Two" taken');

    expect(await claimTimes(root, "claude/lane-a", "main")).toEqual([1_790_000_600]);
    expect(await claimTimes(root, "claude/queue-one-item", "main")).toEqual([1_790_000_600]);
    expect(await claimTimes(root, "claude/lane-c", "main")).toEqual([]);

    await run(["branch", "claude/lane-a"], root);
    const made = await branchMade(root, "claude/lane-a");
    expect(typeof made).toBe("number");
    expect(await branchMade(root, "claude/never-made")).toBeUndefined();
  },
  repoTimeout(16),
);
