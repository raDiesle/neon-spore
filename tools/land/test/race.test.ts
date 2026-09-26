import { expect, describe as group, test } from "bun:test";
import { type LandState, plan } from "../land.js";
import { trunkMove, trunkRaced } from "../race.js";

/**
 * The gap nothing was holding. A landing rebases, spends minutes in
 * `bun run check`, and only then moves the trunk — and in a clone the move is
 * `git branch --force`, which will happily point `main` at a commit built on a
 * trunk that has since been landed on by somebody else. That is the one shape
 * where a lane is discarded without a word.
 */
group("trunkRaced", () => {
  test("a trunk that has not moved is not a race", () => {
    expect(trunkRaced("main", "a".repeat(40), "a".repeat(40))).toBeUndefined();
  });

  test("a trunk that moved is refused, naming the sha that arrived", () => {
    const said = trunkRaced("main", "1234567890abcdef", "fedcba0987654321");
    expect(said).toContain("1234567");
    expect(said).toContain("fedcba0");
    expect(said).toContain("Nothing was moved");
  });

  test("a sha that could not be read is not grounds for a refusal", () => {
    expect(trunkRaced("main", "", "fedcba0987654321")).toBeUndefined();
    expect(trunkRaced("main", "1234567890abcdef", "")).toBeUndefined();
  });
});

/**
 * The same gap from the holder's side. The plan read "nothing holds the
 * trunk" and chose a ref move; during the check the main checkout switched
 * onto `main`, and `git branch --force` refused after a green check
 * (26 September 2026). The holder is asked again beside `trunkRaced`, and the
 * second answer is the one the trunk is moved by.
 */
group("trunkMove", () => {
  const cloud: LandState = {
    branch: "claude/lane-1",
    trunk: "main",
    dirty: [],
    ahead: 1,
    behind: 0,
    trunkTree: "",
    trunkDirty: [],
    trunkStaged: [],
    hasOrigin: true,
    trunkStale: 0,
    noPush: false,
    forcePush: false,
    keep: false,
    sweepOnly: false,
  };

  test("a holder that appears after the plan takes the fast-forward, and says so", () => {
    const going = plan(cloud);
    expect(going.go && going.moveRef).toBe(true);
    const move = trunkMove("main", cloud.trunkTree, "/repo");
    expect(move.tree).toBe("/repo");
    expect(move.said).toContain("/repo took main");
  });

  test("a holder that lets go during the check is not sent a merge", () => {
    const move = trunkMove("main", "/repo", "");
    expect(move.tree).toBe("");
    expect(move.said).toContain("moving the ref");
  });

  test("a holder that stayed where the plan found it is said nothing about", () => {
    expect(trunkMove("main", "/repo", "/repo")).toEqual({ tree: "/repo" });
    expect(trunkMove("main", "", "")).toEqual({ tree: "" });
  });
});
