import { describe, expect, test } from "bun:test";
import { doneTwice, doneTwiceSaid } from "../done-twice.js";

/** An entry both the lane and the trunk took out is said at landing (`done-twice.ts`). */

const BASE = "# Queue\n\n## §34 THE CYST\n\nBuild it.\n\n## Other\n\nStill here.\n";
const GONE = "# Queue\n\n## Other\n\nStill here.\n";

describe("an entry done twice", () => {
  test("is one both sides took out, and only that", () => {
    expect(doneTwice(BASE, GONE, GONE)).toEqual(["§34 THE CYST"]);
    expect(doneTwice(BASE, BASE, GONE)).toEqual([]);
    expect(doneTwice(BASE, GONE, BASE)).toEqual([]);
  });

  test("is said with the commit the trunk took it out in", async () => {
    const asked: string[][] = [];
    const run = async (args: string[]) => {
      asked.push(args);
      return args[0] === "show" ? GONE : "abc1234 §34 THE CYST, the simulation lane";
    };
    const shots = [{ file: "docs/queue.md", base: BASE, trunk: GONE }];
    const lines = await doneTwiceSaid(shots, "base", "main", run);
    expect(lines).toEqual([
      '  ⚑ docs/queue.md: "§34 THE CYST" was already done on the trunk by abc1234 §34 THE CYST, the simulation lane',
    ]);
    expect(asked[1]).toContain("base..main");
  });
});
