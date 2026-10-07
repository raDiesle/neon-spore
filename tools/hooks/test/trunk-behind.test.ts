import { describe, expect, it } from "bun:test";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { bringUp, type TrunkState, trunkMove } from "../trunk-behind.ts";

/**
 * A worktree behind the local `main` is told so by the session-start hook,
 * and fast-forwarded when nothing of its own is in the way
 * (`trunk-behind.ts`). The decision is held on its own, and once through a
 * real repository with a real worktree, which is the shape of 6 October 2026.
 */

const BEHIND: TrunkState = { worktree: true, branch: "lane", behind: 3, ahead: 0, clean: true };

describe("trunkMove", () => {
  it("fast-forwards a clean worktree with nothing of its own", () => {
    expect(trunkMove(BEHIND)).toEqual({ kind: "forward" });
  });

  it("only says so when the worktree has commits or work of its own", () => {
    const own = trunkMove({ ...BEHIND, ahead: 2 });
    expect(own.kind).toBe("say");
    expect(own.kind === "say" && own.said).toContain("3 commits");
    expect(own.kind === "say" && own.said).toContain("git rebase main");
    expect(trunkMove({ ...BEHIND, clean: false }).kind).toBe("say");
  });

  it("says nothing up to date, on main, or outside a worktree", () => {
    expect(trunkMove({ ...BEHIND, behind: 0 })).toEqual({ kind: "none" });
    expect(trunkMove({ ...BEHIND, branch: "main" })).toEqual({ kind: "none" });
    expect(trunkMove({ ...BEHIND, worktree: false })).toEqual({ kind: "none" });
  });
});

describe("bringUp, in a real worktree", () => {
  it(
    "moves a worktree the local main left behind, and tells one it cannot move",
    async () => {
      const root = await realpath(await mkdtemp(join(tmpdir(), "trunk-behind-")));
      const tree = join(root, "lane");
      const run = (args: string[], cwd = root) => gitIn(args, cwd);
      const commit = async (cwd: string, file: string) => {
        await writeFile(join(cwd, file), file);
        await run(["add", file], cwd);
        await run(["commit", "-qm", file], cwd);
      };
      try {
        await run(["init", "-q", "-b", "main"]);
        await run(["config", "user.email", "t@t"]);
        await run(["config", "user.name", "t"]);
        await commit(root, "a");
        await run(["worktree", "add", "-q", "-b", "lane", tree]);
        expect(bringUp(tree)).toBeNull();

        await commit(root, "b");
        await commit(root, "c");
        expect(bringUp(tree)).toContain("2 commits behind the local main");
        expect(await run(["rev-parse", "HEAD"], tree)).toBe(await run(["rev-parse", "main"]));

        await commit(tree, "d");
        await commit(root, "e");
        const said = bringUp(tree);
        expect(said).toContain("1 commit this worktree does not");
        expect(said).toContain("1 commit(s) of its own");
        expect(bringUp(root)).toBeNull();
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
    repoTimeout(20),
  );
});
