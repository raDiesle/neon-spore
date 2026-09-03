import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitDirOf, isTreeMove, locked } from "../dev/tree-moves.js";

/**
 * The two questions the dev supervisor asks: which directory to watch, and
 * which of its files mean the working tree was rewritten. Both are easy to get
 * subtly wrong in a way nothing else notices — a worktree watching the main
 * checkout's index would restart on somebody else's rebase and not on its own,
 * and `index.lock` counted as a move would restart into a half-written tree,
 * which is the exact failure the supervisor exists to prevent.
 */

async function tree(): Promise<string> {
  return await mkdtemp(join(tmpdir(), "ns-tree-"));
}

describe("the git directory of a checkout", () => {
  it("is `.git` itself when `.git` is a directory", async () => {
    const root = await tree();
    try {
      await mkdir(join(root, ".git"));
      expect(gitDirOf(root)).toBe(`${root.replaceAll("\\", "/")}/.git`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("follows the pointer when `.git` is a worktree's file", async () => {
    const root = await tree();
    try {
      const target = `${root.replaceAll("\\", "/")}/main/.git/worktrees/lane`;
      await writeFile(join(root, ".git"), `gitdir: ${target}\n`);
      expect(gitDirOf(root)).toBe(target);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("resolves a relative pointer against the checkout, not the process", async () => {
    const root = await tree();
    try {
      await writeFile(join(root, ".git"), "gitdir: ../repo/.git/worktrees/lane\n");
      const slashed = root.replaceAll("\\", "/");
      expect(gitDirOf(root)).toBe(`${slashed}/../repo/.git/worktrees/lane`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("says nothing rather than guessing when there is no `.git` at all", async () => {
    const root = await tree();
    try {
      expect(gitDirOf(root)).toBeUndefined();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("a file that means the tree moved", () => {
  it("counts the index, which every kind of rewrite touches", () => {
    // `checkout -- <paths>` moves no ref at all; the index is the only signal.
    expect(isTreeMove("index")).toBe(true);
  });

  it("counts the heads a merge, a rebase and a revert leave behind", () => {
    for (const name of ["HEAD", "ORIG_HEAD", "MERGE_HEAD", "REBASE_HEAD", "REVERT_HEAD"]) {
      expect(isTreeMove(name)).toBe(true);
    }
  });

  it("does not count the lock, which means git is still writing", () => {
    expect(isTreeMove("index.lock")).toBe(false);
  });

  it("does not count the object and log churn a fetch makes", () => {
    for (const name of ["objects/ab/cdef", "logs/HEAD", "FETCH_HEAD", "config", "packed-refs"]) {
      expect(isTreeMove(name)).toBe(false);
    }
  });

  it("reads the separator the way Windows hands it over", () => {
    expect(isTreeMove(String.raw`logs\HEAD`)).toBe(false);
  });
});

describe("the index lock", () => {
  it("is absent in a directory that has none", async () => {
    const root = await tree();
    try {
      expect(locked(root)).toBe(false);
      await writeFile(join(root, "index.lock"), "");
      expect(locked(root)).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
