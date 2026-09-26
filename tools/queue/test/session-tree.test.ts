import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { takenMark } from "../mark.js";
import { promptFor } from "../prompt.js";
import { parseItems } from "../queue.js";
import { sessionTree, workedOn } from "../tree.js";

/**
 * Where `next` tells a session to check its branch out. A desktop session
 * opened in a worktree of its own is refused every write outside it, so a new
 * tree for the lane is one it could not edit: from a clean worktree the prompt
 * says `git checkout` there, and from anywhere else it says `git worktree add`.
 */

let root = "";
let session = "";
const run = (args: string[]): Promise<string> => gitIn(args, root);

beforeAll(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-queue-session-")));
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

describe("sessionTree", () => {
  it(
    "is nothing from the main checkout",
    () => {
      expect(sessionTree(root)).toBe("");
    },
    repoTimeout(2),
  );

  it(
    "is the worktree's own path from a clean worktree",
    () => {
      expect(sessionTree(session)).toBe(session);
    },
    repoTimeout(2),
  );

  it(
    "is nothing from a worktree with work uncommitted in it",
    async () => {
      await writeFile(join(session, "draft"), "y\n");
      expect(sessionTree(session)).toBe("");
      await rm(join(session, "draft"));
    },
    repoTimeout(2),
  );
});

describe("the prompt's checkout line", () => {
  const [item] = parseItems("## A lane\n\n- **Found:** today\n\nDo the thing.\n", "queue");
  if (item === undefined) throw new Error("the fixture parsed to nothing");
  const branch = "claude/queue-a-lane";

  it("adds a worktree under the main checkout when the session has none of its own", () => {
    const prompt = promptFor(item, branch, { home: "/repo" });
    expect(prompt).toContain(`git worktree add /repo/.claude/worktrees/queue-a-lane ${branch}`);
    expect(prompt).not.toContain("checkout claude/");
  });

  it("checks the branch out in the session's clean worktree, and still installs", () => {
    const prompt = promptFor(item, branch, { home: "/repo", here: "/repo/.claude/worktrees/s" });
    expect(prompt).toContain(`git -C /repo/.claude/worktrees/s checkout ${branch}`);
    expect(prompt).not.toContain("git worktree add");
    expect(prompt).toContain("bun install");
  });
});

/**
 * Whose branch a `next` claim's mark names. From a clean worktree the prompt
 * above says `git checkout` the claim right there, so the tree's own `HEAD` —
 * the lane it just landed — is the one branch the work will never be on.
 */
describe("the branch a claim's mark names as worked", () => {
  const claimed = "claude/queue-a-lane";

  it(
    "is the claim itself when `next` deals it to a clean session worktree",
    () => {
      expect(workedOn(claimed, session, true)).toBe(claimed);
      expect(takenMark(claimed, "2026-09-26", workedOn(claimed, session, true))).toBe(
        `2026-09-26, ${claimed}`,
      );
    },
    repoTimeout(2),
  );

  it(
    "is the tree's own branch when `take` drains an item onto the lane it stands on",
    () => {
      expect(workedOn(claimed, session, false)).toBe("session");
    },
    repoTimeout(2),
  );

  it(
    "is the tree's own branch from the main checkout, which `next` sends to a new tree",
    () => {
      expect(workedOn(claimed, root, true)).toBe("main");
    },
    repoTimeout(2),
  );

  it(
    "is the tree's own branch from a worktree with work uncommitted in it",
    async () => {
      await writeFile(join(session, "draft"), "y\n");
      expect(workedOn(claimed, session, true)).toBe("session");
      await rm(join(session, "draft"));
    },
    repoTimeout(2),
  );
});
