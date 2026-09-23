import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { mainCheckout } from "../tree.js";

/**
 * Where `next` tells a session to put a lane's worktree.
 *
 * The desktop app starts a session in `.claude/worktrees/<session>/`, and the
 * prompt's relative `git worktree add .claude/worktrees/<name>` run from there
 * made a tree inside a tree on 23 September 2026. `mainCheckout` is the path
 * the prompt now prints under, and it has to be the same answer from the main
 * checkout and from any worktree of it.
 */

let root = "";
let session = "";
const run = (args: string[]): Promise<string> => gitIn(args, root);

beforeAll(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-queue-home-")));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await writeFile(join(root, "README"), "x\n");
  await run(["add", "README"]);
  await run(["commit", "-q", "-m", "first"]);
  session = join(root, ".claude", "worktrees", "session");
  await run(["worktree", "add", "-q", "-b", "session", session]);
}, repoTimeout(8));

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
}, repoTimeout(2));

describe("mainCheckout", () => {
  it(
    "is the main checkout from the main checkout",
    () => {
      expect(mainCheckout(root)).toBe(root);
    },
    repoTimeout(2),
  );

  it(
    "is the main checkout from a session's worktree, not the worktree",
    () => {
      expect(mainCheckout(session)).toBe(root);
    },
    repoTimeout(2),
  );
});
