import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { withoutPoseRow } from "../../versus/pose-row.js";
import { POSE_FILE } from "../pose-merge.js";
import { replay } from "../replay.js";

/**
 * `SLOT_POSE` through a real rebase: the trunk's `drop` takes a slot's row
 * out while the lane opens a slot and adds its own, which is two edits to the
 * same lines and a stopped landing without `pose-merge.ts`.
 * `replay-repo.test.ts` gives the reason this is a real repository and not
 * strings.
 */

let root = "";

async function git(args: string[]): Promise<void> {
  await gitIn(args, root);
}

async function commit(text: string, message: string): Promise<void> {
  await Bun.write(join(root, POSE_FILE), text);
  await git(["add", "-A"]);
  await git(["commit", "-q", "-m", message]);
}

const BASE = `/** The map. */
const SLOT_POSE: Record<string, string> = {
  "scuttle:hang": "THE SCUTTLE · HELD",
};
`;

beforeAll(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-replay-pose-")));
  await git(["init", "-b", "main", "--quiet"]);
  await git(["config", "user.email", "test@example.com"]);
  await git(["config", "user.name", "Test"]);
  await commit(BASE, "a slot open");

  await git(["switch", "-c", "lane", "--quiet"]);
  await commit(
    BASE.replace("};", `  "cannon:shot": "CANNON · FIRING",\n};`),
    "my lane opens a slot",
  );
  await git(["switch", "main", "--quiet"]);
  await commit(withoutPoseRow(BASE, "scuttle:hang"), "their lane drops one");
  await git(["switch", "lane", "--quiet"]);
}, repoTimeout(20));

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
}, repoTimeout(2));

describe("two lanes changing SLOT_POSE in the same hours", () => {
  test(
    "replays without stopping, and says it settled the map",
    async () => {
      const out = await replay(root, "main");
      expect(out.ok).toBe(true);
      expect(out.resolved).toContain(POSE_FILE);
    },
    repoTimeout(12),
  );

  test(
    "keeps the lane's new row and not the dropped one",
    async () => {
      const text = await Bun.file(join(root, POSE_FILE)).text();
      expect(text).toBe(`/** The map. */
const SLOT_POSE: Record<string, string> = {
  "cannon:shot": "CANNON · FIRING",
};
`);
    },
    repoTimeout(2),
  );
});
