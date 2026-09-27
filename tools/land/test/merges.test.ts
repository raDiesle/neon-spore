import { afterEach, expect, test } from "bun:test";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repoTimeout, gitIn as run } from "../../test/repo-time.js";
import { mergesSaid } from "../merges.js";

/**
 * `bun run push` refuses a trunk that would add a merge commit to `origin`
 * (`merges.ts`), and only one it would add: the merge `11f25490a` already on
 * `origin/main` must not stop every push after it.
 */

let dir = "";

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  dir = "";
});

/** A clone of a bare origin with one commit pushed, and a `commit` helper. */
async function clone(): Promise<{ ours: string; commit: (file: string) => Promise<void> }> {
  const root = await realpath(await mkdtemp(join(tmpdir(), "ns-push-merges-")));
  dir = root;
  const origin = join(root, "origin.git");
  await run(["init", "--bare", "-b", "main", "--quiet", origin], root);
  const ours = join(root, "ours");
  await run(["clone", "--quiet", origin, ours], root);
  await run(["config", "user.email", "us@example.com"], ours);
  await run(["config", "user.name", "Us"], ours);
  const commit = async (file: string) => {
    await Bun.write(join(ours, file), `export const x = "${file}";\n`);
    await run(["add", file], ours);
    await run(["commit", "-q", "-m", file], ours);
  };
  await commit("base.ts");
  await run(["push", "--quiet", "origin", "main"], ours);
  return { ours, commit };
}

/** A lane branched off the trunk, merged back into it with a merge commit. */
async function mergeLane(ours: string, commit: (file: string) => Promise<void>): Promise<void> {
  await run(["checkout", "-q", "-b", "lane"], ours);
  await commit("lane.ts");
  await run(["checkout", "-q", "main"], ours);
  await commit("trunk.ts");
  await run(["merge", "-q", "--no-ff", "--no-edit", "lane"], ours);
}

test(
  "a trunk that would send a merge commit is refused, naming it",
  async () => {
    const { ours, commit } = await clone();
    await mergeLane(ours, commit);
    const merge = await run(["log", "-1", "--format=%h", "main"], ours);

    const said = await mergesSaid(ours, "main");
    expect(said).not.toBeNull();
    expect(said).toContain("main carries a merge commit origin/main has not");
    expect(said).toContain(`${merge} Merge branch 'lane'`);
    expect(said).toContain("bun run land");
  },
  repoTimeout(14),
);

test(
  "a linear trunk ahead of origin is not refused",
  async () => {
    const { ours, commit } = await clone();
    await commit("one.ts");
    await commit("two.ts");
    expect(await mergesSaid(ours, "main")).toBeNull();
  },
  repoTimeout(10),
);

test(
  "a merge origin already carries does not stop the next push",
  async () => {
    const { ours, commit } = await clone();
    await mergeLane(ours, commit);
    await run(["push", "--quiet", "origin", "main"], ours);
    await commit("after.ts");
    expect(await mergesSaid(ours, "main")).toBeNull();
  },
  repoTimeout(14),
);
