import { describe, expect, it } from "bun:test";
import { type Branches, spentBranches } from "../spent.js";

/**
 * The claim a lane on this machine landed and walked away from — the mark the
 * handles entry carried on 22 September 2026, when each of its eleven lanes
 * narrowed the title and the next one's `take` was refused (`spent.ts`).
 */

const WORKED = "claude/queue-the-tasters-three-handles";
const CLAIM = "claude/queue-seven-handles-are-heard";
const MARK = `2026-09-22, ${WORKED} (claim: ${CLAIM})`;

function repo(over: Partial<{ local: string[]; out: string[]; unmerged: string[] }>): Branches {
  const local = new Set(over.local ?? [CLAIM]);
  const unmerged = new Set(over.unmerged ?? []);
  return {
    local: (b) => local.has(b),
    checkedOut: new Set(over.out ?? []),
    merged: (b) => !unmerged.has(b),
  };
}

describe("spentBranches", () => {
  it("names the claim branch left standing once the worked one has landed and gone", () => {
    expect(spentBranches(MARK, repo({}))).toEqual([CLAIM]);
  });

  it("names both when the worked branch was kept and nobody is on it", () => {
    expect(spentBranches(MARK, repo({ local: [WORKED, CLAIM] }))).toEqual([WORKED, CLAIM]);
  });

  it("is not spent while a worktree stands on either branch", () => {
    expect(spentBranches(MARK, repo({ out: [WORKED] }))).toBeNull();
    expect(spentBranches(MARK, repo({ out: [CLAIM] }))).toBeNull();
  });

  it("is not spent while a branch holds a commit main has not got", () => {
    expect(spentBranches(MARK, repo({ local: [WORKED, CLAIM], unmerged: [WORKED] }))).toBeNull();
  });

  it("is never spent with no local ref, which is what a cloud claim looks like", () => {
    expect(spentBranches(MARK, repo({ local: [] }))).toBeNull();
  });

  it("is never spent on a mark naming the trunk, which every checkout has", () => {
    expect(spentBranches("2026-09-21, main", repo({ local: ["main"] }))).toBeNull();
  });

  it("reads a mark with no parenthesis as its one branch", () => {
    const plain = `2026-09-22, ${CLAIM}`;
    expect(spentBranches(plain, repo({}))).toEqual([CLAIM]);
    expect(spentBranches(plain, repo({ out: [CLAIM] }))).toBeNull();
  });
});
